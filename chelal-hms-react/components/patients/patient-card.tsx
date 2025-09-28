"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"

interface PatientCardProps {
  patient: {
    id: string
    name: string
    age: number
    gender: string
    phone: string
    email: string
    address: string
    dateOfBirth: string
    medicalRecordNumber: string
    insuranceProvider: string
    emergencyContact: {
      name: string
      phone: string
      relationship: string
    }
    lastVisit: string
    nextAppointment?: string
    status: "stable" | "monitoring" | "critical" | "discharged"
    condition: string
    avatar?: string
  }
  onViewDetails?: (patientId: string) => void
  onEdit?: (patientId: string) => void
  onScheduleAppointment?: (patientId: string) => void
  compact?: boolean
}

const statusConfig = {
  stable: {
    label: "Stable",
    variant: "default" as const,
    icon: CheckCircle,
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
    icon: CheckCircle,
    color: "text-gray-600"
  }
}

export function PatientCard({
  patient,
  onViewDetails,
  onEdit,
  onScheduleAppointment,
  compact = false
}: PatientCardProps) {
  const statusInfo = statusConfig[patient.status]
  const StatusIcon = statusInfo.icon

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate">{patient.name}</h3>
                <Badge variant={statusInfo.variant} className="text-xs">
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {patient.age} years • {patient.condition}
              </p>
              <p className="text-xs text-muted-foreground">
                Last visit: {format(new Date(patient.lastVisit), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {patient.age} years • {patient.gender} • MRN: {patient.medicalRecordNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">DOB:</span>
              <span>{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{patient.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{patient.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Insurance: {patient.insuranceProvider}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>{patient.condition}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Emergency Contact</h4>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Name:</span> {patient.emergencyContact.name}</p>
            <p><span className="text-muted-foreground">Phone:</span> {patient.emergencyContact.phone}</p>
            <p><span className="text-muted-foreground">Relationship:</span> {patient.emergencyContact.relationship}</p>
          </div>
        </div>

        {/* Visit Information */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <p className="text-muted-foreground">Last Visit</p>
            <p className="font-medium">{format(new Date(patient.lastVisit), 'MMM dd, yyyy')}</p>
          </div>
          {patient.nextAppointment && (
            <div className="text-sm text-right">
              <p className="text-muted-foreground">Next Appointment</p>
              <p className="font-medium">{format(new Date(patient.nextAppointment), 'MMM dd, yyyy')}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(patient.id)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(patient.id)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onScheduleAppointment?.(patient.id)}
          >
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
