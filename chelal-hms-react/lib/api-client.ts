import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'

// API Base URL - should match your Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chelal-hms-backend-34t7ysolua-uc.a.run.app/api'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout to 5 seconds to prevent hanging
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or your auth state management
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          })

          const { access } = response.data
          localStorage.setItem('access_token', access)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and let the calling code handle navigation
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        // Don't redirect here - let the auth context handle navigation
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Helper functions for common API operations
export const apiHelpers = {
  // Authentication
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/', credentials),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh/', { refresh: refreshToken }),

  register: (userData: any) =>
    apiClient.post('/register/', userData),

  // User profile
  getProfile: () =>
    apiClient.get('/profile/'),

  updateProfile: (data: any) => {
    // If data is FormData, don't set Content-Type to let browser set it automatically
    const config = data instanceof FormData ? { headers: {} } : {}
    console.log('updateProfile called with:', data instanceof FormData ? 'FormData' : data)
    console.log('Request config:', config)
    return apiClient.patch('/profile/', data, config)
  },

  // User preferences
  getPreferences: () =>
    apiClient.get('/preferences/'),

  updatePreferences: (data: any) =>
    apiClient.put('/preferences/', data),

  // Role management
  getRoleChangeRequests: (params?: any) =>
    apiClient.get('/role-change-requests/', { params }),

  createRoleChangeRequest: (data: any) =>
    apiClient.post('/role-change-requests/', data),

  approveRoleChangeRequest: (id: string, data?: any) =>
    apiClient.post(`/role-change-requests/${id}/approve/`, data),

  rejectRoleChangeRequest: (id: string, data?: any) =>
    apiClient.post(`/role-change-requests/${id}/reject/`, data),

  assignRole: (data: any) =>
    apiClient.post('/role-change-requests/assign_role/', data),

  // Dashboard
  getDashboardStats: () =>
    apiClient.get('/dashboard-stats/'),

  // Patients
  getPatients: (params?: any) =>
    apiClient.get('/patients/', { params }),

  getPatient: (id: string) =>
    apiClient.get(`/patients/${id}/`),

  createPatient: (data: any) =>
    apiClient.post('/patients/', data),

  updatePatient: (id: string, data: any) =>
    apiClient.patch(`/patients/${id}/`, data),

  deletePatient: (id: string) =>
    apiClient.delete(`/patients/${id}/`),

  // Appointments
  getAppointments: (params?: any) =>
    apiClient.get('/appointments/', { params }),

  createAppointment: (data: any) =>
    apiClient.post('/appointments/', data),

  updateAppointment: (id: string, data: any) =>
    apiClient.patch(`/appointments/${id}/`, data),

  deleteAppointment: (id: string) =>
    apiClient.delete(`/appointments/${id}/`),

  // Prescriptions
  getPrescriptions: (params?: any) =>
    apiClient.get('/prescriptions/', { params }),

  createPrescription: (data: any) =>
    apiClient.post('/prescriptions/', data),

  // Medications
  getMedications: (params?: any) =>
    apiClient.get('/medications/', { params }),

  getMedication: (id: string) =>
    apiClient.get(`/medications/${id}/`),

  createMedication: (data: any) =>
    apiClient.post('/medications/', data),

  updateMedication: (id: string, data: any) =>
    apiClient.patch(`/medications/${id}/`, data),

  deleteMedication: (id: string) =>
    apiClient.delete(`/medications/${id}/`),

  // Medication Categories
  getMedicationCategories: (params?: any) =>
    apiClient.get('/medication-categories/', { params }),

  createMedicationCategory: (data: any) =>
    apiClient.post('/medication-categories/', data),

  updateMedicationCategory: (id: string, data: any) =>
    apiClient.patch(`/medication-categories/${id}/`, data),

  deleteMedicationCategory: (id: string) =>
    apiClient.delete(`/medication-categories/${id}/`),

  // Reports
  getPatientCount: () =>
    apiClient.get('/report/patient_count/'),

  getAppointmentsToday: () =>
    apiClient.get('/report/appointments_today/'),

  getTopMedications: () =>
    apiClient.get('/report/top_prescribed_medications/'),

  // Billing
  getBills: (params?: any) =>
    apiClient.get('/bills/', { params }),

  getBill: (id: string) =>
    apiClient.get(`/bills/${id}/`),

  createBill: (data: any) =>
    apiClient.post('/bills/', data),

  updateBill: (id: string, data: any) =>
    apiClient.patch(`/bills/${id}/`, data),

  deleteBill: (id: string) =>
    apiClient.delete(`/bills/${id}/`),

  // Payments
  getPayments: (params?: any) =>
    apiClient.get('/payments/', { params }),

  createPayment: (data: any) =>
    apiClient.post('/payments/', data),

  // Service Items/Catalog
  getServiceItems: (params?: any) =>
    apiClient.get('/service-catalog/', { params }),

  createServiceItem: (data: any) =>
    apiClient.post('/service-catalog/', data),

  // Financial Reports
  getBillingStats: () =>
    apiClient.get('/report/billing-stats/').catch((err: any) => {
      console.warn('Billing stats endpoint not found, returning mock data');
      return { data: { total_revenue: 0, pending_bills: 0, collections: 0 } };
    }),

  getRevenueReport: (params?: any) =>
    apiClient.get('/report/revenue/', { params }).catch((err: any) => {
      console.warn('Revenue report endpoint not found, returning mock data');
      return { data: [] };
    }),
}

export type { AxiosResponse }
