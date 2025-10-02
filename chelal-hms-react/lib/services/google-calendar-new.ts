import { Appointment } from "../../components/calendar"
import apiClient from "../api-client"
import { useState, useEffect } from "react"

// Google Calendar API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

class GoogleCalendarService {
  private isConnected = false

    // Check if Google Calendar is connected
  async checkConnection(): Promise<boolean> {
    try {
      // Set a shorter timeout for connection check
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await apiClient.get('/google-calendar/connection/', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      this.isConnected = response.data.connected || false
      return this.isConnected
    } catch (error: any) {
      console.log('Google Calendar connection check failed:', error.message)
      
      // Handle specific error cases gracefully
      if (error.code === 'ABORT_ERROR' || error.name === 'AbortError') {
        console.log('Google Calendar connection check timed out')
      } else if (error.response?.status === 404) {
        console.log('Google Calendar endpoint not found - using offline mode')
      }
      
      this.isConnected = false
      return false
    }
  }

  // Initiate OAuth flow
  async initiateAuth(): Promise<string> {
    try {
      const response = await apiClient.get('/google-calendar/auth/')
      return response.data.auth_url
    } catch (error) {
      console.error('Error initiating Google Calendar auth:', error)
      throw new Error('Failed to initiate authentication')
    }
  }

  // Handle OAuth callback
  async handleCallback(code: string): Promise<void> {
    try {
      await apiClient.post('/google-calendar/callback/', { code })
      this.isConnected = true
    } catch (error) {
      console.error('Error handling Google Calendar callback:', error)
      throw new Error('Failed to complete authentication')
    }
  }

  // Sync appointment to Google Calendar
  async syncAppointment(appointmentId: string): Promise<string> {
    try {
      const response = await apiClient.post('/google-calendar/sync/', {
        appointment_id: parseInt(appointmentId)
      })
      return response.data.event_id
    } catch (error) {
      console.error('Error syncing appointment to Google Calendar:', error)
      throw new Error('Failed to sync appointment')
    }
  }

  // Update existing Google Calendar event
  async updateAppointmentEvent(appointmentId: string): Promise<void> {
    try {
      // For now, we'll sync again which will update the event
      await this.syncAppointment(appointmentId)
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  // Delete Google Calendar event
  async deleteAppointmentEvent(appointmentId: string): Promise<void> {
    try {
      await apiClient.delete(`/google-calendar/events/${appointmentId}/delete/`)
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw new Error('Failed to delete calendar event')
    }
  }

  // Get events from Google Calendar for a date range
  async getCalendarEvents(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiClient.get('/google-calendar/events/', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      })
      return response.data.events || []
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      throw new Error('Failed to fetch calendar events')
    }
  }

  // Sync multiple appointments to Google Calendar
  async syncMultipleAppointments(appointments: Appointment[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const appointment of appointments) {
      try {
        if (appointment.id) {
          await this.syncAppointment(appointment.id.toString())
          results.success++
        } else {
          results.failed++
          results.errors.push(`Appointment ${appointment.patientName} has no ID`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to sync ${appointment.patientName}: ${error}`)
      }
    }

    return results
  }

  // Import events from Google Calendar
  async importEventsFromCalendar(startDate: Date, endDate: Date): Promise<Partial<Appointment>[]> {
    const events = await this.getCalendarEvents(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    return events.map(event => ({
      patientName: event.summary?.split(' - ')[1] || 'Unknown Patient',
      doctor: event.description?.match(/Appointment with (.+?)\n/)?.[1] || 'Unknown Doctor',
      date: new Date(event.start.dateTime || event.start.date).toISOString().split('T')[0],
      time: new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: event.summary?.split(' - ')[0] || 'Appointment',
      status: 'scheduled' as const,
      notes: event.description || ''
    }))
  }

  // Legacy compatibility methods
  isUserSignedIn(): boolean {
    return this.isConnected
  }

  getCurrentUser(): any {
    // Since we're using backend auth, we don't have direct access to Google user info
    return null
  }

  // Convert HMS appointment to Google Calendar event format (for reference)
  appointmentToGoogleEvent(appointment: Appointment): GoogleCalendarEvent {
    const startDateTime = new Date(`${appointment.date} ${appointment.time}`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

    return {
      summary: `${appointment.type} - ${appointment.patientName}`,
      description: `Appointment with ${appointment.doctor}\nPatient ID: ${appointment.patientId}\nNotes: ${appointment.notes || 'N/A'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: 'Chelal Hospital Management System',
      attendees: appointment.contact ? [{
        email: appointment.contact.email,
        displayName: appointment.patientName
      }] : undefined,
      reminders: {
        useDefault: true,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 60 }
        ]
      }
    }
  }

  // Legacy methods for compatibility
  async createEvent(appointment: Appointment): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Google Calendar not connected')
    }

    if (appointment.id) {
      return await this.syncAppointment(appointment.id.toString())
    } else {
      throw new Error('Appointment must have an ID to sync')
    }
  }

  async updateEvent(eventId: string, appointment: Appointment): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Google Calendar not connected')
    }

