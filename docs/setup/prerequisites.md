# 🔧 Prerequisites

This document outlines the system requirements and dependencies needed to run the Chelal Hospital Management System.

## System Requirements

### Minimum Hardware Requirements

| Component | Development | Production |
|-----------|-------------|------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 10GB | 50GB+ SSD |
| **Network** | 10 Mbps | 100 Mbps+ |

### Recommended Hardware Requirements

| Component | Development | Production |
|-----------|-------------|------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 8GB | 16GB+ |
| **Storage** | 20GB SSD | 100GB+ SSD |
| **Network** | 25 Mbps | 1 Gbps |

## Operating System Support

### Primary Support

- **Ubuntu 20.04 LTS or later**
- **macOS 12.0 or later**
- **Windows 10/11 with WSL2**

### Secondary Support

- **CentOS/RHEL 8+**
- **Debian 11+**
- **Fedora 35+**

## Required Software

### Core Dependencies

#### Python Environment

```bash
# Python 3.10 or 3.11 (3.12+ not recommended for Django 4.2)
python --version  # Should show 3.10.x or 3.11.x

# pip (Python package manager)
pip --version

# virtualenv (recommended)
pip install virtualenv
```

#### Node.js Environment

```bash
# Node.js 18+ and npm
node --version  # Should show v18.x.x or later
npm --version   # Should show 8.x.x or later

# yarn (optional, alternative to npm)
npm install -g yarn
```

#### Database

```bash
# PostgreSQL 15+
psql --version  # Should show 15.x.x

# Alternative: Use Docker for PostgreSQL
docker --version  # Should show 20.x.x or later
```

### Development Tools

#### Version Control

```bash
# Git 2.30+
git --version

# Git LFS (for large files)
git lfs install
```

#### Code Editors

- **Visual Studio Code** (recommended)
- **PyCharm Professional** (Python development)
- **WebStorm** (JavaScript/TypeScript development)

#### Docker & Container Tools

```bash
# Docker Engine
docker --version

# Docker Compose
docker-compose --version

# Docker Desktop (GUI for Windows/macOS)
```

### API Testing Tools

#### Postman

```bash
# Download from: https://www.postman.com/downloads/
# Import collection: chelal_backend_api.postman_collection.json
```

#### Alternative API Tools

- **Insomnia**
- **Thunder Client** (VS Code extension)
- **HTTPie** (command line)

## Environment Setup

### 1. Python Virtual Environment

```bash
# Create virtual environment
python -m venv chelal_env

# Activate virtual environment
# Linux/macOS:
source chelal_env/bin/activate
# Windows:
chelal_env\Scripts\activate

# Verify activation
which python  # Should point to virtual environment
```

### 2. Node.js Version Management (Optional)

```bash
# Using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3. PostgreSQL Setup

#### Option A: Native PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE chelal_db;
CREATE USER chelal_user WITH PASSWORD 'chelal_password';
GRANT ALL PRIVILEGES ON DATABASE chelal_db TO chelal_user;
\q
```

#### Option B: Docker PostgreSQL Installation

```bash
# Run PostgreSQL in Docker
docker run --name chelal-postgres \
  -e POSTGRES_DB=chelal_db \
  -e POSTGRES_USER=chelal_user \
  -e POSTGRES_PASSWORD=chelal_password \
  -p 5433:5432 \
  -d postgres:15

# Verify connection
docker exec -it chelal-postgres psql -U chelal_user -d chelal_db
```

### 4. Redis Setup

#### Option A: Native Redis Installation

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Option B: Docker Redis Installation

```bash
# Run Redis in Docker
docker run --name chelal-redis \
  -p 6379:6379 \
  -d redis:alpine
```

## Network Configuration

### Firewall Settings

#### Development Environment

```bash
# Allow local connections
sudo ufw allow 8000  # Django backend
sudo ufw allow 3000  # Vue.js frontend
sudo ufw allow 5433  # PostgreSQL (Docker)
sudo ufw allow 6379  # Redis
```

#### Production Environment

```bash
# Allow web traffic
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 22    # SSH (restrict to specific IPs)
```

### DNS Configuration (Production)

```nginx
# Example nginx configuration
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Prerequisites

### SSL/TLS Certificates

#### Development

```bash
# Self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

#### Production

- **Let's Encrypt** (free SSL certificates)
- **Commercial SSL certificates**
- **Internal CA certificates** (enterprise)

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://chelal_user:chelal_password@localhost:5433/chelal_db

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Performance Tuning

### PostgreSQL Configuration

```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Redis Configuration

```redis
# redis.conf optimizations
maxmemory 256mb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 300
```

## Monitoring Setup

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nmon

# Optional: Prometheus + Grafana
# Follow: https://prometheus.io/docs/introduction/getting_started/
```

### Application Monitoring

- **Django Debug Toolbar** (development)
- **Sentry** (error tracking)
- **New Relic** (application performance)
- **DataDog** (infrastructure monitoring)

## Troubleshooting

### Common Issues

#### Python Virtual Environment Issues

```bash
# If virtualenv is not working
python -m pip install --user virtualenv
export PATH=$PATH:~/.local/bin

# Recreate virtual environment
rm -rf chelal_env
python -m venv chelal_env
source chelal_env/bin/activate
```

#### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U chelal_user -d chelal_db -h localhost -p 5433

# Reset password if needed
sudo -u postgres psql
ALTER USER chelal_user PASSWORD 'chelal_password';
```

#### Node.js Version Issues

```bash
# If npm install fails
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check Logs**: Review application and system logs
2. **Documentation**: Refer to troubleshooting guides
3. **Community**: Check GitHub issues and discussions
4. **Support**: Contact development team

---

**Last Updated**: September 17, 2025
**Tested On**: Ubuntu 22.04 LTS, Python 3.11, Node.js 18.x
