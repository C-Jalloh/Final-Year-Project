#!/bin/bash
# CHELAL HMS Ubuntu Server Deployment Script
# This script sets up the entire CHELAL HMS system on Ubuntu server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="brikamahms.org"
DB_NAME="chelal_db"
DB_USER="chelal_user"
DB_PASSWORD="chelal_password"
PROJECT_DIR="/opt/chelal-hms"
BACKEND_DIR="$PROJECT_DIR/chelalBackend"
FRONTEND_DIR="$PROJECT_DIR/chelal-hms-react"

echo -e "${BLUE}🚀 CHELAL HMS Ubuntu Server Deployment${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Update system
echo -e "${BLUE}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# Install required packages
echo -e "${BLUE}Installing required packages...${NC}"
sudo apt install -y \
    postgresql postgresql-contrib \
    redis-server \
    python3 python3-pip python3-venv \
    nodejs npm \
    nginx \
    certbot python3-certbot-nginx \
    git \
    curl \
    ufw \
    supervisor \
    build-essential \
    libpq-dev \
    python3-dev

print_status "Required packages installed"

# Setup PostgreSQL
echo -e "${BLUE}Setting up PostgreSQL...${NC}"

# Find PostgreSQL version and config path
PG_VERSION=$(ls /etc/postgresql/ | head -1)
if [ -z "$PG_VERSION" ]; then
    echo -e "${RED}PostgreSQL not found. Installing...${NC}"
    sudo apt install -y postgresql postgresql-contrib
    PG_VERSION=$(ls /etc/postgresql/ | head -1)
fi

PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

echo -e "${BLUE}Using PostgreSQL version: $PG_VERSION${NC}"
echo -e "${BLUE}Config file: $PG_CONF${NC}"

# Create database and user
echo -e "${BLUE}Creating database and user...${NC}"

# Drop existing user and database if they exist
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true

# Create user and database
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Configure PostgreSQL for local access
if [ -f "$PG_CONF" ]; then
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/g" "$PG_CONF"
    echo "host $DB_NAME $DB_USER 127.0.0.1/32 md5" | sudo tee -a "$PG_HBA"
    sudo systemctl restart postgresql
else
    echo -e "${YELLOW}Warning: PostgreSQL config file not found at $PG_CONF${NC}"
fi

# Setup Redis
echo -e "${BLUE}Setting up Redis...${NC}"
sudo systemctl enable redis-server
sudo systemctl start redis-server
print_status "Redis configured"

# Create project directory
echo -e "${BLUE}Creating project directory...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
print_status "Project directory created"

# Clone or copy project files (assuming they're already there)
echo -e "${BLUE}Setting up project files...${NC}"
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR
print_status "Project files copied"

# Setup Python virtual environment for backend
echo -e "${BLUE}Setting up Python environment...${NC}"
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
print_status "Python environment configured"

# Setup Django
echo -e "${BLUE}Setting up Django backend...${NC}"
export DJANGO_SETTINGS_MODULE=Backend.settings
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
export SECRET_KEY="$(openssl rand -base64 32)"
export DEBUG=False
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,$DOMAIN,www.$DOMAIN"

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser (optional - will prompt)
echo -e "${YELLOW}Creating Django superuser...${NC}"
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@$DOMAIN', 'admin123')" | python manage.py shell || true

print_status "Django backend configured"

# Setup Node.js for frontend
echo -e "${BLUE}Setting up React frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build
print_status "React frontend built"

# Configure Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/chelal-hms <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (React)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /static {
        alias $BACKEND_DIR/staticfiles;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media {
        alias $BACKEND_DIR/media;
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/chelal-hms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx configured"

# Setup Supervisor for process management
echo -e "${BLUE}Setting up Supervisor...${NC}"

# Django backend
sudo tee /etc/supervisor/conf.d/chelal-backend.conf <<EOF
[program:chelal-backend]
directory=$BACKEND_DIR
command=$BACKEND_DIR/venv/bin/gunicorn Backend.wsgi:application --bind 127.0.0.1:8000 --workers 2 --threads 4
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
environment=DJANGO_SETTINGS_MODULE=Backend.settings,DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME",SECRET_KEY="$SECRET_KEY",DEBUG=False,DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,$DOMAIN,www.$DOMAIN"
EOF

# React frontend
sudo tee /etc/supervisor/conf.d/chelal-frontend.conf <<EOF
[program:chelal-frontend]
directory=$FRONTEND_DIR
command=npm start
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
environment=NODE_ENV=production,NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
EOF

# Celery worker
sudo tee /etc/supervisor/conf.d/chelal-celery.conf <<EOF
[program:chelal-celery]
directory=$BACKEND_DIR
command=$BACKEND_DIR/venv/bin/celery -A Backend worker --loglevel=info
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
environment=DJANGO_SETTINGS_MODULE=Backend.settings,DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME",SECRET_KEY="$SECRET_KEY"
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
print_status "Supervisor configured"

# Setup firewall
echo -e "${BLUE}Configuring firewall...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
print_status "Firewall configured"

# Setup SSL certificate (optional)
echo -e "${YELLOW}SSL Certificate Setup (Optional)${NC}"
echo -e "${YELLOW}Run this command manually after testing HTTP:${NC}"
echo -e "${YELLOW}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"

# Create deployment info file
cat > $PROJECT_DIR/deployment-info.txt <<EOF
CHELAL HMS Deployment Information
=================================

Domain: $DOMAIN
Database: $DB_NAME
DB User: $DB_USER
Project Directory: $PROJECT_DIR

Services:
- Django Backend: http://127.0.0.1:8000
- React Frontend: http://127.0.0.1:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Nginx: Port 80/443

Admin Credentials:
Username: admin
Email: admin@$DOMAIN
Password: admin123

To check service status:
sudo supervisorctl status

To restart services:
sudo supervisorctl restart all

To view logs:
sudo supervisorctl tail -f chelal-backend
sudo supervisorctl tail -f chelal-frontend

SSL Setup (run after testing):
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN
EOF

print_status "Deployment completed successfully!"

echo -e "${GREEN}"
echo "🎉 CHELAL HMS is now running on your Ubuntu server!"
echo ""
echo "Access your application at:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN (after SSL setup)"
echo ""
echo "Admin Panel: http://$DOMAIN/admin"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "Deployment info saved to: $PROJECT_DIR/deployment-info.txt"
echo ""
echo "Next steps:"
echo "1. Test the application"
echo "2. Setup SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Configure your domain DNS to point to this server"
echo "4. Update CORS settings if needed"
echo -e "${NC}"