"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { FileText, CreditCard, Calendar, User, DollarSign, X } from 'lucide-react'
import { PaymentForm } from './PaymentForm'

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
  notes?: string
  items: BillItem[]
}

interface BillDetailsProps {
  bill: Bill
  onClose: () => void
  onPaymentCreated: (payment: any) => void
}

export function BillDetails({ bill, onClose, onPaymentCreated }: BillDetailsProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)

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

  const getBalance = () => {
    return bill.total_amount - bill.paid_amount
  }

  const isOverdue = () => {
    return new Date(bill.due_date) < new Date() && bill.status !== 'paid'
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill Details - #{bill.id.slice(-6)}
            </DialogTitle>
            <DialogDescription>
              Detailed information about the bill and its items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Bill Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {bill.patient.first_name} {bill.patient.last_name}
                    </CardTitle>
                    <CardDescription>{bill.patient.email}</CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusBadgeVariant(bill.status)} className="text-sm">
                      {bill.status.toUpperCase()}
                    </Badge>
                    {isOverdue() && (
                      <Badge variant="destructive" className="text-xs">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {new Date(bill.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(bill.total_amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(bill.paid_amount)}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className={`font-bold text-xl ${getBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(getBalance())}
                    </p>
                  </div>

                  {getBalance() > 0 && (
                    <Button onClick={() => setShowPaymentForm(true)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  )}
                </div>

                {bill.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{bill.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bill Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bill Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bill.items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{item.service_item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(bill.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          bill={bill}
          onClose={() => setShowPaymentForm(false)}
          onPaymentCreated={(payment) => {
            onPaymentCreated(payment)
            setShowPaymentForm(false)
          }}
        />
      )}
    </>
  )
}
