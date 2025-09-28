"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Pill,
  AlertTriangle,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  FileText,
  Edit,
  Printer,
  Download,
  ArrowLeft,
  Shield,
  Clock,
  Upload,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { apiHelpers } from "@/lib/api-client"

// Mock patient data - in a real app, this would come from an API
const mockPatientDetails = {
  id: "1",
  name: "Sarah Johnson",
  age: 34,
  gender: "Female",
  phone: "+1 (555) 123-4567",
  email: "sarah.johnson@email.com",
  address: "123 Main St, Springfield, IL 62701",
  dateOfBirth: "1991-03-15",
  medicalRecordNumber: "MRN001234",
  insuranceProvider: "Blue Cross Blue Shield",
  insuranceNumber: "BCBS123456789",
  emergencyContact: {
    name: "Michael Johnson",
    phone: "+1 (555) 987-6543",
    relationship: "Husband"
  },
  status: "stable" as const,
  condition: "Hypertension",
  avatar: "/placeholder-user.png",

  // Vital signs
  vitalSigns: {
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 98.6,
    weight: 145,
    height: "5'6\"",
    bmi: 23.4,
    oxygenSaturation: 98
  },

  // Medical history
  medicalHistory: [
    {
      id: "1",
      date: "2025-01-15",
      type: "Consultation",
      provider: "Dr. Michael Chen",
      diagnosis: "Hypertension - Stage 1",
      notes: "Patient reports occasional headaches and fatigue. Blood pressure readings consistent with mild hypertension.",
      medications: ["Lisinopril 10mg daily"],
      followUp: "3 months"
    },
    {
      id: "2",
      date: "2024-10-20",
      type: "Annual Physical",
      provider: "Dr. Emily Rodriguez",
      diagnosis: "Hypertension - Prehypertension",
      notes: "Routine annual exam. Blood pressure elevated but not yet in hypertensive range.",
      medications: [],
      followUp: "1 year"
    }
  ],

  // Current medications
  medications: [
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2025-01-15",
      prescribedBy: "Dr. Michael Chen",
      status: "active"
    }
  ],

  // Allergies
  allergies: [
    {
      id: "1",
      allergen: "Penicillin",
      reaction: "Rash",
      severity: "Moderate",
      dateIdentified: "2018-03-10"
    }
  ],

  // Lab results
  labResults: [
    {
      id: "1",
      date: "2025-01-15",
      test: "Complete Blood Count",
      result: "Normal",
      referenceRange: "See report",
      status: "normal"
    },
    {
      id: "2",
      date: "2025-01-15",
      test: "Lipid Panel",
      result: "See report",
      referenceRange: "See report",
      status: "normal"
    }
  ],

  // Appointments
  appointments: [
    {
      id: "1",
      date: "2025-01-22",
      time: "10:00 AM",
      type: "Follow-up",
      provider: "Dr. Michael Chen",
      status: "scheduled",
      notes: "Blood pressure check and medication review"
    },
    {
      id: "2",
      date: "2025-04-15",
      time: "10:00 AM",
      type: "Annual Physical",
      provider: "Dr. Emily Rodriguez",
      status: "scheduled",
      notes: "Routine annual examination"
    }
  ]
}

interface PatientDetailsProps {
  patientId: string
  onBack?: () => void
  onEdit?: (patientId: string) => void
}

const statusConfig = {
  stable: {
    label: "Stable",
    variant: "default" as const,
    icon: Activity,
    color: "text-green-600"
  },
  monitoring: {
    label: "Monitoring",
    variant: "secondary" as const,
    icon: Activity,
    color: "text-blue-600"
  },
  critical: {
    label: "Critical",
    variant: "destructive" as const,
    icon: AlertTriangle,
    color: "text-red-600"
  },
  discharged: {
    label: "Discharged",
    variant: "outline" as const,
    icon: Activity,
    color: "text-gray-600"
  }
}

