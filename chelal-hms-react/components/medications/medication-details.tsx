"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Pill,
  AlertTriangle,
  Package,
  DollarSign,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Info
} from "lucide-react"
import { Medication } from "./medication-form"

interface MedicationDetailsProps {
  medication: Medication
}

export function MedicationDetails({ medication }: MedicationDetailsProps) {
  const getStatusBadge = (stock: number, minStock: number) => {
    if (stock === 0) return { variant: "destructive" as const, text: "Out of Stock" }
    if (stock <= minStock) return { variant: "secondary" as const, text: "Low Stock" }
    return { variant: "default" as const, text: "In Stock" }
  }

  const status = getStatusBadge(medication.stock, medication.min_stock)
  const expiryDate = new Date(medication.expiry_date)
  const isExpiringSoon = expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 // 30 days

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Pill className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{medication.name}</h2>
            <p className="text-muted-foreground">{medication.generic_name}</p>
          </div>
        </div>
        <Badge variant={status.variant}>
          {status.text}
        </Badge>
      </div>

      {/* Key Information Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medication.stock}</div>
            <p className="text-xs text-muted-foreground">
              Min: {medication.min_stock} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price per Unit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${medication.price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total value: ${(medication.stock * medication.price).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expiryDate.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {isExpiringSoon ? (
                <span className="text-orange-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expires soon
                </span>
              ) : (
                "Valid"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medication.category}</div>
            <p className="text-xs text-muted-foreground">
              {medication.form}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Medication Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dosage</label>
              <p className="text-sm">{medication.dosage}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Form</label>
              <p className="text-sm">{medication.form}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
              <p className="text-sm">{medication.manufacturer}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
              <p className="text-sm">{medication.generic_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medication.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{medication.description}</p>
              </div>
            )}

            {medication.instructions && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usage Instructions</label>
                <p className="text-sm">{medication.instructions}</p>
              </div>
            )}

            {medication.side_effects && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Side Effects</label>
                <p className="text-sm text-orange-700">{medication.side_effects}</p>
              </div>
            )}

            {!medication.description && !medication.instructions && !medication.side_effects && (
              <p className="text-sm text-muted-foreground">No additional details available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(medication.stock <= medication.min_stock || isExpiringSoon) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medication.stock <= medication.min_stock && medication.stock > 0 && (
                <p className="text-sm text-orange-700">
                  ⚠️ Low stock alert: Only {medication.stock} units remaining (minimum: {medication.min_stock})
                </p>
              )}
              {medication.stock === 0 && (
                <p className="text-sm text-red-700">
                  ❌ Out of stock: This medication is currently unavailable
                </p>
              )}
              {isExpiringSoon && (
                <p className="text-sm text-orange-700">
                  ⏰ Expiring soon: {medication.name} expires on {expiryDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
