"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Eye,
  Loader2
} from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { AppointmentCalendar, GoogleCalendarButton, AppointmentForm, type Appointment } from "@/components/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentsSkeleton } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { apiHelpers } from "@/lib/api-client"

// Transform backend appointment data to frontend format
const transformAppointmentData = (backendAppointment: any): Appointment => {
  return {
    id: backendAppointment.id,
    patient: backendAppointment.patient,
    doctor: backendAppointment.doctor,
    date: backendAppointment.date,
    time: backendAppointment.time,
    status: backendAppointment.status,
    created_at: backendAppointment.created_at,
    updated_at: backendAppointment.updated_at,
    patientName: `${backendAppointment.patient.first_name} ${backendAppointment.patient.last_name}`,
    patientId: backendAppointment.patient.unique_id,
    type: "General Checkup", // Default type since not in backend
    notes: "", // Not in backend
    contact: {
      phone: backendAppointment.patient.contact_info,
      email: backendAppointment.patient.email || ""
    }
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    scheduled: "default",
    confirmed: "secondary",
    completed: "default",
    cancelled: "destructive",
    "no-show": "outline"
  } as const
  return variants[status as keyof typeof variants] || "default"
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "confirmed":
      return <AlertCircle className="h-4 w-4 text-blue-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>("calendar")
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentId, setAppointmentId] = useState<number | null>(null)
  const { toast } = useToast()

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const response = await apiHelpers.getAppointments()
        const appointmentData = response.data.results || response.data
        const transformedAppointments = appointmentData.map(transformAppointmentData)
        setAppointments(transformedAppointments)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err)
        setError('Failed to load appointments. Please try again.')
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter(appointment => {
    if (statusFilter !== "all" && appointment.status !== statusFilter) return false
    if (dateFilter !== "all") {
      const appointmentDate = new Date(appointment.date).toDateString()
      const today = new Date().toDateString()
      const tomorrow = new Date(Date.now() + 86400000).toDateString()

      if (dateFilter === "today" && appointmentDate !== today) return false
      if (dateFilter === "tomorrow" && appointmentDate !== tomorrow) return false
    }
    return true
  })

  const handleNewAppointment = () => {
    setSelectedAppointment(null)
    setShowAppointmentForm(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setAppointmentId(appointment.id)
    setShowAppointmentForm(true)
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (!confirm(`Are you sure you want to cancel the appointment for ${appointment.patientName} on ${appointment.date} at ${appointment.time}?`)) {
      return
    }

    try {
      await apiHelpers.deleteAppointment(appointment.id.toString())
      toast({
        title: "Appointment Cancelled",
        description: `Appointment for ${appointment.patientName} has been cancelled successfully.`,
      })
      
      // Refresh appointments list
      const response = await apiHelpers.getAppointments()
      const appointmentData = response.data.results || response.data
      const transformedAppointments = appointmentData.map(transformAppointmentData)
      setAppointments(transformedAppointments)
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAppointment = (appointmentData: any) => {
    // Refresh appointments list
    const fetchAppointments = async () => {
      try {
        const response = await apiHelpers.getAppointments()
        const appointmentData = response.data.results || response.data
        const transformedAppointments = appointmentData.map(transformAppointmentData)
        setAppointments(transformedAppointments)
      } catch (error) {
        console.error('Failed to refresh appointments:', error)
      }
    }
    fetchAppointments()
  }

  const todayAppointments = appointments.filter(apt =>
    new Date(apt.date).toDateString() === new Date().toDateString()
  )

  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.date) > new Date() && apt.status !== "cancelled"
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage patient appointments and schedules
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button size="sm" onClick={handleNewAppointment}>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <AppointmentsSkeleton />
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.filter(apt => apt.status === "completed").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAppointments.filter(apt => apt.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((todayAppointments.filter(apt => apt.status === "completed").length / Math.max(todayAppointments.length, 1)) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === "cancelled").length}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger
                  value="calendar"
                  className={activeTab === 'calendar' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
                >
                  Calendar View
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className={activeTab === 'list' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
                >
                  List View
                </TabsTrigger>
              </TabsList>
              <GoogleCalendarButton
                appointments={filteredAppointments}
                className="ml-4"
              />
            </div>
            <TabsContent value="calendar" className="space-y-4 mt-0">
              <AppointmentCalendar
                appointments={filteredAppointments}
                onAppointmentClick={handleEditAppointment}
                onNewAppointment={handleNewAppointment}
              />
            </TabsContent>

            <TabsContent value="list" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment List</CardTitle>
                  <CardDescription>View and manage all appointments</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointments Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {appointment.patientName?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{appointment.patientName || `${appointment.patient.first_name} ${appointment.patient.last_name}`}</div>
                                <div className="text-sm text-muted-foreground">{appointment.patientId || appointment.patient.unique_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.doctor ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 'Unknown Doctor'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(appointment.date).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">{appointment.time}</div>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(appointment.status)}
                              <Badge variant={getStatusBadge(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Patient
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleCancelAppointment(appointment)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No appointments found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your filters or create a new appointment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
          </>
        )}

        {/* Appointment Form */}
        <AppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => {
            setShowAppointmentForm(false)
            setSelectedAppointment(null)
            setAppointmentId(null)
          }}
          onSave={handleSaveAppointment}
          initialData={selectedAppointment ? {
            patient: selectedAppointment.patient.id.toString(),
            doctor: selectedAppointment.doctor.id.toString(),
            date: selectedAppointment.date,
            time: selectedAppointment.time,
            status: selectedAppointment.status
          } : undefined}
          mode={selectedAppointment ? "edit" : "create"}
          appointmentId={appointmentId || undefined}
        />
      </div>
    </AppLayout>
  )
}
