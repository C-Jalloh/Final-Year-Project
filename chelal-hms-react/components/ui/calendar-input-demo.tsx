"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarInput, FormField } from "@/components/ui/inputs"
import { format } from "date-fns"

const CalendarInputDemo = () => {
  // Demo state
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [appointmentDate, setAppointmentDate] = React.useState<Date>()
  const [birthDate, setBirthDate] = React.useState<Date>()
  const [appointmentTime, setAppointmentTime] = React.useState("")

  // Sample appointment dates (for demo purposes)
  const appointmentDates = [
    new Date(2025, 8, 25), // September 25, 2025
    new Date(2025, 8, 28), // September 28, 2025
    new Date(2025, 9, 2),  // October 2, 2025
    new Date(2025, 9, 5),  // October 5, 2025
  ]

  // Sample highlighted dates (special dates)
  const highlightedDates = [
    new Date(2025, 8, 30), // September 30, 2025 - Doctor's birthday
    new Date(2025, 9, 10), // October 10, 2025 - Clinic anniversary
  ]

  // Disabled dates (past dates)
  const disabledDates = []
  const today = new Date()
  for (let i = 1; i <= 30; i++) {
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - i)
    disabledDates.push(pastDate)
  }

  const handleSubmit = () => {
    console.log("Form Data:", {
      selectedDate,
      appointmentDate,
      birthDate,
      appointmentTime
    })
    alert("Calendar input demo submitted! Check console for data.")
  }

  const handleReset = () => {
    setSelectedDate(undefined)
    setAppointmentDate(undefined)
    setBirthDate(undefined)
    setAppointmentTime("")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Input Component Demo</CardTitle>
          <CardDescription>
            Healthcare-focused calendar input with appointment indicators, date constraints, and time selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Date Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Date Selection</h3>

            <FormField label="Select Any Date" description="Basic calendar input without constraints">
              <CalendarInput
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Choose any date"
              />
            </FormField>

            {selectedDate && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Selected Date:</strong> {format(selectedDate, "PPP")}
                </p>
              </div>
            )}
          </div>

          {/* Healthcare-Specific Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Healthcare Appointment Scheduling</h3>

            <FormField
              label="Schedule Appointment"
              description="Select an available date. Red dots indicate existing appointments."
            >
              <CalendarInput
                value={appointmentDate}
                onChange={setAppointmentDate}
                placeholder="Select appointment date"
                showTime={true}
                timeValue={appointmentTime}
                onTimeChange={setAppointmentTime}
                minDate={new Date()}
                appointmentDates={appointmentDates}
                highlightedDates={highlightedDates}
                showAppointmentIndicators={true}
              />
            </FormField>

            {appointmentDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Appointment Scheduled:</strong>{" "}
                  {format(appointmentDate, "PPP")}
                  {appointmentTime && ` at ${appointmentTime}`}
                </p>
              </div>
            )}
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>

            <FormField
              label="Date of Birth"
              description="Patient's date of birth (cannot select future dates)"
            >
              <CalendarInput
                value={birthDate}
                onChange={setBirthDate}
                placeholder="Select date of birth"
                maxDate={new Date()}
                dateFormat="PPPP"
              />
            </FormField>

            {birthDate && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Date of Birth:</strong> {format(birthDate, "PPPP")}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Age: {Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Calendar Legend</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary/10 border border-primary/20 rounded"></div>
                <span className="text-sm">Highlighted (Special dates)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent/50 rounded"></div>
                <span className="text-sm">Has Appointments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-4 h-4 bg-accent/50 rounded"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-destructive rounded-full"></div>
                </div>
                <span className="text-sm">Appointment Indicator</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-muted text-muted-foreground rounded opacity-50"></div>
                <span className="text-sm">Disabled/Unavailable</span>
              </div>
            </div>
          </div>

          {/* Sample Data Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sample Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Appointment Dates:</h4>
                <div className="space-y-1">
                  {appointmentDates.slice(0, 3).map((date, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {format(date, "MMM dd")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Special Dates:</h4>
                <div className="space-y-1">
                  {highlightedDates.map((date, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      {format(date, "MMM dd")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            <Button onClick={handleSubmit} className="flex-1">
              Submit Demo Data
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Different ways to use the CalendarInput component in your healthcare application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Basic Date Selection:</h4>
              <pre className="text-xs overflow-x-auto">
{`<CalendarInput
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select date"
/>`}
              </pre>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Appointment Scheduling:</h4>
              <pre className="text-xs overflow-x-auto">
{`<CalendarInput
  value={appointmentDate}
  onChange={setAppointmentDate}
  showTime={true}
  timeValue={appointmentTime}
  onTimeChange={setAppointmentTime}
  minDate={new Date()}
  appointmentDates={existingAppointments}
  showAppointmentIndicators={true}
/>`}
              </pre>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Date of Birth:</h4>
              <pre className="text-xs overflow-x-auto">
{`<CalendarInput
  value={birthDate}
  onChange={setBirthDate}
  maxDate={new Date()}
  dateFormat="PPPP"
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarInputDemo
