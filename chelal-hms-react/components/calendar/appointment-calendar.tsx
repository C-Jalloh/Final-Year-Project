"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Appointment {
  id: number
  patient: {
    id: number
    first_name: string
    last_name: string
    unique_id: string
    contact_info: string
    email?: string
  }
  doctor: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  patientName?: string // Computed field for compatibility
  patientId?: string // Computed field for compatibility
  type?: string // Not in backend, but used in frontend
  notes?: string // Not in backend, but used in frontend
  contact?: {
    phone: string
    email: string
  }
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onNewAppointment?: (date: Date) => void
  className?: string
}

type ViewType = "month" | "week" | "day"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200"
    case "confirmed": return "bg-green-100 text-green-800 border-green-200"
    case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
    case "cancelled": return "bg-red-100 text-red-800 border-red-200"
    case "no-show": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
  onNewAppointment,
  className
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")

  // Get appointments for current month
  const monthAppointments = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= startOfMonth && aptDate <= endOfMonth
    })
  }, [appointments, currentDate])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    monthAppointments.forEach(apt => {
      const dateKey = new Date(apt.date).toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(apt)
    })
    return grouped
  }, [monthAppointments])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

    const weeks = []
    let currentWeek = []
    let day = new Date(startDate)

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dateKey = day.toDateString()
      const dayAppointments = appointmentsByDate[dateKey] || []
      const isCurrentMonth = day.getMonth() === currentDate.getMonth()
      const isToday = day.toDateString() === new Date().toDateString()

      currentWeek.push(
        <div
          key={i}
          className={cn(
            "min-h-[120px] border border-border p-2 cursor-pointer hover:bg-muted/50 transition-colors",
            !isCurrentMonth && "bg-muted/20 text-muted-foreground",
            isToday && "bg-primary/10 border-primary"
          )}
          onClick={() => onNewAppointment?.(new Date(day))}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-medium",
              isToday && "text-primary font-bold"
            )}>
              {day.getDate()}
            </span>
            {dayAppointments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dayAppointments.length}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                className={cn(
                  "text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity",
                  getStatusColor(apt.status)
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onAppointmentClick?.(apt)
                }}
              >
                <div className="font-medium truncate">{apt.patientName}</div>
                <div className="text-xs opacity-75">{apt.time}</div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayAppointments.length - 3} more
              </div>
            )}
          </div>
        </div>
      )

      day.setDate(day.getDate() + 1)

      if (currentWeek.length === 7) {
        weeks.push(
          <div key={weeks.length} className="grid grid-cols-7">
            {currentWeek}
          </div>
        )
        currentWeek = []
      }
    }

    return (
      <div className="space-y-4">
        {/* Month Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="border rounded-lg overflow-hidden">
          {weeks}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    // Simplified week view - shows current week
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      const dateKey = day.toDateString()
      const dayAppointments = appointmentsByDate[dateKey] || []

      weekDays.push(
        <div key={i} className="flex-1 border-r last:border-r-0 p-4">
          <div className="text-center mb-4">
            <div className="font-medium">{DAYS_OF_WEEK[day.getDay()]}</div>
            <div className="text-2xl font-bold">{day.getDate()}</div>
          </div>

          <div className="space-y-2">
            {dayAppointments.map((apt) => (
              <Card key={apt.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{apt.patientName}</div>
                    <div className="text-xs text-muted-foreground">{apt.time}</div>
                    <div className="text-xs">{apt.type}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAppointmentClick?.(apt)}>
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Week of {startOfWeek.toLocaleDateString()}</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="flex">
            {weekDays}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Appointments Calendar
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewType === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("month")}
            >
              Month
            </Button>
            <Button
              variant={viewType === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("week")}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNewAppointment?.(new Date())}
            >
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === "month" && renderMonthView()}
        {viewType === "week" && renderWeekView()}
      </CardContent>
    </Card>
  )
}
