"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { apiHelpers } from '@/lib/api-client'
import { SearchableSelect, type SelectOption } from '@/components/ui/searchable-select'
import { BillForm } from './BillForm'

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
  status: string
}

interface PaymentFormProps {
  bill?: Bill
  onClose: () => void
  onPaymentCreated: (payment: any) => void
}

export function PaymentForm({ bill, onClose, onPaymentCreated }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState<Bill[]>([])
  const [billsLoading, setBillsLoading] = useState(false)
  const [showBillForm, setShowBillForm] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(bill || null)
  const [formData, setFormData] = useState({
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
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ]

  // Load bills on component mount
  useEffect(() => {
    loadBills()
  }, [])

  // Update selected bill when bill prop changes
  useEffect(() => {
    if (bill) {
      setSelectedBill(bill)
      setFormData(prev => ({ ...prev, bill: bill.id }))
    }
  }, [bill])

  const loadBills = async () => {
    try {
      setBillsLoading(true)
      const response = await apiHelpers.getBills()
      const billsData = Array.isArray(response.data) ? response.data : []
      setBills(billsData)
    } catch (error) {
      console.error('Error loading bills:', error)
      toast.error('Failed to load bills')
      setBills([])
    } finally {
      setBillsLoading(false)
    }
  }

  const billOptions: SelectOption[] = bills.map(bill => ({
    value: bill.id,
    label: `${bill.patient.first_name} ${bill.patient.last_name}`,
    description: `Total: $${bill.total_amount.toFixed(2)} | Paid: $${bill.paid_amount.toFixed(2)} | Balance: $${(bill.total_amount - bill.paid_amount).toFixed(2)}`
  }))

  const handleBillSelect = (billId: string) => {
    const bill = bills.find(b => b.id === billId)
    setSelectedBill(bill || null)
    setFormData(prev => ({ ...prev, bill: billId }))
  }

  const handleBillCreated = (newBill: any) => {
    setShowBillForm(false)
    // Reload bills to include the new one
    loadBills()
    // Auto-select the newly created bill
    if (newBill && newBill.id) {
      setSelectedBill(newBill)
      setFormData(prev => ({ ...prev, bill: newBill.id }))
    }
    toast.success('Bill created successfully')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (!formData.payment_method) {
      toast.error('Please select a payment method')
      return
    }

    if (!formData.bill) {
      toast.error('Please select a bill to record payment for')
      return
    }

    try {
      setLoading(true)

      const paymentData = {
        bill: formData.bill,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        notes: formData.notes
      }

      const response = await apiHelpers.createPayment(paymentData)
      onPaymentCreated(response.data)
      toast.success('Payment recorded successfully')
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getBalanceDue = () => {
    const currentBill = selectedBill || bill
    if (!currentBill) return 0
    return currentBill.total_amount - currentBill.paid_amount
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for a bill.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bill">Select Bill *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBillForm(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                New Bill
              </Button>
            </div>
            
            {!bill && (
              <SearchableSelect
                options={billOptions}
                value={formData.bill}
                onValueChange={handleBillSelect}
                placeholder="Search and select a bill..."
                searchPlaceholder="Search by patient name..."
                emptyMessage={billsLoading ? "Loading bills..." : "No bills found."}
                disabled={billsLoading}
              />
            )}
          </div>

          {/* Bill Info */}
          {selectedBill && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {selectedBill.patient.first_name} {selectedBill.patient.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{formatCurrency(selectedBill.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedBill.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-semibold ${getBalanceDue() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(getBalanceDue())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-9"
              />
            </div>
            {selectedBill && getBalanceDue() > 0 && (
              <p className="text-xs text-muted-foreground">
                Balance due: {formatCurrency(getBalanceDue())}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the payment..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Bill Creation Modal */}
      {showBillForm && (
        <BillForm
          onClose={() => setShowBillForm(false)}
          onBillCreated={handleBillCreated}
        />
      )}
    </Dialog>
  )
}
