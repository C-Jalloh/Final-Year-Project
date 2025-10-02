"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, DollarSign, CreditCard, FileText, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { apiHelpers } from '@/lib/api-client'
import { BillForm } from '@/components/billing/BillForm'
import { BillDetails } from '@/components/billing/BillDetails'
import { PaymentForm } from '@/components/billing/PaymentForm'
import { BillingStats } from '@/components/billing/BillingStats'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuth } from '../../lib/auth-context'
import { ConditionalRender } from '@/components/auth/ConditionalRender'
import { ROLES } from '@/lib/permissions'
import { BillingSkeleton } from "@/components/ui/skeleton-loader"

interface Bill {
  id: string
  patient: {
    id: string
    first_name: string
    last_name: string
    email: string
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

export default function BillingPage() {
  const { isAuthenticated } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showBillForm, setShowBillForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [billingStats, setBillingStats] = useState<any>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadBillingData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadBillingData = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping billing data load')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [billsResponse, paymentsResponse, statsResponse] = await Promise.all([
        apiHelpers.getBills(),
        apiHelpers.getPayments(),
        apiHelpers.getBillingStats()
      ])

      console.log('Bills response:', billsResponse)
      console.log('Payments response:', paymentsResponse)
      console.log('Stats response:', statsResponse)

      const billsData = billsResponse.data || []
      const paymentsData = paymentsResponse.data || []

      console.log('Bills data:', billsData)
      console.log('Payments data:', paymentsData)

      setBills(Array.isArray(billsData) ? billsData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setBillingStats(statsResponse.data || null)
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast.error('Failed to load billing data')
      // Set fallback data
      setBills([])
      setPayments([])
      setBillingStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBillCreated = (newBill: Bill) => {
    setBills(prev => [newBill, ...prev])
    setShowBillForm(false)
    toast.success('Bill created successfully')
  }

  const handlePaymentCreated = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev])
    setShowPaymentForm(false)
    toast.success('Payment recorded successfully')
    loadBillingData() // Refresh to update bill status
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'overdue': return 'destructive'
      case 'cancelled': return 'outline'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <AppLayout>
        <BillingSkeleton />
      </AppLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the billing system.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ConditionalRender
        roles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
              <p className="text-gray-500">You don't have permission to access billing management.</p>
              <p className="text-sm text-gray-400 mt-2">This area is restricted to administrators and receptionists.</p>
            </div>
          </div>
        }
      >
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Billing Management</h1>
              <p className="text-muted-foreground">Manage bills, payments, and financial records</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowPaymentForm(true)} variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              <Button onClick={() => setShowBillForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Bill
              </Button>
            </div>
          </div>

      {/* Billing Stats */}
      {billingStats && <BillingStats stats={billingStats} />}

      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(bills || []).map((bill) => (
              <Card key={bill.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {bill.patient.first_name} {bill.patient.last_name}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(bill.status)}>
                      {bill.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created: {new Date(bill.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">{formatCurrency(bill.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Paid:</span>
                      <span className="text-green-600">{formatCurrency(bill.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className={bill.total_amount - bill.paid_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(bill.total_amount - bill.paid_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due:</span>
                      <span>{new Date(bill.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {bills.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first bill to get started with billing management.
                </p>
                <Button onClick={() => setShowBillForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Bill
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(payments || []).map((payment) => (
              <Card key={payment.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment #{payment.id.slice(-6)}
                  </CardTitle>
                  <CardDescription>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Method:</span>
                      <span className="capitalize">{payment.payment_method}</span>
                    </div>
                    {payment.notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Notes:</span>
                        <p className="text-sm mt-1">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {payments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground text-center">
                  Payment records will appear here once payments are recorded.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showBillForm && (
        <BillForm
          onClose={() => setShowBillForm(false)}
          onBillCreated={handleBillCreated}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          onClose={() => setShowPaymentForm(false)}
          onPaymentCreated={handlePaymentCreated}
        />
      )}

      {selectedBill && (
        <BillDetails
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </div>
      </ConditionalRender>
    </AppLayout>
  )
}
