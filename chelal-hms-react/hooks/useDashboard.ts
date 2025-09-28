import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  DashboardData,
  DashboardStats,
  PatientCountReport,
  AppointmentsTodayReport,
  AppointmentsByDoctorReport,
  TopMedicationsReport,
  ApiResponse
} from '../lib/types/dashboard';

// API Base URL - adjust based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Combined dashboard data interface
interface CombinedDashboardData {
  dashboard: DashboardData;
  stats: DashboardStats;
  patientCount: PatientCountReport;
  appointmentsToday: AppointmentsTodayReport;
  appointmentsByDoctor: AppointmentsByDoctorReport;
  topMedications: TopMedicationsReport;
}

// Optimized hook that fetches all dashboard data in parallel
export const useCombinedDashboardData = () => {
  const [data, setData] = useState<CombinedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel using Promise.allSettled for better error handling
      const [
        dashboardRes,
        statsRes,
        patientCountRes,
        appointmentsTodayRes,
        appointmentsByDoctorRes,
        topMedicationsRes
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/dashboard/`, { headers }),
        axios.get(`${API_BASE_URL}/dashboard-stats/`, { headers }),
        axios.get(`${API_BASE_URL}/report/patient_count/`, { headers }),
        axios.get(`${API_BASE_URL}/report/appointments_today/`, { headers }),
        axios.get(`${API_BASE_URL}/report/appointments_by_doctor/`, { headers }),
        axios.get(`${API_BASE_URL}/report/top_prescribed_medications/`, { headers })
      ]);

      const combinedData: CombinedDashboardData = {
        dashboard: dashboardRes.status === 'fulfilled' ? dashboardRes.value.data : {
          notifications: [],
          system_health: { database: 'healthy' },
          whats_new: [],
          birthdays_today: [],
          anniversaries: [],
          patient_registrations_trend: [],
          revenue_trend: [],
          revenue_breakdown: []
        },
        stats: statsRes.status === 'fulfilled' ? statsRes.value.data : null,
        patientCount: patientCountRes.status === 'fulfilled' ? patientCountRes.value.data : null,
        appointmentsToday: appointmentsTodayRes.status === 'fulfilled' ? appointmentsTodayRes.value.data : null,
        appointmentsByDoctor: appointmentsByDoctorRes.status === 'fulfilled' ? appointmentsByDoctorRes.value.data : null,
        topMedications: topMedicationsRes.status === 'fulfilled' ? topMedicationsRes.value.data : null
      };

      setData(combinedData);

      // Check if any requests failed
      const failedRequests = [dashboardRes, statsRes, patientCountRes, appointmentsTodayRes, appointmentsByDoctorRes, topMedicationsRes]
        .filter(result => result.status === 'rejected');

      if (failedRequests.length > 0) {
        console.warn(`${failedRequests.length} dashboard API requests failed, using fallback data where available`);
      }

    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Combined dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  const refetch = useCallback(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  return {
    data,
    loading,
    error,
    refetch,
    // Individual data accessors for backward compatibility
    dashboardData: data?.dashboard || null,
    stats: data?.stats || null,
    patientCount: data?.patientCount || null,
    appointmentsToday: data?.appointmentsToday || null,
    appointmentsByDoctor: data?.appointmentsByDoctor || null,
    topMedications: data?.topMedications || null
  };
};

// Legacy hooks for backward compatibility - these now use the combined hook internally
export const useDashboardData = () => {
  const combined = useCombinedDashboardData();
  return {
    data: combined.dashboardData,
    loading: combined.loading,
    error: combined.error,
    refetch: combined.refetch
  };
};

export const useDashboardStats = () => {
  const combined = useCombinedDashboardData();
  return {
    stats: combined.stats,
    loading: combined.loading,
    error: combined.error
  };
};

export const usePatientCount = () => {
  const combined = useCombinedDashboardData();
  return {
    data: combined.patientCount,
    loading: combined.loading,
    error: combined.error
  };
};

export const useAppointmentsToday = () => {
  const combined = useCombinedDashboardData();
  return {
    data: combined.appointmentsToday,
    loading: combined.loading,
    error: combined.error
  };
};

export const useAppointmentsByDoctor = () => {
  const combined = useCombinedDashboardData();
  return {
    data: combined.appointmentsByDoctor,
    loading: combined.loading,
    error: combined.error
  };
};

export const useTopMedications = () => {
  const combined = useCombinedDashboardData();
  return {
    data: combined.topMedications,
    loading: combined.loading,
    error: combined.error
  };
};

// Generic API hook for custom endpoints
export const useApiData = <T>(endpoint: string, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err: any) {
        // Handle 404s gracefully by providing empty data
        if (err.response?.status === 404) {
          console.warn(`API endpoint ${endpoint} not found, using fallback data`);
          setData(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          console.error('API data fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};