    if (appointment.id) {
      await this.syncAppointment(appointment.id.toString())
    } else {
      throw new Error('Appointment must have an ID to update')
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Google Calendar not connected')
    }

    if (eventId) {
      await this.deleteAppointmentEvent(eventId)
    } else {
      throw new Error('Invalid event ID')
    }
  }

  async getEvents(startDate: Date, endDate: Date): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Google Calendar not connected')
    }

    return await this.getCalendarEvents(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  }

  async syncAppointmentsToCalendar(appointments: Appointment[]): Promise<{ success: number, failed: number, errors: string[] }> {
    return await this.syncMultipleAppointments(appointments)
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService()

// React hook for using Google Calendar service
export function useGoogleCalendar() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [authWindow, setAuthWindow] = useState<Window | null>(null)

  useEffect(() => {
    const checkSignInStatus = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
        
        const connectionPromise = googleCalendarService.checkConnection()
        
        // Race between connection check and timeout
        const connected = await Promise.race([connectionPromise, timeoutPromise])
        setIsSignedIn(Boolean(connected))
      } catch (error) {
        console.log('Google Calendar connection check skipped:', error)
        setIsSignedIn(false)
        // Don't throw error to prevent app crash
      }
    }

    // Only check connection if we're in a development environment or have API access
    if (typeof window !== 'undefined' && navigator.onLine) {
      checkSignInStatus()
    }
  }, [])

  // Listen for OAuth completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our backend domain
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        window.location.origin
      ]

      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        return
      }

      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        console.log('OAuth completed successfully')
        setIsSignedIn(true)
        setIsLoading(false)
        if (authWindow && !authWindow.closed) {
          authWindow.close()
        }
        setAuthWindow(null)
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        console.error('OAuth failed:', event.data.error)
        setIsSignedIn(false)
        setIsLoading(false)
        if (authWindow && !authWindow.closed) {
          authWindow.close()
        }
        setAuthWindow(null)
      }
    }

    window.addEventListener('message', handleMessage)

    // Check if auth window was closed manually
    const checkAuthWindow = setInterval(() => {
      if (authWindow && authWindow.closed) {
        setAuthWindow(null)
        setIsLoading(false)
      }
    }, 1000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(checkAuthWindow)
    }
  }, [authWindow])

  const signIn = async () => {
    setIsLoading(true)
    try {
      const authUrl = await googleCalendarService.initiateAuth()

      // Open OAuth in a popup window
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      )

      if (!popup) {
        throw new Error('Failed to open authentication popup. Please allow popups for this site.')
      }

      setAuthWindow(popup)

      // Set a timeout in case the user closes the popup without completing auth
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          setAuthWindow(null)
          setIsLoading(false)
        }
      }, 300000) // 5 minutes timeout

    } catch (error) {
      console.error('Failed to initiate Google Calendar sign-in:', error)
      setIsLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // For backend implementation, we don't have direct sign-out
      // The user would need to revoke access from Google account settings
      setIsSignedIn(false)
      // Close any open auth window
      if (authWindow && !authWindow.closed) {
        authWindow.close()
      }
      setAuthWindow(null)
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncAppointment = async (appointment: Appointment) => {
    setIsLoading(true)
    try {
      if (appointment.id) {
        const eventId = await googleCalendarService.syncAppointment(appointment.id.toString())
        return eventId
      } else {
        throw new Error('Appointment must have an ID')
      }
    } catch (error) {
      console.error('Failed to sync appointment:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const syncMultipleAppointments = async (appointments: Appointment[]) => {
    setIsLoading(true)
    try {
      const results = await googleCalendarService.syncMultipleAppointments(appointments)
      return results
    } catch (error) {
      console.error('Failed to sync appointments:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    isSignedIn,
    signIn,
    signOut,
    syncAppointment,
    syncMultipleAppointments,
    importEvents: googleCalendarService.importEventsFromCalendar.bind(googleCalendarService)
  }
}
