# CHELAL HMS Ubuntu Server Deployment

Complete guide to deploy CHELAL HMS on Ubuntu server with native services (no Docker).

## 🚀 Quick Start

```bash
# Clone your repository
git clone https://github.com/C-Jalloh/Final-Year-Project.git
cd Final-Year-Project

# Make script executable and run
chmod +x ubuntu-deploy.sh
sudo ./ubuntu-deploy.sh
```

## 📋 Prerequisites

- Ubuntu 20.04/22.04 server
- Root or sudo access
- Domain name (brikamahms.org) pointing to your server
- At least 2GB RAM, 20GB storage

## 🏗️ What Gets Installed

### Services

- **PostgreSQL 15** - Database
- **Redis** - Caching & Celery broker
- **Django Backend** - API server (Gunicorn)
- **React Frontend** - Next.js application
- **Nginx** - Reverse proxy & static files
- **Supervisor** - Process management
- **Certbot** - SSL certificates

### Security

- UFW firewall configuration
- Nginx security headers
- PostgreSQL access restrictions

## 🔧 Manual Configuration

### 1. Domain DNS Setup

Point your domain to your server's IP:

```text
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300
```

### 2. SSL Certificate

After deployment, enable HTTPS:

```bash
sudo certbot --nginx -d brikamahms.org -d www.brikamahms.org
```

### 3. Environment Variables

Edit `/opt/chelal-hms/chelalBackend/.env` if needed:

```bash
DJANGO_SETTINGS_MODULE=Backend.settings
DATABASE_URL=postgresql://chelal_user:chelal_password@localhost:5432/chelal_db
SECRET_KEY=your-secret-key-here
DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,brikamahms.org,www.brikamahms.org
```

## 📊 Service Management

### Check Status

```bash
sudo supervisorctl status
```

### Restart Services

```bash
sudo supervisorctl restart all
```

### View Logs

```bash
# Backend logs
sudo supervisorctl tail -f chelal-backend

# Frontend logs
sudo supervisorctl tail -f chelal-frontend

# Celery logs
sudo supervisorctl tail -f chelal-celery
```

### Individual Service Control

```bash
sudo supervisorctl restart chelal-backend
sudo supervisorctl stop chelal-frontend
sudo supervisorctl start chelal-celery
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 80/443 already in use**

   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **Permission errors**

   ```bash
   sudo chown -R www-data:www-data /opt/chelal-hms
   ```

3. **Database connection failed**

   ```bash
   sudo -u postgres psql
   \l  # list databases
   \c chelal_db  # connect to database
   ```

4. **Services not starting**

   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   ```

### Logs Locations

- **Nginx**: `/var/log/nginx/`
- **Supervisor**: `/var/log/supervisor/`
- **Django**: `/opt/chelal-hms/chelalBackend/logs/`
- **PostgreSQL**: `/var/log/postgresql/`

## 🔄 Updates & Maintenance

### Update Application

```bash
cd /opt/chelal-hms
git pull origin master
sudo supervisorctl restart all
```

### Backup Database

```bash
sudo -u postgres pg_dump chelal_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### System Updates

```bash
sudo apt update && sudo apt upgrade
sudo reboot
```

## 🌐 Access Points

After successful deployment:

- **Main Application**: `https://brikamahms.org`
- **API Endpoints**: `https://brikamahms.org/api/`
- **Admin Panel**: `https://brikamahms.org/admin/`
- **Health Check**: `https://brikamahms.org/api/health/`

## 👤 Default Admin Credentials

- **Username**: admin
- **Email**: admin@brikamahms.org
- **Password**: admin123

⚠️ **Change these credentials immediately after first login!**

## 📞 Support

If you encounter issues:

1. Check service status: `sudo supervisorctl status`
2. Review logs: `sudo supervisorctl tail -f [service-name]`
3. Check nginx config: `sudo nginx -t`
4. Verify firewall: `sudo ufw status`

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Enabled SSL certificate
- [ ] Configured firewall (UFW)
- [ ] Updated system packages regularly
- [ ] Monitored logs for suspicious activity
- [ ] Set up automated backups

## 📈 Performance Tuning

### Nginx Optimization

Edit `/etc/nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_connections 1024;
```

### Django Settings

For production, adjust in `Backend/settings.py`:

```python
# Gunicorn workers = CPU cores * 2 + 1
# Adjust based on your server specs
```

### Database Tuning

Edit `/etc/postgresql/15/main/postgresql.conf`:

```ini
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

## 🚀 Production Deployment

For production environments:

1. Use a dedicated database server
2. Implement load balancing
3. Set up monitoring (Prometheus/Grafana)
4. Configure log aggregation
5. Implement backup strategy
6. Set up CI/CD pipeline

---

**Deployment completed successfully!** 🎉

Your CHELAL HMS is now running at `https://brikamahms.org`
