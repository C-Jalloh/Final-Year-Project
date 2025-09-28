# 💳 Billing System Documentation

## Overview

The Billing System is a comprehensive financial management module for the Chelal Hospital Management System, providing complete billing, payment processing, and financial reporting capabilities.

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React/Next.js with TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Hooks
- **API Communication**: Axios with centralized API client
- **Data Validation**: TypeScript interfaces and runtime validation

### System Components

billing-system/
├── API Layer
│   ├── api-client.ts          # Centralized API endpoints
│   └── api-helpers.ts         # Billing-specific API functions
├── Components
│   ├── BillForm.tsx           # Bill creation form
│   ├── BillDetails.tsx        # Bill details and payment recording
│   ├── PaymentForm.tsx        # Payment recording form
│   └── BillingStats.tsx       # Financial statistics dashboard
├── Pages
│   └── billing/page.tsx       # Main billing dashboard
└── Types
    └── billing.ts             # TypeScript interfaces

## 🎯 Key Features

### 1. Bill Management

#### Bill Creation

- **Patient Selection**: Dropdown with search functionality
- **Service Items**: Dynamic addition/removal of bill items
- **Automatic Calculations**: Real-time total and balance calculations
- **Due Date Management**: Configurable payment due dates
- **Notes Support**: Additional bill information and comments

#### Bill Status Tracking

- **Status Types**: Pending, Paid, Overdue, Cancelled
- **Visual Indicators**: Color-coded status badges
- **Automatic Updates**: Status changes based on payments and due dates
- **Overdue Detection**: Automatic overdue status for past due bills

### 2. Payment Processing

#### Payment Methods

- **Cash**: Direct cash payments
- **Credit Card**: Card payment processing
- **Debit Card**: Debit card transactions
- **Bank Transfer**: Bank wire transfers
- **Check**: Check payments
- **Insurance**: Insurance claim payments

#### Payment Recording

- **Partial Payments**: Support for partial bill payments
- **Payment History**: Complete payment transaction history
- **Receipt Generation**: Payment confirmation and receipts
- **Refund Support**: Payment reversal capabilities

### 3. Financial Reporting

#### Dashboard Statistics

- **Total Revenue**: All-time revenue tracking
- **Outstanding Amount**: Unpaid bill balances
- **Paid Amount**: Total payments received
- **Bill Counts**: Breakdown by status (paid, pending, overdue)

#### Revenue Analytics

- **Monthly Revenue**: Monthly revenue trends
- **Payment Method Analysis**: Payment method preferences
- **Service Item Performance**: Most billed services
- **Patient Payment History**: Individual patient payment patterns

### 4. Service Catalog Management

#### Service Items

- **Pre-defined Services**: Configurable service catalog
- **Dynamic Pricing**: Flexible pricing structure
- **Category Organization**: Service categorization
- **Tax Calculation**: Automatic tax computation

## 📋 API Endpoints

### Bills

```typescript
// Get all bills with optional filters
GET /api/bills/?patient=123&status=pending&date_from=2025-01-01

// Get specific bill
GET /api/bills/123/

// Create new bill
POST /api/bills/
{
  "patient": "patient_id",
  "due_date": "2025-09-30",
  "notes": "Consultation fee",
  "items": [
    {
      "service_item": "service_id",
      "quantity": 1,
      "unit_price": 150.00
    }
  ]
}

// Update bill
PATCH /api/bills/123/
{
  "status": "paid",
  "notes": "Updated notes"
}

// Delete bill
DELETE /api/bills/123/
```

### Payments

```typescript
// Get all payments
GET /api/payments/?bill=123&date_from=2025-01-01

// Record new payment
POST /api/payments/
{
  "bill": "bill_id",
  "amount": 150.00,
  "payment_method": "cash",
  "payment_date": "2025-09-20",
  "notes": "Cash payment received"
}
```

### Service Catalog Items

