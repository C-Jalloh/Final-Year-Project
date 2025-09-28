# Frontend Setup Guide

## Vue.js Frontend Setup

### Prerequisites

- **Node.js**: 18.0.0 or later
- **npm**: 8.0.0 or later (comes with Node.js)
- **Git**: 2.30.0 or later
- **Backend API**: Running on `http://localhost:8000`

### Installation Steps

#### 1. Clone and Navigate

```bash
git clone <repository-url>
cd chelal-hms-vue
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Vue 3.5.13
- Vue Router 4
- Vuex 4
- Axios
- Tailwind CSS
- TypeScript
- Vite

#### 3. Environment Configuration

Create `.env` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=Chelal HMS
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_PORT=3000
```

#### 4. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## React/Next.js Frontend Setup

### Prerequisites

- **Node.js**: 18.0.0 or later
- **npm**: 8.0.0 or later
- **Backend API**: Running on `http://localhost:8000`

### Installation Steps

#### 1. Clone and Navigate

```bash
git clone <repository-url>
cd chelal-hms
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Configuration

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Chelal HMS
```

#### 4. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Configuration Details

### Vue.js Configuration

#### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

#### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### API Integration

#### Axios Configuration

```typescript
// src/services/apiClient.ts
import axios from 'axios'
import store from '@/store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getters.getToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      store.dispatch('logout')
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

#### Authentication Service

```typescript
// src/services/authService.ts
import apiClient from './apiClient'

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/', { email, password })
  return response.data
}

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await apiClient.post('/auth/refresh/', { refresh: refreshToken })
  return response.data
}

export const getProfile = async (token: string) => {
  const response = await apiClient.get('/users/me/', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}
```

## Vue Router Configuration

### Route Definitions

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingPage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/app',
    component: () => import('@/components/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'patients',
        name: 'Patients',
        component: () => import('@/views/PatientsView.vue'),
        meta: { roles: ['Admin', 'Receptionist', 'Doctor', 'Nurse'] },
      },
      // ... more routes
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const allowedRoles = to.meta.roles as string[] | undefined
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.getUserRole

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    next('/access-denied')
  } else {
    next()
  }
})

export default router
```

## Vuex Store Configuration

### Store Structure

```typescript
// src/store/index.ts
import { createStore } from 'vuex'

interface State {
  token: string | null
  refreshToken: string | null
  user: any | null
}

const store = createStore({
  state: (): State => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: null,
  }),
  mutations: {
    setToken(state: State, token: string) {
      state.token = token
      localStorage.setItem('token', token)
    },
    setRefreshToken(state: State, refreshToken: string) {
      state.refreshToken = refreshToken
      localStorage.setItem('refreshToken', refreshToken)
    },
    setUser(state: State, user: any) {
      state.user = user
    },
    logout(state: State) {
      state.token = null
      state.refreshToken = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
  actions: {
    async fetchUser({ commit, state }) {
      if (state.token) {
        try {
          const user = await getProfile(state.token)
          commit('setUser', user)
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }
    },
    // ... more actions
  },
  getters: {
    isAuthenticated: (state: State) => !!state.token,
    getUser: (state: State) => state.user,
    getToken: (state: State) => state.token,
    getRefreshToken: (state: State) => state.refreshToken,
    getUserRole: (state: State) => state.user?.role?.name || null,
  },
})

export default store
```

## Component Structure

### Main Layout Component

```vue
<!-- src/components/MainLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <!-- Navigation content -->
    </nav>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>
```

### View Components

```vue
<!-- src/views/DashboardView.vue -->
<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>

    <!-- Dashboard widgets -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Stats cards -->
    </div>

    <!-- Charts and tables -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/services/apiClient'

// Component logic
</script>
```

## Styling with Tailwind CSS

### Global Styles

```css
/* src/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
}
```

### Component-Specific Styles

```vue
<template>
  <button class="btn btn-primary">
    Click me
  </button>
</template>
```

## Testing Setup

### Unit Tests with Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

### Component Test Example

```typescript
// src/components/__tests__/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      props: { msg: 'Hello Vitest' }
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Development Workflow

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
```

### Git Hooks (Optional)

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### CORS Issues

Ensure backend allows frontend origin:

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

#### API Connection Issues

Check environment variables and backend status:

```bash
# Check backend
curl http://localhost:8000/api/health/

# Check environment
echo $VITE_API_BASE_URL
```

### Performance Optimization

#### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer
npm run build -- --mode analyze
```

#### Code Splitting

```typescript
// Lazy load routes
const Dashboard = () => import('@/views/DashboardView.vue')
const Patients = () => import('@/views/PatientsView.vue')
```

#### Image Optimization

```vue
<template>
  <img
    :src="imageSrc"
    loading="lazy"
    :alt="altText"
  />
</template>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsiveness

The application is built with mobile-first design:

- Responsive grid layouts
- Touch-friendly interfaces
- Adaptive navigation
- Optimized forms for mobile

## Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management
