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
import { apiHelpers } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface Patient {
  id: number
  first_name: string
  last_name: string
  unique_id: string
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
  username: string
}

interface AppointmentFormData {
  patient: string
  doctor: string
  date: string
  time: string
  status: string
}

interface AppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (appointment: any) => void
  initialData?: Partial<AppointmentFormData>
  mode?: "create" | "edit"
  appointmentId?: number
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  appointmentId
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    status: "scheduled"
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch patients
        const patientsResponse = await apiHelpers.getPatients({ page_size: 100 })
        const patientsData = patientsResponse.data.results || patientsResponse.data
        setPatients(patientsData)

        // For now, we'll use a mock list of doctors since the API might not have this endpoint
        // In a real app, you'd fetch doctors from the API
        setDoctors([
          { id: 1, first_name: "John", last_name: "Smith", username: "dr_smith" },
          { id: 2, first_name: "Sarah", last_name: "Johnson", username: "dr_johnson" },
          { id: 3, first_name: "Michael", last_name: "Brown", username: "dr_brown" }
        ])

      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const appointmentData = {
        patient: parseInt(formData.patient),
        doctor: parseInt(formData.doctor),
        date: formData.date,
        time: formData.time,
        status: formData.status
      }

      let response
      if (mode === "create") {
        response = await apiHelpers.createAppointment(appointmentData)
      } else if (mode === "edit" && appointmentId) {
        response = await apiHelpers.updateAppointment(appointmentId.toString(), appointmentData)
      } else {
        throw new Error("Invalid mode or missing appointment ID")
      }

      onSave(response.data)
      onClose()

      // Reset form
      setFormData({
        patient: "",
        doctor: "",
        date: "",
        time: "",
        status: "scheduled"
      })

    } catch (error: any) {
      console.error("Failed to save appointment:", error)
      if (error.response?.data) {
        setErrors(error.response.data)
      } else {
        setErrors({ general: "Failed to save appointment. Please try again." })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Appointment" : "Edit Appointment"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Schedule a new appointment for a patient."
              : "Update the appointment details."
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) => handleInputChange("patient", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.first_name} {patient.last_name} ({patient.unique_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient && (
                <p className="text-sm text-red-600">{errors.patient}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Select
                value={formData.doctor}
                onValueChange={(value) => handleInputChange("doctor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctor && (
                <p className="text-sm text-red-600">{errors.doctor}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
                {errors.time && (
                  <p className="text-sm text-red-600">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {mode === "create" ? "Create Appointment" : "Update Appointment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
