# ⚛️ React Frontend Documentation

## Overview

The React frontend is built with Next.js 15.2.4 and React 19, providing a modern, type-safe implementation of the Chelal Hospital Management System user interface.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks + Context
- **API Communication**: Axios
- **Build Tool**: Next.js built-in bundler

### Project Structure

```
chelal-hms-react/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── appointments/            # Appointments module
│   │   ├── page.tsx            # Appointments list
│   │   └── [id]/               # Dynamic appointment details
│   ├── patients/               # Patient management
│   ├── doctors/                # Doctor management
│   └── api/                    # API routes (if needed)
├── components/                  # Reusable components
│   ├── ui/                     # Radix UI components
│   ├── layout/                 # Layout components
│   └── forms/                  # Form components
├── lib/                        # Utilities and services
│   ├── utils.ts                # Utility functions
│   ├── services/               # API service layer
│   └── validations/            # Form validations
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## 🚀 Key Features

### 1. Google Calendar Integration

#### Google Calendar Integration Overview

The React frontend includes comprehensive Google Calendar integration for appointment scheduling and management.

#### Features Implemented

- **Calendar View**: Interactive calendar displaying appointments
- **Event Creation**: Create appointments directly in Google Calendar
- **Event Synchronization**: Sync appointment changes with Google Calendar
- **Real-time Updates**: Live updates when calendar events change
- **Conflict Detection**: Automatic detection of scheduling conflicts

#### Implementation Details

##### Service Layer (`lib/services/google-calendar.ts`)

```typescript
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

class GoogleCalendarService {
  private calendarId: string;
  private apiKey: string;

  constructor(calendarId: string, apiKey: string) {
    this.calendarId = calendarId;
    this.apiKey = apiKey;
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    // Implementation for fetching events
  }

  async createEvent(event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    // Implementation for creating events
  }

  async updateEvent(eventId: string, updates: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    // Implementation for updating events
  }

  async deleteEvent(eventId: string): Promise<void> {
    // Implementation for deleting events
  }
}
```

##### Calendar Component

```typescript
// components/calendar/GoogleCalendar.tsx
import { useState, useEffect } from 'react';
import { GoogleCalendarService } from '@/lib/services/google-calendar';

interface CalendarProps {
  calendarId: string;
  apiKey: string;
  onEventSelect?: (event: GoogleCalendarEvent) => void;
}

