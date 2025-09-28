# Enhanced Input Components for Healthcare Management System

A comprehensive collection of specialized input components built on top of Shadcn/ui, designed specifically for healthcare management applications. These components maintain consistency with your existing design system while providing enhanced functionality for medical data entry.

## 🚀 Components Overview

### FormField

A wrapper component that provides consistent form field structure with labels, error states, and descriptions.

```tsx
<FormField
  label="Patient Name"
  required
  error={errors.name}
  success="Valid name"
  description="Enter the patient's full legal name"
>
  <Input placeholder="John Doe" />
</FormField>
```

**Features:**

- Required field indicators (*)
- Error and success state styling
- Description text support
- Consistent spacing and layout

### PhoneInput

Specialized input for phone numbers with automatic formatting and validation.

```tsx
<PhoneInput
  placeholder="(555) 123-4567"
  value={phone}
  onChange={setPhone}
  onValidationChange={setIsValid}
  countryCode="+1"
/>
```

**Features:**

- Automatic formatting: `(XXX) XXX-XXXX`
- 10-digit validation
- Phone icon indicator
- Real-time validation feedback
- Country code support

### DateTimeInput

Combined date and time input component for scheduling appointments.

```tsx
<DateTimeInput
  dateValue={date}
  timeValue={time}
  onDateChange={setDate}
  onTimeChange={setTime}
  minDate={new Date().toISOString().split('T')[0]}
/>
```

**Features:**

- Side-by-side date and time inputs
- Calendar and clock icons
- Min/max date constraints
- Responsive grid layout

### SearchableSelect

Enhanced select component with search and filtering capabilities.

```tsx
<SearchableSelect
  options={[
    { value: "dr-smith", label: "Dr. Sarah Smith", description: "Cardiologist" },
    { value: "dr-johnson", label: "Dr. Michael Johnson", description: "Neurologist" }
  ]}
  value={selectedDoctor}
  onValueChange={setSelectedDoctor}
  placeholder="Choose a doctor..."
  searchPlaceholder="Search doctors..."
/>
```

**Features:**

- Real-time search and filtering
- Support for option descriptions
- Keyboard navigation
- Custom empty states
- Accessible design

### PasswordInput

Password input with show/hide toggle and strength indicator.

```tsx
<PasswordInput
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  strengthIndicator
  showToggle
/>
```

**Features:**

- Show/hide password toggle
- Password strength indicator
- Lock icon indicator
- Visual strength feedback (Weak/Fair/Good/Strong)
- Strength-based color coding

### NumberInput

Number input with validation, formatting, and increment/decrement controls.

```tsx
<NumberInput
  placeholder="Enter age"
  value={age}
  onChange={setAge}
  min={0}
  max={150}
  step={1}
  showControls
  precision={0}
/>
```

**Features:**

- Increment/decrement buttons
- Min/max value constraints
- Precision control for decimals
- Keyboard arrow key support
- Number formatting options
- Hash icon indicator

### FileInput

File upload component with drag & drop functionality and validation.

```tsx
<FileInput
  value={files}
  onChange={setFiles}
  accept=".pdf,.jpg,.jpeg,.png"
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024} // 5MB
  showPreview
  dragDrop
/>
```

**Features:**

- Drag & drop interface
- File type validation
- Size limit enforcement
- File preview with icons
- Multiple file support
- Upload progress indication

### CalendarInput

Advanced calendar input component with healthcare-specific features and appointment indicators.

```tsx
<CalendarInput
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select appointment date"
  showTime={true}
  timeValue={appointmentTime}
  onTimeChange={setAppointmentTime}
  minDate={new Date()}
  appointmentDates={existingAppointments}
  highlightedDates={specialDates}
  showAppointmentIndicators={true}
/>
```

**Features:**

- Popover calendar interface
- Optional time selection
- Appointment date indicators (red dots)
- Highlighted special dates
- Date range constraints (min/max)
- Disabled dates support
- Custom date formatting
- Healthcare-focused visual indicators
- Responsive design

## 🎨 Design System Integration

All components are built using:

- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Lucide React** for icons
- **TypeScript** for type safety
- **Radix UI** primitives for accessibility

### Consistent Styling

- Border radius: `rounded-md`
- Border colors: `border-input`
- Focus states: `focus-visible:ring-2 focus-visible:ring-ring`
- Error states: `border-red-500`
- Success states: `border-green-500`
- Disabled states: `opacity-50 cursor-not-allowed`

### Spacing

- Form fields: `space-y-2`
- Component padding: `px-3 py-2`
- Icon positioning: `left-3 top-1/2 -translate-y-1/2`

## 📦 Installation & Usage

### Import Components

```tsx
import {
  FormField,
  PhoneInput,
  DateTimeInput,
  SearchableSelect,
  PasswordInput,
  NumberInput,
  FileInput
} from "@/components/ui/inputs"
```

### Or Import Individually

```tsx
import { FormField } from "@/components/ui/form-field"
import { PhoneInput } from "@/components/ui/phone-input"
// ... etc
```

## 🏥 Healthcare-Specific Features

### Medical Data Validation

- Phone number formatting for patient contact info
- Date constraints for appointments and birth dates
- File type validation for medical documents
- Password strength requirements for secure access

### Accessibility

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Performance

- Debounced search in SearchableSelect
- Lazy loading for file previews
- Optimized re-renders with React.memo where appropriate

## 🔧 Customization

### Theming

All components support custom className props for styling overrides:

```tsx
<PhoneInput
  className="border-blue-500 focus-visible:ring-blue-500"
  showIcon={false}
/>
```

### Validation

Components include built-in validation but can be extended:

```tsx
const [isValid, setIsValid] = useState(true)

<PhoneInput
  value={phone}
  onValidationChange={setIsValid}
  onChange={setPhone}
/>
```

## 📋 Example Implementation

See `input-components-demo.tsx` for a complete example showing all components in a healthcare patient registration form.

## 🤝 Contributing

When adding new input components:

1. Follow the existing naming conventions
2. Include proper TypeScript types
3. Add accessibility features
4. Provide comprehensive documentation
5. Include usage examples

## 📄 License

This component library is part of the CheLal Healthcare Management System and follows the same licensing terms.
