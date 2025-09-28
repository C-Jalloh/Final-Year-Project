"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FormField,
  PhoneInput,
  DateTimeInput,
  SearchableSelect,
  PasswordInput,
  NumberInput,
  FileInput,
  Input,
  Textarea,
  type SelectOption
} from "@/components/ui/inputs"

const InputComponentsDemo = () => {
  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    appointmentDate: "",
    appointmentTime: "",
    doctor: "",
    password: "",
    age: "",
    notes: "",
    files: [] as File[]
  })

  const [phoneValid, setPhoneValid] = React.useState(true)

  // Sample doctor options for SearchableSelect
  const doctorOptions: SelectOption[] = [
    { value: "dr-smith", label: "Dr. Sarah Smith", description: "Cardiologist" },
    { value: "dr-johnson", label: "Dr. Michael Johnson", description: "Neurologist" },
    { value: "dr-davis", label: "Dr. Emily Davis", description: "Pediatrician" },
    { value: "dr-brown", label: "Dr. James Brown", description: "Orthopedic Surgeon" },
    { value: "dr-wilson", label: "Dr. Lisa Wilson", description: "Dermatologist" }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    alert("Form submitted! Check console for data.")
  }

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      appointmentDate: "",
      appointmentTime: "",
      doctor: "",
      password: "",
      age: "",
      notes: "",
      files: []
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Input Components Demo</CardTitle>
          <CardDescription>
            Showcase of enhanced input components designed for healthcare management systems.
            All components follow the same design language and are fully accessible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="First Name" required>
                  <Input
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </FormField>

                <FormField label="Last Name" required>
                  <Input
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Email Address" required>
                <Input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </FormField>

              <FormField
                label="Phone Number"
                required
                error={!phoneValid ? "Please enter a valid 10-digit phone number" : undefined}
              >
                <PhoneInput
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  onValidationChange={setPhoneValid}
                />
              </FormField>

              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label="Age">
                <NumberInput
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(value) => handleInputChange("age", value)}
                  min={0}
                  max={150}
                  showControls
                />
              </FormField>
            </div>

            {/* Appointment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appointment Details</h3>

              <FormField label="Appointment Date & Time" required>
                <DateTimeInput
                  dateValue={formData.appointmentDate}
                  timeValue={formData.appointmentTime}
                  onDateChange={(date) => handleInputChange("appointmentDate", date)}
                  onTimeChange={(time) => handleInputChange("appointmentTime", time)}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label="Select Doctor" required>
                <SearchableSelect
                  options={doctorOptions}
                  value={formData.doctor}
                  onValueChange={(value) => handleInputChange("doctor", value)}
                  placeholder="Choose a doctor..."
                  searchPlaceholder="Search doctors..."
                  emptyMessage="No doctors found."
                />
              </FormField>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <FormField label="Password" description="Create a secure password for patient portal access">
                <PasswordInput
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  strengthIndicator
                />
              </FormField>

              <FormField label="Medical Notes" description="Any additional medical information or special requirements">
                <Textarea
                  placeholder="Enter medical notes, allergies, or special instructions..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                />
              </FormField>

              <FormField
                label="Medical Documents"
                description="Upload medical records, test results, or insurance documents"
              >
                <FileInput
                  value={formData.files}
                  onChange={(files) => handleInputChange("files", files)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024} // 10MB
                  showPreview
                  dragDrop
                />
              </FormField>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <Button type="submit" className="flex-1">
                Submit Patient Registration
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Usage Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Component Features</CardTitle>
          <CardDescription>
            Overview of the enhanced input components and their capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">FormField</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Label with required indicator</li>
                <li>• Error and success states</li>
                <li>• Description text support</li>
                <li>• Consistent spacing</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">PhoneInput</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Auto-formatting (XXX) XXX-XXXX</li>
                <li>• Validation for 10-digit numbers</li>
                <li>• Phone icon indicator</li>
                <li>• Real-time validation feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">DateTimeInput</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Combined date and time inputs</li>
                <li>• Calendar and clock icons</li>
                <li>• Min/max date constraints</li>
                <li>• Responsive grid layout</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">SearchableSelect</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Search/filter functionality</li>
                <li>• Support for descriptions</li>
                <li>• Keyboard navigation</li>
                <li>• Custom empty states</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">PasswordInput</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Show/hide password toggle</li>
                <li>• Password strength indicator</li>
                <li>• Lock icon indicator</li>
                <li>• Visual strength feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">NumberInput</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Increment/decrement controls</li>
                <li>• Min/max value constraints</li>
                <li>• Precision and formatting</li>
                <li>• Keyboard arrow key support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">FileInput</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Drag & drop functionality</li>
                <li>• File type validation</li>
                <li>• Size limit enforcement</li>
                <li>• Preview with file icons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InputComponentsDemo
