"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Plus,
  Users,
  UserPlus,
  Download,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  Activity,
  Eye,
  Edit,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react"
import { PatientCard } from "./patient-card"
import { apiHelpers } from "@/lib/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PatientListSkeleton } from "@/components/ui/skeleton-loader"

interface Patient {
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
  avatar: string
}

// Backend API response interface
interface BackendPatient {
  id: number
  has_recent_appointment: boolean
  unique_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  contact_info: string
  address: string
  known_allergies: string
  created_at: string
  updated_at: string
}

// Transform backend patient data to frontend format
const transformPatientData = (backendPatient: BackendPatient): Patient => {
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

  return {
    id: backendPatient.id.toString(),
    name: `${backendPatient.first_name} ${backendPatient.last_name}`,
    age: calculateAge(backendPatient.date_of_birth),
    gender: backendPatient.gender,
    phone: backendPatient.contact_info,
    email: '', // Backend doesn't provide email
    address: backendPatient.address,
    dateOfBirth: backendPatient.date_of_birth,
    medicalRecordNumber: backendPatient.unique_id,
    insuranceProvider: '', // Backend doesn't provide this
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    lastVisit: backendPatient.updated_at, // Using updated_at as last visit
    status: 'stable', // Default status since backend doesn't provide this
    condition: backendPatient.known_allergies || 'None',
    avatar: '' // Backend doesn't provide avatar
  }
}

interface PatientListProps {
  onPatientSelect?: (patientId: string) => void
  onAddPatient?: () => void
  onScheduleAppointment?: (patientId: string) => void
  viewMode?: "cards" | "table"
}

export const PatientList = memo<PatientListProps>(function PatientList({ onPatientSelect, onAddPatient, onScheduleAppointment, viewMode = "table" }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const patientsPerPage = 10

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update current page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, statusFilter, sortBy])

    // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const params = {
          page: currentPage,
          page_size: patientsPerPage,
          search: debouncedSearchTerm || undefined,
          ordering: sortBy === "name" ? "first_name" : sortBy === "age" ? "-date_of_birth" : "-updated_at"
        }
        
        const response = await apiHelpers.getPatients(params)
        
        // Handle paginated response
        const patientData = response.data.results || response.data
        const transformedPatients = patientData.map(transformPatientData)
        
        setPatients(transformedPatients)
        setTotalPatients(response.data.count || transformedPatients.length)
        setTotalPages(Math.ceil((response.data.count || transformedPatients.length) / patientsPerPage))
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch patients:', err)
        
        // If it's a 404 error (endpoint not found), use mock data for development
        if (err.response?.status === 404) {
          console.log('Patients endpoint not found, using mock data for development')
          setPatients([]) // Use empty array or add mock patients here
          setTotalPatients(0)
          setTotalPages(1)
          setError(null)
        } else {
          setError('Failed to load patients. Please try again.')
          setPatients([])
          setTotalPatients(0)
          setTotalPages(1)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
    }, [currentPage, patientsPerPage, sortBy, debouncedSearchTerm])

  // Filter and sort patients (client-side fallback)
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || patient.status === statusFilter
      const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter.toLowerCase()
      const matchesDateRange = (!dateRange.from || new Date(patient.dateOfBirth) >= dateRange.from) &&
                              (!dateRange.to || new Date(patient.dateOfBirth) <= dateRange.to)

      return matchesSearch && matchesStatus && matchesGender && matchesDateRange
    })
  }, [patients, searchTerm, statusFilter, genderFilter, dateRange])

  const handleViewDetails = (patientId: string) => {
    onPatientSelect?.(patientId)
  }

  const handleEdit = (patientId: string) => {
    console.log("Edit patient:", patientId)
  }

  const handleScheduleAppointment = (patientId: string) => {
    onScheduleAppointment?.(patientId)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await apiHelpers.getPatients({
        page: 1,
        page_size: 1000, // Export all patients
        search: debouncedSearchTerm || undefined,
        ordering: sortBy === "name" ? "first_name" : sortBy === "age" ? "-date_of_birth" : "-updated_at"
      })

      const patients = response.data.results || response.data

      // Transform data for CSV
      const csvData = patients.map((patient: any) => ({
        'Patient ID': patient.id,
        'First Name': patient.first_name,
        'Last Name': patient.last_name,
        'Email': patient.email,
        'Phone': patient.phone,
        'Date of Birth': patient.date_of_birth,
        'Gender': patient.gender,
        'Address': patient.address,
        'Emergency Contact': patient.emergency_contact,
        'Medical Record Number': patient.medical_record_number,
        'Status': patient.status,
        'Created': patient.created_at,
        'Updated': patient.updated_at
      }))

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      // You could add a toast notification here
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      stable: "default",
      monitoring: "secondary",
      critical: "destructive",
      discharged: "outline"
    } as const
    return variants[status as keyof typeof variants] || "default"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <PatientListSkeleton viewMode={viewMode} />
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

      {/* Main Content */}
      <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button onClick={onAddPatient}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p: Patient) => p.age >= 18).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pediatric Cases</p>
                <p className="text-2xl font-bold text-blue-600">
                  {patients.filter((p: Patient) => p.age < 18).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, MRN, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="lastVisit">Last Visit</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Birth Date From</label>
                <Input
                  type="date"
                  value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    from: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Birth Date To</label>
                <Input
                  type="date"
                  value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    to: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGenderFilter("all")
                    setDateRange({})
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Patient List - Table View */}
          {viewMode === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>MRN</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Next Appointment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No patients found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search criteria or add a new patient.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(patient.id)}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={patient.avatar} />
                              <AvatarFallback>
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">{patient.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{patient.age} years</div>
                            <div className="text-muted-foreground">{patient.gender}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{patient.medicalRecordNumber}</TableCell>
                        <TableCell>{patient.condition}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(patient.status)}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(patient.lastVisit)}</TableCell>
                        <TableCell>
                          {patient.nextAppointment ? formatDate(patient.nextAppointment) : "None"}
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
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(patient.id); }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(patient.id); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleScheduleAppointment(patient.id); }}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Schedule Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Card View */
            <div className="space-y-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No patients found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or add a new patient.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onScheduleAppointment={handleScheduleAppointment}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPatients.length} of {totalPatients} patients
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
})
