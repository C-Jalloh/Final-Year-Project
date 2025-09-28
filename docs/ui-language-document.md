# Chelal HMS - React UI Language Document

## Overview

This document establishes the comprehensive UI language and design system for the Chelal Hospital Management System (HMS) React frontend. It serves as the authoritative guide for all UI/UX development, ensuring consistency, accessibility, and optimal user experience across the healthcare management platform.

## 1. Design System & Principles

### Core Design Principles

#### Healthcare-First Design
- **Trust & Reliability**: Medical interfaces must inspire confidence and accuracy
- **Clarity & Precision**: Information must be unambiguous and easily digestible
- **Efficiency**: Streamlined workflows to reduce cognitive load
- **Safety**: Error prevention and clear feedback mechanisms
- **Accessibility**: WCAG 2.1 AA compliance for all users

#### User-Centric Approach
- **Role-Based Interfaces**: Tailored experiences for Admin, Doctor, Nurse, Receptionist, Pharmacist
- **Progressive Disclosure**: Information revealed contextually to avoid overwhelming users
- **Contextual Actions**: Relevant actions appear based on user role and current task
- **Intuitive Navigation**: Clear information hierarchy and predictable interaction patterns

### Visual Hierarchy
1. **Primary Actions**: Critical medical decisions, patient safety actions
2. **Secondary Actions**: Common workflows, data entry
3. **Tertiary Actions**: Administrative tasks, settings
4. **Informational**: Read-only data, status indicators

## 2. Component Architecture

### Atomic Design Pattern

#### Atoms (Base Components)
- **Button**: Primary, Secondary, Ghost, Destructive variants
- **Input**: Text, Number, Email, Password, Search
- **Typography**: Headings (H1-H6), Body, Caption, Label
- **Icon**: Lucide React icons with consistent sizing
- **Badge**: Status, Priority, Category indicators

#### Molecules (Composite Components)
- **FormField**: Label + Input + Error message
- **Card**: Header, Content, Actions
- **ListItem**: Avatar, Title, Subtitle, Actions
- **FilterBar**: Search + Filters + Sort controls

#### Organisms (Complex Components)
- **PatientCard**: Photo, Demographics, Status, Quick Actions
- **AppointmentScheduler**: Calendar + Time slots + Patient selection
- **MedicalRecordViewer**: Timeline + Categories + Details
- **DashboardWidget**: Chart/Data + Controls + Actions

#### Templates (Page Layouts)
- **DashboardTemplate**: Sidebar + Header + Main content + Footer
- **FormTemplate**: Header + Progress + Form steps + Actions
- **DetailTemplate**: Header + Tabs + Content + Related items

#### Pages (Complete Screens)
- **PatientDashboard**: Overview, Appointments, Records, Billing
- **DoctorWorkspace**: Schedule, Patients, Notes, Prescriptions
- **AdminPanel**: Users, Settings, Reports, System health

## 3. Color Palette & Theming

### Primary Healthcare Color Scheme

#### Core Brand Colors
```css
--primary: 221.2 83.2% 53.3%     /* Medical Blue */
--primary-foreground: 210 40% 98%
--secondary: 210 40% 96%
--secondary-foreground: 222.2 84% 4.9%
--tertiary: 43 100% 92%           /* Medical Yellow/Amber */
--tertiary-foreground: 40 100% 30%
```

#### Status & Alert Colors
```css
--alert-success: 142 71% 45%      /* Medical Green */
--alert-success-bg: 142 71% 95%
--alert-warning: 43 96% 56%       /* Medical Yellow */
--alert-warning-bg: 43 96% 95%
--alert-error: 0 84% 60%          /* Medical Red */
--alert-error-bg: 0 84% 95%
--alert-info: 221 83% 53%         /* Medical Blue */
--alert-info-bg: 221 83% 96%
```

#### Neutral Colors
```css
--background: 0 0% 100%
--background-alt: 210 40% 98%
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--muted: 210 40% 96%
--muted-foreground: 215.4 16.3% 46.9%
```

