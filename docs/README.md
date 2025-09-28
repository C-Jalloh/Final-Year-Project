# 📚 Chelal HMS Documentation

## 🚀 **Quick Start - Run Everything with One Command**

```bash
cd /path/to/chelal-hms && docker-compose up -d --build
```

**System will be available at:**
- Main App: http://localhost
- React Frontend: http://localhost:3000  
- Vue Frontend: http://localhost:5173
- Django Backend: http://localhost:8000

## 📋 Essential Guides

- **[🚀 Quick Start Guide](setup/QUICK_START.md)** - Get running in 5 minutes
- **[📋 Complete Deployment](setup/DEPLOYMENT.md)** - Full production setup
- **[🐳 Docker Setup](setup/docker-setup.md)** - Container configuration

## ✅ Project Status

- ✅ **React Frontend** - Fixed dependency conflicts, ready
- ✅ **Vue Frontend** - Vite-based, ready  
- ✅ **Django Backend** - REST API, ready
- ✅ **Docker Multi-service** - All 7 services containerized
- ✅ **Documentation** - Complete setup guides
- ✅ **One-Command Deploy** - `docker-compose up -d --build`

## Overview

This documentation provides comprehensive information about the Chelal Hospital Management System (HMS), a full-stack healthcare management application with multiple frontend implementations.

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file - main documentation index
├── architecture/               # System architecture and design
│   ├── overview.md            # High-level system overview
│   ├── components.md          # Component breakdown
│   ├── data-model.md          # Database schema and relationships
│   └── patterns.md            # Design patterns and conventions
├── setup/                     # Setup and installation guides
│   ├── prerequisites.md       # System requirements
│   ├── backend-setup.md       # Django backend setup
│   ├── frontend-setup.md      # Frontend setup (all variants)
│   ├── database-setup.md      # Database configuration
│   └── docker-setup.md        # Docker deployment
├── api/                       # API documentation
│   ├── overview.md            # API architecture
│   ├── authentication.md      # Authentication and authorization
│   ├── endpoints.md           # API endpoints reference
│   └── postman-collection.md  # Postman collection guide
├── frontend/                  # Frontend documentation
│   ├── vue-frontend.md        # Vue.js implementation
│   ├── react-frontend.md      # React/Next.js implementation
│   ├── billing-system.md      # Complete billing system documentation
│   ├── legacy-frontend.md     # Legacy Vue.js implementation
│   ├── components.md          # Shared components
│   └── routing.md             # Frontend routing
├── backend/                   # Backend documentation
│   ├── django-backend.md      # Django application structure
│   ├── models.md              # Database models
│   ├── views.md               # API views and endpoints
│   ├── services.md            # Business logic services
│   └── tasks.md               # Background tasks (Celery)
├── database/                  # Database documentation
│   ├── schema.md              # Database schema
│   ├── migrations.md          # Migration history
│   └── queries.md             # Common queries and optimizations
├── deployment/                # Deployment documentation
│   ├── docker.md              # Docker deployment
│   ├── production.md          # Production deployment
│   ├── ci-cd.md               # CI/CD pipelines
│   └── monitoring.md          # Monitoring and logging
└── troubleshooting/           # Troubleshooting guides
    ├── common-issues.md       # Frequently encountered problems
    ├── debugging.md           # Debugging techniques
    ├── logs.md                # Log analysis
    └── support.md             # Getting help