```typescript
// Get service catalog
GET /api/service-items/?category=consultation

// Create service item
POST /api/service-items/
{
  "name": "General Consultation",
  "price": 150.00,
  "category": "consultation",
  "description": "Standard consultation fee"
}
```

### Financial Reports

```typescript
// Get billing statistics
GET /api/report/billing-stats/

// Get revenue report
GET /api/report/revenue/?start_date=2025-01-01&end_date=2025-09-30
```

## 🔧 Implementation Details

### Component Architecture

#### BillForm Component

```typescript
interface BillFormProps {
  onClose: () => void
  onBillCreated: (bill: Bill) => void
}

export function BillForm({ onClose, onBillCreated }: BillFormProps) {
  // State management
  const [patients, setPatients] = useState<Patient[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [formData, setFormData] = useState<BillFormData>({
    patient: '',
    due_date: '',
    notes: '',
    items: []
  })

  // Load reference data
  useEffect(() => {
    loadPatients()
    loadServiceItems()
  }, [])

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiHelpers.createBill(formData)
      onBillCreated(response.data)
      toast.success('Bill created successfully')
    } catch (error) {
      toast.error('Failed to create bill')
    }
  }

  // Dynamic item management
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        service_item: '',
        quantity: 1,
        unit_price: 0
      }]
    }))
  }

  // Component JSX with form fields and item management
}
```

#### PaymentForm Component

```typescript
interface PaymentFormProps {
  bill?: Bill
  onClose: () => void
  onPaymentCreated: (payment: Payment) => void
}

export function PaymentForm({ bill, onClose, onPaymentCreated }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    bill: bill?.id || '',
    amount: '',
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'insurance', label: 'Insurance' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      }
      const response = await apiHelpers.createPayment(paymentData)
      onPaymentCreated(response.data)
      toast.success('Payment recorded successfully')
    } catch (error) {
      toast.error('Failed to record payment')
    }
  }

  // Component JSX with payment form
}
```

#### BillingStats Component

```typescript
interface BillingStatsProps {
  stats: BillingStats
}

export function BillingStats({ stats }: BillingStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue || 0),
      description: 'All time revenue',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(stats.total_outstanding || 0),
      description: 'Unpaid bills',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Paid Amount',
      value: formatCurrency(stats.total_paid || 0),
      description: 'Total payments received',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'Total Bills',
      value: stats.bills_count?.toString() || '0',
      description: `${stats.paid_bills_count || 0} paid, ${stats.pending_bills_count || 0} pending`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Data Models

#### TypeScript Interfaces

```typescript
// Bill interfaces
interface Bill {
  id: string
  patient: PatientSummary
  total_amount: number
  paid_amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  created_at: string
  due_date: string
  notes?: string
  items: BillItem[]
}

interface BillItem {
  id: string
  service_item: ServiceItem
  quantity: number
  unit_price: number
  total_price: number
}

interface PatientSummary {
  id: string
  first_name: string
  last_name: string
  email: string
}

// Payment interfaces
interface Payment {
  id: string
  bill: string
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  notes?: string
}

type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'check'
  | 'insurance'
  | 'other'

// Service catalog interfaces
interface ServiceItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  active: boolean
}