### Dark Mode Theme
- **Background**: Dark blue-gray (#0f172a)
- **Surface**: Medium blue-gray (#1e293b)
- **Text Primary**: Light gray (#f1f5f9)
- **Text Secondary**: Medium gray (#94a3b8)
- **Accent**: Bright blue (#3b82f6)

### Chart Colors (Data Visualization)
```css
--chart-1: 12 76% 61%    /* Orange */
--chart-2: 173 58% 39%   /* Cyan */
--chart-3: 197 37% 24%   /* Purple */
--chart-4: 43 74% 66%    /* Green */
--chart-5: 27 87% 67%    /* Red */
```

## 4. Typography

### Font Families
- **Primary**: Inter (Sans-serif) - Clean, modern, highly legible
- **Monospace**: Fira Mono - For code, IDs, technical data

### Type Scale
```css
--font-size-xs: 0.75rem   /* 12px */
--font-size-sm: 0.875rem  /* 14px */
--font-size-base: 1rem    /* 16px */
--font-size-lg: 1.125rem  /* 18px */
--font-size-xl: 1.25rem   /* 20px */
--font-size-2xl: 1.5rem   /* 24px */
--font-size-3xl: 1.875rem /* 30px */
--font-size-4xl: 2.25rem  /* 36px */
--font-size-5xl: 3rem     /* 48px */
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Text Colors
```css
--font-color-primary: 222.2 84% 4.9%   /* Dark text */
--font-color-secondary: 215.4 16.3% 46.9% /* Medium text */
--font-color-muted: 210 40% 60%       /* Light text */
--font-color-inverse: 0 0% 100%        /* White text */
--font-color-link: 221.2 83.2% 53.3%  /* Blue links */
--font-color-danger: 0 84% 60%         /* Red errors */
--font-color-success: 142 71% 45%      /* Green success */
--font-color-warning: 43 96% 56%       /* Yellow warnings */
```

## 5. Layout Patterns

### Grid System
- **Base Unit**: 4px (0.25rem)
- **Container Max Width**: 1280px
- **Breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px - 1279px
  - Large Desktop: 1280px+

### Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Layout Components

#### Sidebar Navigation
- **Width**: 280px (collapsed: 64px)
- **Background**: Sidebar background color
- **Navigation Items**: Icon + Label + Badge (optional)
- **Active State**: Highlighted background and border

#### Header Bar
- **Height**: 64px
- **Content**: Logo, Search, User menu, Notifications, Theme toggle
- **Background**: Semi-transparent or solid based on scroll

#### Main Content Area
- **Padding**: 2rem (32px)
- **Background**: Page background
- **Min Height**: 100vh - header - footer

#### Card Layouts
- **Border Radius**: 8px (0.5rem)
- **Shadow**: Subtle shadow for depth
- **Padding**: 1.5rem (24px)
- **Header**: Title + Actions
- **Content**: Main content area
- **Footer**: Actions or metadata

## 6. Navigation & Layout Structure

### Universal Sidebar Requirement

**MANDATORY REQUIREMENT**: From this point forward, ALL pages and components in the Chelal HMS application MUST include the sidebar navigation. The sidebar is a critical component of the user experience and application consistency.

#### Sidebar Specifications
- **Position**: Fixed on the far left side of the screen
- **Width**: 280px (17.5rem) when expanded, 64px when collapsed
- **Background**: Semi-transparent or solid background that provides clear separation from content
- **Z-Index**: Must be below the top navigation bar but above main content
- **Responsiveness**: Collapsible on mobile/tablet devices, full-width overlay on small screens

#### Sidebar Content Structure
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │        CHELAL HMS           │ │
│ │         LOGO                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Dashboard               │ │
│ │ 👥 Patients                │ │
│ │ 📅 Appointments            │ │
│ │ 💊 Medications             │ │
│ │ 💳 Billing                 │ │
│ │ 📈 Reports                 │ │
│ │ ⚙️  Settings               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ User Profile Section       │ │
│ │ [Avatar] [Name]            │ │
│ │ Role: Administrator        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Navigation Items
- **Icons**: Lucide React icons for visual consistency
- **Labels**: Clear, concise text labels
- **Active States**: Highlighted background and left border for active page
- **Hover States**: Subtle background color change on hover
- **Badge Support**: Optional notification badges for items like "Appointments (3)"

### Top Navigation Bar

#### Header Bar Specifications
- **Position**: Fixed at the top of the screen, spans full width
- **Height**: 64px (4rem)
- **Z-Index**: Highest z-index to stay above all content including sidebar
- **Background**: Semi-transparent that becomes solid on scroll

#### Header Content Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────┐ │
│ │LOGO│  │   SEARCH BAR    │  │ NOTIFICATIONS   │  │  USER   │ │
│ │     │  │                 │  │     BELL        │  │ AVATAR   │ │
│ └─────┘  └─────────────────┘  └─────────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Header Components
- **Logo**: Chelal HMS logo, clickable to return to dashboard
- **Search**: Global search with autocomplete suggestions
- **Notifications**: Bell icon with notification count badge
- **User Menu**: User avatar with dropdown for profile, settings, logout
- **Theme Toggle**: Dark/light mode switcher

### Main Content Area

#### Layout Grid Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                        TOP NAV BAR                              │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                               │
│    SIDEBAR      │              MAIN CONTENT                     │
│   NAVIGATION    │                                               │
│                 │                                               │
│                 │                                               │
├─────────────────┴───────────────────────────────────────────────┤
│                        FOOTER (OPTIONAL)                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Content Area Specifications
- **Position**: Right of sidebar, below header
- **Padding**: 2rem (32px) on all sides
- **Min Height**: `calc(100vh - 64px)` to fill remaining viewport height
- **Background**: Page background color
- **Overflow**: Auto scroll for content that exceeds viewport

### Responsive Behavior

#### Desktop (1024px+)
- **Sidebar**: Fully visible, 280px width
- **Header**: Full width with all components visible
- **Content**: Full width minus sidebar, responsive padding

#### Tablet (768px - 1023px)
- **Sidebar**: Collapsible, overlay mode when expanded
- **Header**: Condensed with hamburger menu for sidebar toggle
- **Content**: Full width, adjusted padding

#### Mobile (320px - 767px)
- **Sidebar**: Hidden by default, full-screen overlay when opened
- **Header**: Stacked layout, essential items only
- **Content**: Full width, minimal padding

### Implementation Requirements

#### Component Structure

```typescript
// Main layout component
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <Header />

      {/* Sidebar + Content wrapper */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### Navigation State Management

```typescript
// Global navigation state
const useNavigationStore = create((set) => ({
  activePage: 'dashboard',
  sidebarCollapsed: false,
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  })),
}))
```

#### CSS Grid Alternative

```css
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.app-header {
  grid-column: 1 / -1;
  grid-row: 1;
}

.app-sidebar {
  grid-column: 1;
  grid-row: 2;
}

.app-main {
  grid-column: 2;
  grid-row: 2;
}
```

### Migration Strategy

#### Existing Pages Update

1. **Audit Current Pages**: Identify all pages missing sidebar
2. **Create Layout Wrapper**: Implement AppLayout component
3. **Update Page Components**: Wrap existing page content
4. **Test Navigation**: Ensure all navigation links work correctly
5. **Responsive Testing**: Verify layout works on all screen sizes

#### New Page Template

```typescript
// Template for all new pages
export default function NewPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page-specific content */}
      </div>
    </AppLayout>
  )
}
```

### Accessibility Considerations

#### Keyboard Navigation

- **Tab Order**: Sidebar → Header → Main content
- **Focus Management**: Proper focus trapping in mobile overlay
- **Skip Links**: Skip to main content, skip to navigation

#### Screen Reader Support

- **Landmarks**: Header, navigation, main, complementary roles
- **ARIA Labels**: Descriptive labels for navigation items
- **Live Regions**: Announce sidebar state changes

## 7. Interaction Patterns

### Button Variants & States

#### Primary Button

- **Use**: Critical actions, form submissions, patient safety actions
- **Color**: Primary blue background, white text
- **States**: Default, Hover (darker), Active (pressed), Disabled (muted)

#### Secondary Button

- **Use**: Common actions, navigation, less critical tasks
- **Color**: Secondary background, primary text
- **States**: Same as primary with appropriate color adjustments

#### Ghost Button

- **Use**: Subtle actions, cancel operations, secondary navigation
- **Color**: Transparent background, primary text
- **States**: Hover shows background color

#### Destructive Button

- **Use**: Delete, cancel, dangerous operations
- **Color**: Error red background, white text
- **States**: Same as primary with red color scheme

### Form Patterns

#### Input Fields

- **Label**: Always present, positioned above input
- **Placeholder**: Descriptive but not replacement for label
- **Validation**: Real-time validation with clear error messages
- **Required Fields**: Marked with asterisk (*)
- **Help Text**: Optional explanatory text below input

#### Form Layout

- **Single Column**: Preferred for mobile and focused forms
- **Two Column**: For wide screens with related fields
- **Progressive Disclosure**: Show/hide sections based on selections
- **Save States**: Auto-save drafts, clear save indicators

### Navigation Patterns

#### Breadcrumb Navigation

- **Format**: Home > Section > Subsection > Current Page
- **Interactive**: Clickable segments except current page
- **Truncation**: Ellipsis for long paths

#### Tab Navigation

- **Active Tab**: Highlighted with primary color
- **Inactive Tabs**: Muted color, hover effects
- **Content Areas**: Smooth transitions between tab content

#### Search & Filter

- **Global Search**: Header search with autocomplete
- **Contextual Filters**: Sidebar or inline filters
- **Saved Filters**: User can save and reuse filter combinations

## 7. Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast

- **Normal Text**: 4.5:1 minimum contrast ratio
- **Large Text**: 3:1 minimum contrast ratio
- **Interactive Elements**: 3:1 minimum contrast ratio

#### Keyboard Accessibility

- **Tab Order**: Logical and predictable tab sequence
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Keyboard Shortcuts**: Available for common actions
- **Escape Key**: Close modals, cancel operations

#### Screen Reader Compatibility

- **Semantic HTML**: Proper heading hierarchy, landmarks
- **ARIA Labels**: Descriptive labels for complex components
- **Live Regions**: Dynamic content announcements
- **Form Labels**: All form inputs have associated labels

#### Motion & Animation

- **Reduced Motion**: Respect user's motion preferences
- **Animation Duration**: Keep animations under 300ms
- **Purposeful Motion**: Animations should serve a functional purpose

### Medical-Specific Accessibility

- **High Contrast Mode**: Enhanced contrast for visually impaired users
- **Large Text Option**: Scalable text up to 200%
- **Color Blind Support**: Use patterns and icons in addition to color
- **Voice Control**: Support for voice input where applicable

## 8. Responsive Design

### Breakpoint Strategy

#### Mobile First (320px - 767px)

- **Single Column Layout**: All content in single column
- **Touch Targets**: Minimum 44px touch targets
- **Simplified Navigation**: Collapsible sidebar, bottom navigation
- **Essential Information**: Show only critical data

#### Tablet Layout (768px - 1023px)

- **Two Column Layout**: Sidebar + main content
- **Touch Optimized**: Larger touch targets, swipe gestures
- **Condensed Tables**: Horizontal scroll for data tables
- **Adaptive Components**: Components adjust to available space

#### Desktop (1024px - 1279px)

- **Multi-Column Layout**: Sidebar + main + secondary panels
- **Hover States**: Full hover interactions
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Advanced Features**: Drag & drop, context menus

#### Large Desktop (1280px+)

- **Wide Layout**: Utilize full screen width
- **Multi-Panel**: Dashboard with multiple data panels
- **Advanced Interactions**: Complex drag & drop, multi-select
- **Performance**: Optimized for high-resolution displays

### Responsive Components

#### Data Tables

- **Mobile**: Card layout with key information
- **Tablet**: Condensed table with horizontal scroll
- **Desktop**: Full table with sorting, filtering, pagination

#### Forms

- **Mobile**: Single column, stacked inputs
- **Tablet**: Two column layout for related fields
- **Desktop**: Multi-column with optimal field grouping

#### Navigation

- **Mobile**: Bottom navigation, hamburger menu
- **Tablet**: Collapsible sidebar
- **Desktop**: Full sidebar with expandable sections

## 9. Component Naming Conventions

### File Naming

- **Components**: PascalCase (e.g., `PatientCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `usePatientData.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with 'Type' suffix (e.g., `PatientType.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Component File Structure

```typescript
// Component file structure
interface ComponentNameProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component logic
  return (
    // JSX
  )
}

// Export types for external use
export type { ComponentNameProps }
```

### CSS Class Naming

- **BEM Methodology**: Block__Element--Modifier
- **Utility Classes**: Tailwind utility classes
- **Component Classes**: Prefixed with component name

## 10. State Management Patterns

### Local State (useState)

- **Form Data**: Input values, validation states
- **UI State**: Modal open/close, active tabs, expanded sections
- **Temporary Data**: Search queries, filter selections

### Server State (React Query/TanStack Query)

- **API Data**: Patient records, appointments, medical data
- **Caching**: Automatic caching with invalidation
- **Background Updates**: Real-time data synchronization
- **Error Handling**: Retry logic, error boundaries

### Global State (Zustand/Redux Toolkit)

- **User Session**: Authentication state, user preferences
- **Application Settings**: Theme, language, notifications
- **Cross-Component Data**: Shared data between distant components

### State Management Rules

1. **Local First**: Use local state for component-specific data
2. **Server State**: Use React Query for API data
3. **Global State**: Only when data needs to be shared across multiple components
4. **Derived State**: Compute values from existing state rather than storing duplicates
5. **Optimistic Updates**: Update UI immediately, rollback on error

## 11. API Integration Patterns

### HTTP Client (Axios)
```typescript
5. **Optimistic Updates**: Update UI immediately, rollback on error

## 11. API Integration Patterns

### HTTP Client (Axios)

```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)
```

### Data Fetching (React Query)

```typescript
// Query hook pattern
function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await apiClient.get('/api/patients/')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mutation hook pattern
function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientData) => {
      const response = await apiClient.post('/api/patients/', patientData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create patient')
    },
  })
}
```

### Error Handling

- **Network Errors**: Retry with exponential backoff
- **Validation Errors**: Display field-specific error messages
- **Authentication Errors**: Redirect to login
- **Server Errors**: Show user-friendly error messages
- **Loading States**: Skeleton loaders, spinners, progress indicators

## 12. Testing Guidelines

### Unit Testing (Jest + React Testing Library)

```typescript
// Component testing
describe('PatientCard', () => {
  it('renders patient information correctly', () => {
    const patient = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
    }

    render(<PatientCard patient={patient} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Age: 34')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    const patient = { id: '1', firstName: 'John', lastName: 'Doe' }

    render(<PatientCard patient={patient} onEdit={mockOnEdit} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith('1')
  })
})
```

### Integration Testing

- **User Journeys**: Complete workflows from start to finish
- **API Integration**: Mock API responses for consistent testing
- **Form Submissions**: Test complete form workflows
- **Navigation**: Test routing and navigation flows

### E2E Testing (Playwright/Cypress)

- **Critical Paths**: Login, patient registration, appointment booking
- **Cross-Browser**: Test on Chrome, Firefox, Safari
- **Mobile Testing**: Test on mobile devices and responsive breakpoints
- **Performance**: Monitor loading times and memory usage

## 13. Performance Guidelines

### Code Splitting

- **Route-Based Splitting**: Split code by page/route
- **Component Splitting**: Lazy load heavy components
- **Vendor Splitting**: Separate third-party libraries

### Image Optimization

- **Format Selection**: WebP with fallbacks to JPEG/PNG
- **Responsive Images**: Different sizes for different screen sizes
- **Lazy Loading**: Load images only when they enter viewport
- **Compression**: Optimize file sizes without quality loss

### Bundle Optimization

- **Tree Shaking**: Remove unused code from bundles
- **Minification**: Minimize JavaScript and CSS
- **Compression**: Enable gzip/brotli compression
- **Caching**: Implement proper cache headers and versioning

### Runtime Performance

- **Virtual Scrolling**: For large lists and tables
- **Memoization**: Use React.memo, useMemo, useCallback
- **Debouncing**: For search inputs and API calls
- **Pagination**: Load data in chunks rather than all at once

## 14. Development Workflow

### Component Development Process

1. **Design**: Create component in design tool (Figma)
2. **Planning**: Define props, variants, states
3. **Implementation**: Build component with TypeScript
4. **Styling**: Apply design system styles
5. **Testing**: Write unit and integration tests
6. **Documentation**: Add Storybook stories and documentation
7. **Review**: Code review and accessibility audit
8. **Integration**: Add to application and test in context

### Code Quality Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb config with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **Commit Convention**: Conventional commits for changelog generation

### Documentation Requirements

- **Component Documentation**: Props, usage examples, variants
- **Storybook**: Interactive component documentation
- **README**: Setup instructions, architecture overview
- **API Documentation**: REST API endpoints and usage
- **User Guides**: Feature documentation for end users

## 15. Healthcare-Specific UI Patterns

### Patient Safety

- **Confirmation Dialogs**: For critical actions affecting patient care
- **Audit Trails**: Visual indicators of who made changes and when
- **Data Validation**: Real-time validation of medical data
- **Emergency Indicators**: Clear visual cues for urgent situations

### Medical Data Display

- **Vital Signs**: Color-coded ranges (normal, warning, critical)
- **Medication Lists**: Clear dosage, frequency, and timing information
- **Allergy Alerts**: Prominent warnings for known allergies
- **Lab Results**: Trend indicators and reference ranges

### Workflow Optimization

- **Quick Actions**: One-click access to common tasks
- **Keyboard Shortcuts**: Medical-specific shortcuts (Ctrl+S for save)
- **Templates**: Pre-built templates for common notes and prescriptions
- **Auto-complete**: Intelligent suggestions for medical terms and diagnoses

### Compliance & Security

- **HIPAA Compliance**: Secure data handling and display
- **Audit Logging**: Track all user actions for compliance
- **Data Encryption**: Visual indicators for encrypted data
- **Access Controls**: Clear indication of user permissions and restrictions

---

## Implementation Checklist

### Phase 1: Foundation

- [ ] Design system documentation complete
- [ ] Component library setup with shadcn/ui
- [ ] Theme provider and dark mode implementation
- [ ] Basic layout components (Header, Sidebar, Main)
- [ ] Authentication flow components

### Phase 2: Core Features

- [ ] Dashboard with key metrics and charts
- [ ] Patient management (list, create, edit, view)
- [ ] Appointment scheduling and management
- [ ] Medical records and encounter notes
- [ ] Prescription management

### Phase 3: Advanced Features

- [ ] Real-time notifications and updates
- [ ] Advanced search and filtering
- [ ] Reporting and analytics
- [ ] User role management
- [ ] System administration

### Phase 4: Optimization

- [ ] Performance optimization
- [ ] Accessibility audit and improvements
- [ ] Cross-browser testing
- [ ] Mobile responsiveness finalization
- [ ] Documentation completion

This UI Language Document serves as the foundation for building a world-class healthcare management system that prioritizes user experience, accessibility, and medical safety. All development must adhere to these guidelines to ensure consistency and quality across the application.
