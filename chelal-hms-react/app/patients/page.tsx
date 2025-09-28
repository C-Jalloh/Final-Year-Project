"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PatientList } from "@/components/patients"
import { PatientForm } from "@/components/patients"
import { PatientDetails } from "@/components/patients"
import { AppLayout } from "@/components/layout/app-layout"

type ViewMode = "list" | "details" | "form"

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const router = useRouter()

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
    setViewMode("details")
  }

  const handleAddPatient = () => {
    setFormMode("add")
    setIsFormOpen(true)
  }

  const handleEditPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleScheduleAppointment = (patientId: string) => {
    // Navigate to appointments page with patient pre-selected
    router.push(`/appointments?patientId=${patientId}`)
  }

  const handleSavePatient = (patientData: any) => {
    console.log("Saving patient:", patientData)
    // Patient is saved via the form component, just close the form
    setIsFormOpen(false)
    setSelectedPatientId(null)
    setFormMode("add")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedPatientId(null)
  }

  if (viewMode === "details" && selectedPatientId) {
    return (
      <AppLayout>
        <PatientDetails
          patientId={selectedPatientId}
          onBack={handleBackToList}
          onEdit={handleEditPatient}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PatientList
        onPatientSelect={handlePatientSelect}
        onAddPatient={handleAddPatient}
        onScheduleAppointment={handleScheduleAppointment}
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePatient}
        mode={formMode}
      />
    </AppLayout>
  )
}