export function GoogleCalendar({ calendarId, apiKey, onEventSelect }: CalendarProps) {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new GoogleCalendarService(calendarId, apiKey);
    loadEvents();
  }, [calendarId, apiKey]);

  const loadEvents = async () => {
    try {
      const calendarEvents = await service.getEvents();
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component implementation...
}
```

#### Configuration

Environment variables required for Google Calendar integration:

```bash
# .env.local
GOOGLE_CALENDAR_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Appointment Management

#### Appointment Management Features

- **Appointment Scheduling**: Create, update, and cancel appointments
- **Calendar Integration**: Sync with Google Calendar
- **Patient Search**: Quick patient lookup and selection
- **Doctor Availability**: Real-time doctor schedule checking
- **Reminder System**: Automated appointment reminders
- **Status Tracking**: Track appointment status and history

#### Implementation

##### Appointment Service

```typescript
// lib/services/appointment.ts
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  googleEventId?: string;
}

class AppointmentService {
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    // Implementation
  }

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    // Implementation with Google Calendar sync
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    // Implementation with Google Calendar sync
  }

  async cancelAppointment(id: string): Promise<void> {
    // Implementation with Google Calendar removal
  }
}
```

### 3. Patient Management

#### Patient Management Features

- **Patient Registration**: Complete patient information capture
- **Medical History**: Comprehensive medical record keeping
- **Insurance Information**: Insurance details and coverage tracking
- **Contact Management**: Emergency contacts and communication preferences
- **Document Upload**: Medical document storage and retrieval

### 5. Billing System

#### Billing System Overview

The React frontend includes a comprehensive billing and payment management system that handles the complete financial lifecycle of healthcare services.

#### Billing Features Implemented

- **Bill Creation**: Create bills for patients with service items and pricing
- **Payment Processing**: Record payments with multiple payment methods
- **Financial Reporting**: Real-time financial statistics and KPIs
- **Service Catalog**: Pre-defined service items with automatic pricing
- **Status Tracking**: Track bill status (pending, paid, overdue, cancelled)
- **Balance Management**: Automatic balance calculation and outstanding amount tracking

#### Billing Implementation Details

##### API Integration (`lib/api-client.ts`)

```typescript
// Billing API endpoints
export const apiHelpers = {
  // ... existing endpoints ...

  // Billing
  getBills: (params?: any) =>
    apiClient.get('/bills/', { params }),

  getBill: (id: string) =>
    apiClient.get(`/bills/${id}/`),

  createBill: (data: any) =>
    apiClient.post('/bills/', data),

  updateBill: (id: string, data: any) =>
    apiClient.patch(`/bills/${id}/`, data),

  deleteBill: (id: string) =>
    apiClient.delete(`/bills/${id}/`),

  // Payments
  getPayments: (params?: any) =>
    apiClient.get('/payments/', { params }),

  createPayment: (data: any) =>
    apiClient.post('/payments/', data),

  // Service Items/Catalog
  getServiceItems: (params?: any) =>
    apiClient.get('/service-items/', { params }),

  createServiceItem: (data: any) =>
    apiClient.post('/service-items/', data),

  // Financial Reports
  getBillingStats: () =>
    apiClient.get('/report/billing-stats/'),

  getRevenueReport: (params?: any) =>
    apiClient.get('/report/revenue/', { params }),
}
```

##### Main Billing Page (`app/billing/page.tsx`)

```typescript
// Main billing dashboard with bills and payments management
export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [billingStats, setBillingStats] = useState<any>(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    const [billsResponse, paymentsResponse, statsResponse] = await Promise.all([
      apiHelpers.getBills(),
      apiHelpers.getPayments(),
      apiHelpers.getBillingStats()
    ])

    setBills(billsResponse.data || [])
    setPayments(paymentsResponse.data || [])
    setBillingStats(statsResponse.data || null)
  }

  // Component implementation with tabs for bills and payments
}
```

##### BillForm Component (`components/billing/BillForm.tsx`)

```typescript
interface BillFormProps {
  onClose: () => void
  onBillCreated: (bill: any) => void
}

export function BillForm({ onClose, onBillCreated }: BillFormProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [formData, setFormData] = useState({
    patient: '',
    due_date: '',
    notes: '',
    items: [] as BillItem[]
  })

  // Load patients and service items
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [patientsResponse, serviceItemsResponse] = await Promise.all([
      apiHelpers.getPatients(),
      apiHelpers.getServiceItems()
    ])
    setPatients(patientsResponse.data || [])
    setServiceItems(serviceItemsResponse.data || [])
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const billData = {
      patient: formData.patient,
      due_date: formData.due_date,
      notes: formData.notes,
      items: formData.items
    }
    const response = await apiHelpers.createBill(billData)
    onBillCreated(response.data)
  }

  // Component implementation with dynamic item management
}
```

##### PaymentForm Component (`components/billing/PaymentForm.tsx`)

```typescript
interface PaymentFormProps {
  bill?: Bill
  onClose: () => void
  onPaymentCreated: (payment: any) => void
}

export function PaymentForm({ bill, onClose, onPaymentCreated }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    bill: bill?.id || '',
    amount: '',
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const paymentMethods = [
    'cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const paymentData = {
      bill: formData.bill,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      notes: formData.notes
    }
    const response = await apiHelpers.createPayment(paymentData)
    onPaymentCreated(response.data)
  }

  // Component implementation with payment method selection
}
```

##### BillingStats Component (`components/billing/BillingStats.tsx`)

```typescript
interface BillingStatsProps {
  stats: {
    total_revenue?: number
    total_outstanding?: number
    total_paid?: number
    bills_count?: number
    paid_bills_count?: number
    pending_bills_count?: number
    overdue_bills_count?: number
  }
}

export function BillingStats({ stats }: BillingStatsProps) {
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue || 0),
      icon: DollarSign
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(stats.total_outstanding || 0),
      icon: AlertTriangle
    },
    // ... more stat cards
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

#### Key Components Structure

```
components/billing/
├── BillForm.tsx          # Create new bills with service items
├── BillDetails.tsx       # View bill details and record payments
├── PaymentForm.tsx       # Record payments for bills
└── BillingStats.tsx      # Financial overview and KPIs
```

#### Data Models

```typescript
interface Bill {
  id: string
  patient: {
    id: string
    first_name: string
    last_name: string
  }
  total_amount: number
  paid_amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  created_at: string
  due_date: string
  items: BillItem[]
}

interface BillItem {
  id: string
  service_item: {
    name: string
    price: number
  }
  quantity: number
  unit_price: number
  total_price: number
}

interface Payment {
  id: string
  bill: string
  amount: number
  payment_method: string
  payment_date: string
  notes?: string
}
```

#### Features

- **Comprehensive CRUD Operations**: Full create, read, update, delete for bills and payments
- **Multi-Payment Methods**: Support for cash, credit card, bank transfer, insurance, etc.
- **Real-time Calculations**: Automatic total calculations and balance tracking
- **Status Management**: Visual status indicators with overdue detection
- **Financial Reporting**: Revenue tracking and outstanding balance monitoring
- **Patient Integration**: Seamless integration with patient records
- **Service Catalog**: Pre-configured service items with pricing
- **Error Handling**: Robust error handling with fallback data
- **Responsive Design**: Mobile-friendly interface with proper loading states

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chelal-hms-react

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run format       # Format code with Prettier
npm run lint:fix     # Fix linting issues
```

## 🏗️ Build Configuration

### Next.js Configuration

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    API_URL: process.env.API_URL,
    GOOGLE_CALENDAR_API_KEY: process.env.GOOGLE_CALENDAR_API_KEY,
  },
};

export default nextConfig;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // ... more color definitions
      },
    },
  },
  plugins: [],
};

export default config;
```

## 🔐 Authentication & Security

### JWT Token Management

```typescript
// lib/auth.ts
interface AuthTokens {
  access: string;
  refresh: string;
}

class AuthService {
  private tokens: AuthTokens | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post('/auth/login', credentials);
    this.tokens = response.data.tokens;
    this.saveTokens();
    return response.data.user;
  }

  async refreshToken(): Promise<void> {
    if (!this.tokens?.refresh) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', {
      refresh: this.tokens.refresh,
    });

    this.tokens.access = response.data.access;
    this.saveTokens();
  }

  private saveTokens(): void {
    if (this.tokens) {
      localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
    }
  }

  private loadTokens(): void {
    const stored = localStorage.getItem('auth_tokens');
    if (stored) {
      this.tokens = JSON.parse(stored);
    }
  }
}
```

### API Interceptor for Token Refresh

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refreshToken();
        // Retry the original request
        return api(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📱 Responsive Design

### Mobile-First Approach

The application is built with a mobile-first responsive design using Tailwind CSS breakpoints:

```typescript
// components/layout/ResponsiveLayout.tsx
import { useState } from 'react';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex">
        <Sidebar className="w-64" />
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="pb-16">
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration and component interaction
- **E2E Tests**: Full user workflow testing

### Testing Setup

```typescript
// __tests__/components/AppointmentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';

const mockAppointment = {
  id: '1',
  patientName: 'John Doe',
  doctorName: 'Dr. Smith',
  dateTime: '2025-01-15T10:00:00Z',
  status: 'scheduled',
};

describe('AppointmentCard', () => {
  it('renders appointment details correctly', () => {
    render(<AppointmentCard appointment={mockAppointment} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<AppointmentCard appointment={mockAppointment} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockAppointment);
  });
});
```

## 🚀 Deployment

### Build Process

```bash
# Build for production
npm run build

# Export static files (optional)
npm run export
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables for Production

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.chelal-hms.com
GOOGLE_CALENDAR_API_KEY=prod_api_key
DATABASE_URL=postgresql://user:password@host:5432/db
REDIS_URL=redis://host:6379
```

## 📊 Performance Optimization

### Code Splitting

```typescript
// app/appointments/page.tsx
import dynamic from 'next/dynamic';

const AppointmentCalendar = dynamic(
  () => import('@/components/appointments/Calendar'),
  {
    loading: () => <div>Loading calendar...</div>,
    ssr: false, // Disable SSR for calendar component
  }
);

export default function AppointmentsPage() {
  return (
    <div>
      <h1>Appointments</h1>
      <AppointmentCalendar />
    </div>
  );
}
```

### Image Optimization

```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**

   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**

   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit

   # Generate type definitions
   npx tsc --declaration --emitDeclarationOnly
   ```

3. **Styling Issues**

   ```bash
   # Rebuild Tailwind CSS
   npx tailwindcss -i ./styles/globals.css -o ./styles/output.css --watch
   ```

## 📝 Recent Updates

### September 19, 2025

- ✅ Complete Google Calendar integration
- ✅ Appointment scheduling with calendar sync
- ✅ Patient and doctor management modules
- ✅ Responsive design implementation
- ✅ TypeScript type safety
- ✅ Docker containerization
- ✅ Comprehensive testing setup
- ✅ Performance optimizations

---

**Last Updated**: September 19, 2025
**Next.js Version**: 15.2.4
**React Version**: 19
**TypeScript Version**: 5.2+