// Statistics interfaces
interface BillingStats {
  total_revenue?: number
  total_outstanding?: number
  total_paid?: number
  bills_count?: number
  paid_bills_count?: number
  pending_bills_count?: number
  overdue_bills_count?: number
  monthly_revenue?: number[]
}
```

## 🔄 Business Logic

### Bill Status Management

```typescript
const updateBillStatus = (bill: Bill): BillStatus => {
  const today = new Date()
  const dueDate = new Date(bill.due_date)
  const balance = bill.total_amount - bill.paid_amount

  if (balance <= 0) {
    return 'paid'
  }

  if (dueDate < today) {
    return 'overdue'
  }

  return 'pending'
}
```

### Payment Processing

```typescript
const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
  // Validate payment data
  const validation = validatePaymentData(paymentData)
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }

  // Check bill exists and is payable
  const bill = await apiHelpers.getBill(paymentData.bill)
  if (bill.status === 'cancelled') {
    throw new Error('Cannot process payment for cancelled bill')
  }

  // Record payment
  const payment = await apiHelpers.createPayment(paymentData)

  // Update bill status
  const updatedBill = {
    ...bill,
    paid_amount: bill.paid_amount + payment.amount
  }
  updatedBill.status = updateBillStatus(updatedBill)

  await apiHelpers.updateBill(bill.id, { status: updatedBill.status })

  return {
    payment,
    updatedBill,
    success: true
  }
}
```

## 🎨 User Interface

### Main Billing Dashboard

The main billing page provides a comprehensive overview of all financial activities:

- **Statistics Cards**: Key financial metrics at a glance
- **Bills Table**: List of all bills with status indicators
- **Payments Table**: Payment history and transaction details
- **Quick Actions**: Create bills and record payments
- **Filters**: Filter bills by status, date, patient

### Bill Creation Form

- **Patient Selection**: Searchable dropdown with patient details
- **Service Items**: Dynamic table for adding/removing services
- **Pricing**: Automatic calculation with tax support
- **Due Dates**: Date picker with validation
- **Notes**: Rich text area for additional information

### Payment Recording Interface

- **Bill Selection**: Link payment to specific bill
- **Amount Validation**: Ensure payment doesn't exceed balance
- **Payment Methods**: Comprehensive method selection
- **Receipt Generation**: Automatic receipt creation
- **Payment History**: Complete audit trail

## 🔒 Security & Permissions

### Role-Based Access

- **Admin**: Full billing system access
- **Receptionist**: Bill creation and payment recording
- **Doctor**: View bills for their patients
- **Patient**: View their own bills and payments

### Data Validation

- **Input Sanitization**: All user inputs are sanitized
- **Amount Validation**: Payment amounts validated against bill balances
- **Date Validation**: Due dates and payment dates validated
- **Permission Checks**: API endpoints validate user permissions

## 📊 Reporting & Analytics

### Financial Report Types

- **Revenue Reports**: Daily, weekly, monthly revenue tracking
- **Outstanding Reports**: Aging reports for outstanding balances
- **Payment Method Reports**: Analysis of payment method usage
- **Service Performance**: Most profitable services and procedures

### Dashboard Metrics

- **Real-time Updates**: Live financial statistics
- **Trend Analysis**: Revenue and payment trends over time
- **KPI Monitoring**: Key performance indicators
- **Alert System**: Notifications for overdue bills and low balances

## 🚀 Future Enhancements

### Planned Features

- **Invoice Generation**: PDF invoice creation and emailing
- **Recurring Billing**: Automatic recurring bill generation
- **Insurance Integration**: Direct insurance claim processing
- **Multi-currency Support**: Support for multiple currencies
- **Advanced Analytics**: Detailed financial analytics and forecasting
- **Mobile App**: Dedicated mobile billing application

### Integration Opportunities

- **Payment Gateways**: Integration with popular payment processors
- **Accounting Software**: Sync with QuickBooks, Xero, etc.
- **Insurance Systems**: Direct integration with insurance providers
- **Banking APIs**: Direct bank account integration for transfers

## 📞 Support & Maintenance

### Error Handling

- **Graceful Degradation**: System continues to function with API failures
- **User Feedback**: Clear error messages and recovery options
- **Logging**: Comprehensive error logging for debugging
- **Fallback Data**: Default values when data is unavailable

### Performance Optimization

- **Lazy Loading**: Components load on demand
- **Caching**: API responses cached for better performance
- **Pagination**: Large datasets paginated for better UX
- **Background Processing**: Heavy operations run in background

---

**Last Updated**: September 20, 2025
**Version**: 1.0.0
**Status**: Production Ready
