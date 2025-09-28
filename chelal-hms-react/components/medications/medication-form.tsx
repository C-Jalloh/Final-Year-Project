"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiHelpers } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export interface Medication {
  id?: string
  name: string
  generic_name: string
  dosage: string
  form: string
  category: string
  stock: number
  min_stock: number
  price: number
  manufacturer: string
  expiry_date: string
  description?: string
  side_effects?: string
  instructions?: string
}

interface MedicationFormProps {
  medication?: Medication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const medicationForms = [
  "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler"
]

const medicationCategories = [
  "ACE Inhibitor", "Antidiabetic", "Antibiotic", "NSAID", "Antihypertensive",
  "Antidepressant", "Antihistamine", "Corticosteroid", "Diuretic", "Other"
]

export function MedicationForm({
  medication,
  open,
  onOpenChange,
  onSuccess
}: MedicationFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Medication>({
    name: "",
    generic_name: "",
    dosage: "",
    form: "",
    category: "",
    stock: 0,
    min_stock: 10,
    price: 0,
    manufacturer: "",
    expiry_date: "",
    description: "",
    side_effects: "",
    instructions: ""
  })

  // Populate form when editing
  useEffect(() => {
    if (medication) {
      setFormData({
        ...medication,
        expiry_date: medication.expiry_date ? new Date(medication.expiry_date).toISOString().split('T')[0] : ""
      })
    } else {
      setFormData({
        name: "",
        generic_name: "",
        dosage: "",
        form: "",
        category: "",
        stock: 0,
        min_stock: 10,
        price: 0,
        manufacturer: "",
        expiry_date: "",
        description: "",
        side_effects: "",
        instructions: ""
      })
    }
  }, [medication, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        ...formData,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null
      }

      if (medication?.id) {
        await apiHelpers.updateMedication(medication.id, data)
        toast({
          title: "Success",
          description: "Medication updated successfully",
        })
      } else {
        await apiHelpers.createMedication(data)
        toast({
          title: "Success",
          description: "Medication created successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving medication:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save medication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Medication, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {medication ? "Edit Medication" : "Add New Medication"}
          </DialogTitle>
          <DialogDescription>
            {medication
              ? "Update medication information and inventory details."
              : "Add a new medication to the inventory system."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Lisinopril"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generic_name">Generic Name *</Label>
              <Input
                id="generic_name"
                value={formData.generic_name}
                onChange={(e) => handleInputChange("generic_name", e.target.value)}
                placeholder="e.g., Lisinopril"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                placeholder="e.g., 10mg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form">Form *</Label>
              <Select value={formData.form} onValueChange={(value) => handleInputChange("form", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {medicationForms.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {medicationCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Minimum Stock *</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleInputChange("min_stock", parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                placeholder="e.g., Generic Labs"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date *</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange("expiry_date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Additional medication details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="side_effects">Side Effects</Label>
            <Textarea
              id="side_effects"
              value={formData.side_effects}
              onChange={(e) => handleInputChange("side_effects", e.target.value)}
              placeholder="Common side effects..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Usage Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              placeholder="How to take this medication..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {medication ? "Update" : "Create"} Medication
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