```

## 🚀 Quick Start

1. **Prerequisites**: Check [setup/prerequisites.md](setup/prerequisites.md)
2. **Backend Setup**: Follow [setup/backend-setup.md](setup/backend-setup.md)
3. **Frontend Setup**: Choose your preferred frontend:
   - Vue.js: [setup/frontend-setup.md](setup/frontend-setup.md)
   - React: [frontend/react-frontend.md](frontend/react-frontend.md)
4. **Database**: Configure using [setup/database-setup.md](setup/database-setup.md)

## 📋 Current Project Status

### ✅ What's Working

- Django backend with comprehensive API
- PostgreSQL database with full schema
- Docker containerization for all services
- JWT authentication system
- Role-based access control
- Vue.js and React frontends
- Google Calendar integration
- Automated deployment scripts
- Complete documentation suite

### ⚠️ Known Issues

- Multiple frontend implementations (3 different versions)
- Inconsistent project structure
- Authentication flow inconsistencies
- Missing comprehensive testing

### 🔄 In Progress

- Documentation consolidation
- Code structure standardization
- Testing framework implementation
- CI/CD pipeline setup

## 🎯 Key Features

- **Patient Management**: Complete patient lifecycle management
- **Appointment Scheduling**: Advanced booking with Google Calendar integration
- **Clinical Encounters**: Comprehensive clinical documentation
- **Pharmacy Management**: Inventory, procurement, and dispensing
- **Billing & Insurance**: Financial operations and insurance integration
- **Real-time Notifications**: WebSocket-based notifications
- **Multi-language Support**: English, French, Swahili
- **Audit Logging**: Complete security and activity tracking
- **Docker Containerization**: Complete multi-service setup
- **Google Calendar Integration**: Seamless appointment-calendar sync

## 👥 User Roles

- **Admin**: Full system access and configuration
- **Doctor**: Patient care and clinical operations
- **Receptionist**: Appointment scheduling and patient registration
- **Pharmacist**: Pharmacy inventory and dispensing
- **Nurse**: Clinical support and patient care

## 🛠️ Technology Stack

### Backend

- Django 4.2+ with Django REST Framework
- PostgreSQL database
- Redis for caching and task queue
- Celery for background tasks
- JWT authentication

### Frontend (Primary - Vue.js)

- Vue 3.5.13 with TypeScript
- Vue Router 4 and Vuex 4
- Vite build system
- Tailwind CSS + PostCSS
- Axios for API communication

### Frontend (Alternative - React)

- Next.js 15.2.4 with React 19
- Radix UI component library
- Tailwind CSS
- React Hook Form

## 📞 Support

For issues and questions:

1. Check [troubleshooting/common-issues.md](troubleshooting/common-issues.md)
2. Review [troubleshooting/debugging.md](troubleshooting/debugging.md)
3. Check logs using [troubleshooting/logs.md](troubleshooting/logs.md)

## 📝 Contributing

When making changes to the codebase:

1. Update relevant documentation
2. Add tests for new features
3. Follow the established patterns
4. Document any breaking changes

## 📊 Project Metrics

- **Backend**: ~600+ lines of Django models and views
- **Frontend (Vue)**: ~40+ Vue components and views
- **Frontend (React)**: ~30+ React components with TypeScript (including billing system)
- **Database**: ~25+ tables with complex relationships
- **API Endpoints**: ~60+ RESTful endpoints (including billing APIs)
- **User Roles**: 5 distinct role types
- **Languages**: 3 supported languages
- **Docker Services**: 7 containerized services
- **Documentation**: 2,000+ lines of comprehensive guides
- **Google Calendar Integration**: Complete appointment sync
- **Billing System**: Complete financial management with 4 new components

---

**Last Updated**: September 20, 2025
**Version**: 1.1.0
**Status**: Billing system implementation completed

## 📋 Recent Major Updates (September 20, 2025)

### ✅ Completed Achievements
- **React Build Fixes**: Resolved JSX syntax errors and import path issues
- **Google Calendar Integration**: Complete calendar service with appointment sync
- **Billing System Implementation**: Comprehensive billing and payment management system
- **Docker Containerization**: Full multi-service setup with automation scripts
- **Documentation Suite**: Comprehensive guides for setup, deployment, and development

### 🏗️ New Features Added

- **Multi-Service Docker Environment**: React, Vue, Django, PostgreSQL, Redis, Nginx
- **Automated Scripts**: Startup, cleanup, and health check automation
- **Google Calendar API**: Event management and appointment synchronization
- **Complete Billing System**: Bill creation, payment processing, financial reporting
- **Production Ready**: Gunicorn, persistent volumes, health monitoring

### 📚 Documentation Updates

- **Docker Setup Guide**: Complete containerization documentation
- **React Frontend Guide**: Implementation details and Google Calendar integration
- **Billing System Documentation**: Complete billing module documentation
- **Session Summary**: Comprehensive changelog of all completed work
- **Updated Project Metrics**: Current codebase and service statistics
