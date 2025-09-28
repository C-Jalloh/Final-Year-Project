"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiHelpers } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface ServiceItem {
  id: string
  name: string
  price: number
  category: string
}

interface BillItem {
  service_item: string
  quantity: number
  unit_price: number
}

interface BillFormProps {
  onClose: () => void
  onBillCreated: (bill: any) => void
}

export function BillForm({ onClose, onBillCreated }: BillFormProps) {
  const { isAuthenticated } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient: '',
    due_date: '',
    notes: '',
    items: [] as BillItem[]
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping data load')
      return
    }

    try {
      const [patientsResponse, serviceItemsResponse] = await Promise.all([
        apiHelpers.getPatients(),
        apiHelpers.getServiceItems()
      ])

      console.log('Patients response:', patientsResponse)
      console.log('Service items response:', serviceItemsResponse)

      const patientsData = patientsResponse.data || []
      const serviceItemsData = serviceItemsResponse.data || []

      console.log('Patients data:', patientsData)
      console.log('Service items data:', serviceItemsData)

      setPatients(Array.isArray(patientsData) ? patientsData : [])
      setServiceItems(Array.isArray(serviceItemsData) ? serviceItemsData : [])
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Failed to load form data')
      setPatients([])
      setServiceItems([])
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service_item: '', quantity: 1, unit_price: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleServiceItemChange = (index: number, serviceItemId: string) => {
    const serviceItem = serviceItems.find(item => item.id === serviceItemId)
    if (serviceItem) {
      updateItem(index, 'service_item', serviceItemId)
      updateItem(index, 'unit_price', serviceItem.price)
    }
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient) {
      toast.error('Please select a patient')
      return
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    if (!formData.due_date) {
      toast.error('Please select a due date')
      return
    }

    try {
      setLoading(true)

      const billData = {
        patient: formData.patient,
        due_date: formData.due_date,
        notes: formData.notes,
        items: formData.items.map(item => ({
          service_item: item.service_item,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }

      const response = await apiHelpers.createBill(billData)
      onBillCreated(response.data)
    } catch (error) {
      console.error('Error creating bill:', error)
      toast.error('Failed to create bill')
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

  if (!isAuthenticated) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to create bills. Please log in and try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
          <DialogDescription>
            Create a bill for a patient with service items and pricing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={formData.patient} onValueChange={(value) => setFormData(prev => ({ ...prev, patient: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {(patients || []).map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} - {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the bill..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Bill Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Bill Items</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No items added yet</p>
                  <Button type="button" onClick={addItem} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Service Item *</Label>
                          <Select
                            value={item.service_item}
                            onValueChange={(value) => handleServiceItemChange(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {(serviceItems || []).map((serviceItem) => (
                                <SelectItem key={serviceItem.id} value={serviceItem.id}>
                                  {serviceItem.name} - {formatCurrency(serviceItem.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            readOnly
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="space-y-2 flex-1">
                            <Label>Total</Label>
                            <div className="p-2 bg-muted rounded text-sm font-semibold">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {formData.items.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
