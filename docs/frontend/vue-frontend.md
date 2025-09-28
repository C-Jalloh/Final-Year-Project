# Vue.js Frontend Documentation

## Overview

The primary frontend implementation uses Vue 3 with TypeScript, providing a modern, responsive interface for the Chelal Hospital Management System.

## Technology Stack

- **Vue 3.5.13**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Vuex 4**: State management
- **Vue Router 4**: Client-side routing
- **Vite 6.3.5**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client with JWT authentication
- **Chart.js**: Data visualization

## Project Structure

```
chelal-hms-vue/
├── src/
│   ├── components/          # Reusable Vue components
│   ├── views/              # Page-level components
│   ├── router/             # Vue Router configuration
│   ├── store/              # Vuex store modules
│   ├── services/           # API service layer
│   ├── assets/             # Static assets
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Public assets
├── index.html             # Main HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Components

### Layout Components

#### MainLayout.vue
Main application layout with:
- Navigation sidebar
- Header with user menu
- Breadcrumb navigation
- Responsive design

#### LoginView.vue
Authentication interface with:
- Email/password login
- Remember me functionality
- Password reset link
- Form validation

### Feature Components

#### PatientsView.vue
Patient management interface:
- Patient list with search/filter
- Add/edit patient forms
- Patient details view
- Medical history timeline

#### AppointmentsView.vue
Appointment scheduling:
- Calendar view
- Appointment booking
- Status management
- Doctor assignment

#### EncountersView.vue
Medical encounter documentation:
- Encounter creation
- Vital signs recording
- Diagnosis entry
- Prescription management

#### PharmacyInventoryView.vue
Pharmacy management:
- Inventory tracking
- Stock alerts
- Purchase orders
- Dispensing logs

#### BillingView.vue
Financial management:
- Bill creation
- Payment processing
- Insurance claims
- Financial reports

## State Management (Vuex)

### Store Structure

```typescript
interface RootState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: {
    name: string;
  };
  first_name: string;
  last_name: string;
}
```

### Key Actions

- `fetchUser()`: Get current user profile
- `loginAndFetchUser()`: Authenticate and load user data
- `attemptRefreshAndRetry()`: Handle token refresh
- `logout()`: Clear session data

### Getters

- `isAuthenticated`: Check authentication status
- `getUser`: Get user object
- `getToken`: Get access token
- `getUserRole`: Get user role name

## Routing Configuration

### Route Structure

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/app',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      // Protected routes
    ],
  },
];
```

### Route Guards

- **Authentication Guard**: Redirects unauthenticated users to login
- **Role-based Guard**: Restricts access based on user roles
- **Auto-logout**: Handles session expiration

### Available Routes

| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/app/patients` | PatientsView | Admin, Receptionist, Doctor, Nurse | Patient management |
| `/app/appointments` | AppointmentsView | Admin, Receptionist, Doctor, Nurse | Appointment scheduling |
| `/app/encounters` | EncountersView | Admin, Doctor, Nurse | Medical encounters |
| `/app/prescriptions` | PrescriptionsView | Admin, Doctor, Nurse | Prescription management |
| `/app/billing` | BillingView | Admin, Receptionist | Billing and payments |
| `/app/pharmacy` | PharmacyInventoryView | Admin, Pharmacist | Pharmacy inventory |
| `/app/dashboard` | DashboardView | All | Main dashboard |

## API Integration

### Service Layer

#### authService.ts
Authentication services:
- `login()`: User authentication
- `refreshAccessToken()`: Token refresh
- `getProfile()`: User profile retrieval
- `logout()`: Session cleanup

#### apiClient.ts
HTTP client configuration:
- Base URL configuration
- JWT token attachment
- Automatic token refresh
- Error handling

### API Endpoints Integration

All major API endpoints are integrated:
- User management
- Patient records
- Appointments
- Medical encounters
- Pharmacy operations
- Billing system
- Notifications

## UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Adaptive layouts

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support

### User Experience
- Loading states
- Error handling
- Success notifications
- Form validation
- Auto-save functionality

## Development Workflow

### Development Server
```bash
npm run dev
```
Starts Vite dev server with hot reload

### Build Process
```bash
npm run build
```
Creates optimized production build

### Linting
```bash
npm run lint
```
Runs ESLint for code quality

### Type Checking
```bash
npm run type-check
```
Runs TypeScript compiler check

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

### tailwind.config.js
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Key Features

### Real-time Updates
- WebSocket integration for live notifications
- Real-time appointment updates
- Live dashboard data

### Offline Support
- Service worker for caching
- Offline data synchronization
- Progressive Web App (PWA) capabilities

### Security Features
- JWT token management
- XSS protection
- CSRF protection
- Secure local storage

### Performance Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

## Testing

### Unit Tests
- Vue Test Utils for component testing
- Jest for test runner
- Mock API responses

### E2E Tests
- Playwright for end-to-end testing
- User journey validation

## Deployment

### Docker Integration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Production Build
- Optimized bundle size
- Asset optimization
- CDN integration
- Service worker deployment
