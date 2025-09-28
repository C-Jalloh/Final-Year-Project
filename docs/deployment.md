# Deployment Guide

## Docker Compose
- Services: PostgreSQL, Redis, Django backend, frontend
- Use `docker-compose up -d` to start all services

## Production
- Use Gunicorn for backend
- Nginx for static files and reverse proxy
- Environment variables for secrets

## Monitoring
- Use logs and health checks for all services
