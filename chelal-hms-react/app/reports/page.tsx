'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/app-layout';
import {
  CustomLineChart,
  CustomBarChart,
  CustomPieChart,
  CustomAreaChart,
  CustomMultiLineChart,
  ChartLoading,
  ChartError
} from '@/components/dashboard/charts';
import {
  usePatientCount,
  useAppointmentsToday,
  useAppointmentsByDoctor,
  useTopMedications,
  useApiData
} from '@/hooks/useDashboard';
import {
  Download,
  Filter,
  Calendar,
  Users,
  Pill,
  DollarSign,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Save,
  Share2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ReportsSkeleton } from "@/components/ui/skeleton-loader"

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('summary');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // API hooks for basic dashboard data
  const { data: patientCount, loading: patientLoading } = usePatientCount();
  const { data: appointmentsToday, loading: appointmentsLoading } = useAppointmentsToday();
  const { data: appointmentsByDoctor, loading: doctorAppointmentsLoading } = useAppointmentsByDoctor();
  const { data: topMedications, loading: medicationsLoading } = useTopMedications();

  // Enhanced API calls for comprehensive reporting
  const { data: patientDemographics, loading: demographicsLoading } = useApiData('/patients/demographics/');
  const { data: revenueAnalytics, loading: revenueAnalyticsLoading } = useApiData('/financial-reports/revenue-analytics/');
  const { data: appointmentTrends, loading: appointmentTrendsLoading } = useApiData('/appointments/trends/');
  const { data: departmentStats, loading: departmentLoading } = useApiData('/departments/statistics/');
  const { data: inventoryReports, loading: inventoryLoading } = useApiData('/inventory/reports/');

  // Custom API calls for filtered data
  const { data: filteredAppointments, loading: filteredLoading } = useApiData(
    `/appointments/?date_from=${dateRange?.from?.toISOString().split('T')[0]}&date_to=${dateRange?.to?.toISOString().split('T')[0]}&department=${selectedDepartment}&doctor=${selectedDoctor}`
  );

  const { data: revenueReport, loading: revenueReportLoading } = useApiData(
    `/financial-reports/?date_from=${dateRange?.from?.toISOString().split('T')[0]}&date_to=${dateRange?.to?.toISOString().split('T')[0]}`
  );

  // Transform data for charts
  const appointmentsByDoctorData = appointmentsByDoctor?.appointments_by_doctor?.map(item => ({
    name: item.doctor_name,
    value: item.appointment_count,
    appointments: item.appointment_count
  })) || [];

  const topMedicationsData = topMedications?.top_medications?.map(item => ({
    name: item.medication_name,
    value: item.count,
    prescriptions: item.count
  })) || [];

  const revenueData = Array.isArray(revenueReport) ? revenueReport.map((item: any) => ({
    date: item.date,
    revenue: item.total_revenue,
    expenses: item.total_expenses,
    profit: item.net_profit
  })) : [];

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        // Force refresh by updating a timestamp
        setLastGenerated(new Date());
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Report generation handlers
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    // Implement PDF export logic
    console.log('Exporting to PDF...');
  };

  const handleExportCSV = () => {
    // Implement CSV export logic
    console.log('Exporting to CSV...');
  };

  const handleShareReport = () => {
    // Implement report sharing logic
    console.log('Sharing report...');
  };

  // Loading state for all data
  const isLoading = patientLoading || appointmentsLoading || doctorAppointmentsLoading || 
                   medicationsLoading || demographicsLoading || revenueAnalyticsLoading ||
                   appointmentTrendsLoading || departmentLoading || inventoryLoading ||
                   filteredLoading || revenueReportLoading;

  const handleExportReport = (reportType: string) => {
    // Implement export functionality
    console.log(`Exporting ${reportType} report`);
    // This would typically call an API endpoint to generate and download the report
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Enhanced Header with Auto-refresh and Report Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into hospital operations and performance</p>
            {lastGenerated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {format(lastGenerated, 'PPp')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Auto-refresh Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Report Actions */}
            <Button 
              variant="outline" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            
            <Button onClick={handleShareReport}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <div className="flex space-x-2">
                <Input type="date" placeholder="From date" />
                <Input type="date" placeholder="To date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                  <SelectItem value="dr-jones">Dr. Jones</SelectItem>
                  <SelectItem value="dr-brown">Dr. Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientCount?.patient_count || 0}</div>
                <p className="text-xs text-muted-foreground">All registered patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentsToday?.appointments?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">Prescriptions this month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Doctor</CardTitle>
                <CardDescription>Distribution of appointments among doctors</CardDescription>
              </CardHeader>
              <CardContent>
                {doctorAppointmentsLoading ? (
                  <ChartLoading />
                ) : appointmentsByDoctorData.length > 0 ? (
                  <CustomBarChart
                    data={appointmentsByDoctorData}
                    dataKey="value"
                    nameKey="name"
                    color="#8884d8"
                    height={300}
                  />
                ) : (
                  <ChartError error="No appointment data available" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Prescribed Medications</CardTitle>
                <CardDescription>Most frequently prescribed medications</CardDescription>
              </CardHeader>
              <CardContent>
                {medicationsLoading ? (
                  <ChartLoading />
                ) : topMedicationsData.length > 0 ? (
                  <CustomPieChart
                    data={topMedicationsData.slice(0, 8)}
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
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration Trend</CardTitle>
                <CardDescription>Monthly patient registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomAreaChart
                  data={[
                    { date: '2024-01', value: 120 },
                    { date: '2024-02', value: 135 },
                    { date: '2024-03', value: 148 },
                    { date: '2024-04', value: 162 },
                    { date: '2024-05', value: 178 },
                    { date: '2024-06', value: 195 },
                  ]}
                  dataKey="value"
                  color="#22c55e"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>Age and gender distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomPieChart
                  data={[
                    { name: '18-30', value: 245 },
                    { name: '31-50', value: 380 },
                    { name: '51-70', value: 290 },
                    { name: '70+', value: 185 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Distribution</CardTitle>
                <CardDescription>Breakdown of appointment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomPieChart
                  data={[
                    { name: 'Completed', value: 85 },
                    { name: 'Scheduled', value: 45 },
                    { name: 'Cancelled', value: 12 },
                    { name: 'No-show', value: 8 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Appointment Volume</CardTitle>
                <CardDescription>Appointments per day over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={[
                    { date: '2024-09-01', value: 25 },
                    { date: '2024-09-02', value: 30 },
                    { date: '2024-09-03', value: 28 },
                    { date: '2024-09-04', value: 35 },
                    { date: '2024-09-05', value: 32 },
                    { date: '2024-09-06', value: 38 },
                    { date: '2024-09-07', value: 42 },
                  ]}
                  dataKey="value"
                  color="#f59e0b"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medication Usage Trends</CardTitle>
                <CardDescription>Prescription trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomAreaChart
                  data={[
                    { date: '2024-01', value: 1200 },
                    { date: '2024-02', value: 1350 },
                    { date: '2024-03', value: 1480 },
                    { date: '2024-04', value: 1620 },
                    { date: '2024-05', value: 1780 },
                    { date: '2024-06', value: 1950 },
                  ]}
                  dataKey="value"
                  color="#ef4444"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Medication Categories</CardTitle>
                <CardDescription>Most prescribed medication categories</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomBarChart
                  data={[
                    { name: 'Antibiotics', value: 450 },
                    { name: 'Pain Relief', value: 380 },
                    { name: 'Cardiovascular', value: 290 },
                    { name: 'Diabetes', value: 185 },
                    { name: 'Respiratory', value: 160 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  color="#8b5cf6"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {isLoading ? (
            <ReportsSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Revenue vs Expenses
                  </CardTitle>
                  <CardDescription>Financial performance comparison over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <CustomMultiLineChart
                      data={revenueData}
                      lines={[
                        { dataKey: 'revenue', color: '#22c55e', name: 'Revenue' },
                        { dataKey: 'expenses', color: '#ef4444', name: 'Expenses' },
                        { dataKey: 'profit', color: '#3b82f6', name: 'Net Profit' }
                      ]}
                      height={300}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No financial data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription>Revenue sources distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomPieChart
                    data={[
                      { name: 'Consultations', value: 35000, color: '#3b82f6' },
                      { name: 'Procedures', value: 28000, color: '#10b981' },
                      { name: 'Lab Tests', value: 15000, color: '#f59e0b' },
                      { name: 'Medications', value: 12000, color: '#ef4444' },
                      { name: 'Emergency', value: 8000, color: '#8b5cf6' },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$98,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">$65,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+8%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">$33,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">33.7%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
};

export default ReportsPage;
