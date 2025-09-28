"use client"

import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Calendar,
  Pill,
  CreditCard,
  Bed,
  Bell,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Stethoscope,
  Heart,
  Thermometer,
  DollarSign,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  useDashboardData,
  useDashboardStats,
  usePatientCount,
  useAppointmentsToday,
  useAppointmentsByDoctor,
  useTopMedications
} from "@/hooks/useDashboard"
import {
  CustomLineChart,
  CustomBarChart,
  CustomPieChart,
  CustomAreaChart,
  ChartLoading,
  ChartError
} from "@/components/dashboard/charts"
import { DashboardSkeleton } from "@/components/ui/skeleton-loader"
import { AppLayout } from "@/components/layout/app-layout"

// Lazy load chart components for better performance
const LazyCustomLineChart = lazy(() => import("@/components/dashboard/charts").then(module => ({ default: module.CustomLineChart })))
const LazyCustomBarChart = lazy(() => import("@/components/dashboard/charts").then(module => ({ default: module.CustomBarChart })))
const LazyCustomPieChart = lazy(() => import("@/components/dashboard/charts").then(module => ({ default: module.CustomPieChart })))
const LazyCustomAreaChart = lazy(() => import("@/components/dashboard/charts").then(module => ({ default: module.CustomAreaChart })))

// Mock data for demonstration
const patientStats = [
  { month: "Jan", patients: 120 },
  { month: "Feb", patients: 135 },
  { month: "Mar", patients: 148 },
  { month: "Apr", patients: 162 },
  { month: "May", patients: 178 },
  { month: "Jun", patients: 195 },
]

const appointmentStats = [
  { name: "Completed", value: 85, color: "#22c55e" },
  { name: "Scheduled", value: 45, color: "#3b82f6" },
  { name: "Cancelled", value: 12, color: "#ef4444" },
  { name: "No-show", value: 8, color: "#f59e0b" },
]

const recentAppointments = [
  {
    id: "1",
    patient: "John Doe",
    time: "09:00 AM",
    type: "General Checkup",
    status: "completed",
  },
  {
    id: "2",
    patient: "Jane Smith",
    time: "10:30 AM",
    type: "Cardiology",
    status: "in-progress",
  },
  {
    id: "3",
    patient: "Bob Johnson",
    time: "02:00 PM",
    type: "Dental",
    status: "scheduled",
  },
]

export default memo(function DashboardPage() {
  const { theme } = useTheme()
  const router = useRouter()

  // Real-time update state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // API hooks for real data
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboardData()
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { data: patientCount, loading: patientLoading } = usePatientCount()
  const { data: appointmentsToday, loading: appointmentsTodayLoading } = useAppointmentsToday()
  const { data: appointmentsByDoctor, loading: appointmentsLoading } = useAppointmentsByDoctor()
  const { data: topMedications, loading: medicationsLoading } = useTopMedications()

  // Combined loading state
  const isLoading = dashboardLoading || statsLoading || patientLoading || appointmentsTodayLoading || appointmentsLoading || medicationsLoading

  // Memoized data transformations to prevent unnecessary recalculations
  const appointmentsByDoctorData = useMemo(() =>
    appointmentsByDoctor?.appointments_by_doctor?.map(item => ({
      name: item.doctor_name,
      value: item.appointment_count
    })) || [],
    [appointmentsByDoctor]
  )

  const topMedicationsData = useMemo(() =>
    topMedications?.top_medications?.map(item => ({
      name: item.medication_name,
      value: item.count
    })) || [],
    [topMedications]
  )

  const patientTrendData = useMemo(() =>
    dashboardData?.patient_registrations_trend?.map(item => ({
      date: item.date,
      value: item.count || 0
    })) || [],
    [dashboardData?.patient_registrations_trend]
  )

  const revenueTrendData = useMemo(() =>
    dashboardData?.revenue_trend?.map(item => ({
      date: item.date,
      value: item.total || 0
    })) || [],
    [dashboardData?.revenue_trend]
  )

  const revenueBreakdownData = dashboardData?.revenue_breakdown?.map(item => ({
    name: item.department || 'General',
    value: item.total
  })) || []

  // Manual refresh function with debouncing
  const handleRefresh = useCallback(async () => {
    // Prevent multiple rapid refreshes
    if (isLoading) return

    await refetchDashboard()
    setLastUpdated(new Date())
  }, [refetchDashboard, isLoading])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, handleRefresh])

  // Loading state
  if (dashboardLoading || statsLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    )
  }

  // Error state
  if (dashboardError || statsError) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Error loading dashboard data</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ChartError error={dashboardError || statsError || 'Failed to load dashboard'} />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : patientCount?.patient_count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : appointmentsToday?.appointments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-3%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Appointments by Doctor</CardTitle>
              <CardDescription>Distribution of appointments among doctors</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartLoading />
              ) : appointmentsByDoctorData.length > 0 ? (
                <Suspense fallback={<ChartLoading />}>
                  <LazyCustomBarChart
                    data={appointmentsByDoctorData}
                    dataKey="value"
                    nameKey="name"
                    color="#3b82f6"
                    height={300}
                  />
                </Suspense>
              ) : (
                <ChartError error="No appointment data available" />
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Medications</CardTitle>
              <CardDescription>Most prescribed medications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartLoading />
              ) : topMedicationsData.length > 0 ? (
                <CustomPieChart
                  data={topMedicationsData}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                />
              ) : (
                <ChartError error="No medication data available" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
})