export function PatientDetails({ patientId, onBack, onEdit }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true)
        const response = await apiHelpers.getPatient(patientId)
        
        // Transform backend data to match component expectations
        const patientData = {
          id: response.data.id.toString(),
          name: `${response.data.first_name} ${response.data.last_name}`,
          age: calculateAge(response.data.date_of_birth),
          gender: response.data.gender,
          phone: response.data.contact_info,
          email: '', // Backend doesn't provide email
          address: response.data.address,
          dateOfBirth: response.data.date_of_birth,
          medicalRecordNumber: response.data.unique_id,
          insuranceProvider: '', // Backend doesn't provide this
          insuranceNumber: '', // Backend doesn't provide this
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          status: 'stable' as const,
          condition: response.data.known_allergies || 'None',
          avatar: '',
          
          // Mock data for now - these would come from additional API endpoints
          vitalSigns: {
            bloodPressure: "120/80",
            heartRate: 72,
            temperature: 98.6,
            weight: 145,
            height: "5'6\"",
            bmi: 23.4,
            oxygenSaturation: 98
          },
          
          medicalHistory: [],
          medications: [],
          allergies: [],
          labResults: [],
          appointments: []
        }
        
        setPatient(patientData)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch patient details:', err)
        setError('Failed to load patient details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const statusInfo = patient ? {
    stable: {
      label: "Stable",
      variant: "default" as const,
      icon: Activity,
      color: "text-green-600"
    },
    monitoring: {
      label: "Monitoring",
      variant: "secondary" as const,
      icon: Activity,
      color: "text-blue-600"
    },
    critical: {
      label: "Critical",
      variant: "destructive" as const,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    discharged: {
      label: "Discharged",
      variant: "outline" as const,
      icon: Activity,
      color: "text-gray-600"
    }
  }[patient.status as keyof typeof statusConfig] : null

  const StatusIcon = statusInfo?.icon || Activity

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading patient details...</span>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
          <Button onClick={onBack}>
            Back to Patients
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {patient.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.age} years • {patient.gender} • MRN: {patient.medicalRecordNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusInfo?.variant || "default"} className="flex items-center gap-1">
            {statusInfo?.icon && <statusInfo.icon className="h-3 w-3" />}
            {statusInfo?.label || "Unknown"}
          </Badge>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => onEdit?.(patientId)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* Patient Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span>{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span>{patient.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span>{patient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Condition:</span>
                  <span>{patient.condition}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{patient.insuranceProvider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Policy Number</p>
                  <p className="font-medium">{patient.insuranceNumber}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Current Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="text-xl font-bold">{patient.vitalSigns.bloodPressure}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="text-xl font-bold">{patient.vitalSigns.heartRate} bpm</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-xl font-bold">{patient.vitalSigns.temperature}°F</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Weight className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-xl font-bold">{patient.vitalSigns.weight} lbs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{patient.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.emergencyContact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{patient.emergencyContact.relationship}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history" className="space-y-4">
          {patient.medicalHistory.map((visit: any) => (
            <Card key={visit.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{visit.type}</CardTitle>
                  <Badge variant="outline">{format(new Date(visit.date), 'MMM dd, yyyy')}</Badge>
                </div>
                <p className="text-muted-foreground">Provider: {visit.provider}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Diagnosis</h4>
                  <p>{visit.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{visit.notes}</p>
                </div>
                {visit.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Medications Prescribed</h4>
                    <div className="flex flex-wrap gap-2">
                      {visit.medications.map((medication: string, index: number) => (
                        <Badge key={index} variant="secondary">{medication}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Follow-up: {visit.followUp}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          {patient.medications.map((medication: any) => (
            <Card key={medication.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{medication.name}</h3>
                    <p className="text-muted-foreground">
                      {medication.dosage} • {medication.frequency}
                    </p>
                  </div>
                  <Badge variant={medication.status === "active" ? "default" : "secondary"}>
                    {medication.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Prescribed by</p>
                    <p>{medication.prescribedBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start date</p>
                    <p>{format(new Date(medication.startDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {patient.allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.allergies.map((allergy: any) => (
                    <div key={allergy.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{allergy.allergen}</p>
                        <p className="text-sm text-muted-foreground">
                          Reaction: {allergy.reaction} • Severity: {allergy.severity}
                        </p>
                      </div>
                      <Badge variant="destructive">{allergy.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="labs" className="space-y-4">
          {patient.labResults.map((lab: any) => (
            <Card key={lab.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{lab.test}</h3>
                  <Badge variant={lab.status === "normal" ? "default" : "destructive"}>
                    {lab.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{format(new Date(lab.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Result</p>
                    <p>{lab.result}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reference Range</p>
                    <p>{lab.referenceRange}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          {patient.appointments.map((appointment: any) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{appointment.type}</h3>
                    <p className="text-muted-foreground">
                      {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                    </p>
                  </div>
                  <Badge variant={appointment.status === "scheduled" ? "default" : "secondary"}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p>{appointment.provider}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Notes</p>
                    <p>{appointment.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Document Management</h3>
              <p className="text-muted-foreground mb-4">
                Patient documents, lab reports, and medical records will be displayed here.
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
