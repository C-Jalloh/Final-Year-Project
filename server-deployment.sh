#!/bin/bash
# CHELAL HMS Deployment Script for Company Server
# Run this on your company server: nma-server-dev

echo "=== CHELAL HMS Server Deployment ==="
echo "Setting up production environment..."
echo ""

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# Install Node.js for React frontend (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup PostgreSQL
echo "Setting up PostgreSQL database..."
sudo -u postgres createuser --createdb --superuser $USER
createdb chelal_hms

# Clone repository (if not already cloned)
echo "Cloning repository..."
cd ~
git clone https://github.com/C-Jalloh/Final-Year-Project.git chelal-hms
cd chelal-hms

# Setup Python virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
cd chelalBackend
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Setup Django
echo "Setting up Django..."
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser (interactive)
echo "Creating Django superuser..."
python manage.py createsuperuser

echo ""
echo "=== Backend Setup Complete ==="
echo "Your Django backend is ready!"
echo ""

# Setup Nginx
echo "Setting up Nginx..."
sudo tee /etc/nginx/sites-available/chelal-hms <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/$USER/chelal-hms/chelal-hms.sock;
    }

    location /static/ {
        alias /home/$USER/chelal-hms/chelalBackend/static/;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/chelal-hms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=== Nginx Setup Complete ==="
echo "Web server configured!"
echo ""

echo "=== Next Steps ==="
echo "1. Buy a domain name and point it to your server's IP"
echo "2. Run SSL setup: sudo certbot --nginx -d your-domain.com"
echo "3. Start the application: Run the start script"
echo "4. Setup React frontend if needed"
echo ""

echo "=== Useful Commands ==="
echo "Start app: cd ~/chelal-hms && source venv/bin/activate && cd chelalBackend && gunicorn --bind unix:chelal-hms.sock Backend.wsgi"
echo "Stop app: pkill gunicorn"
echo "Check logs: sudo journalctl -u nginx"
echo "Restart nginx: sudo systemctl restart nginx"