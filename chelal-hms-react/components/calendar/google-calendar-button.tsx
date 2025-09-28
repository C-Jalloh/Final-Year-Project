"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, RefreshCw } from "lucide-react"
import { useGoogleCalendar } from "@/lib/services/google-calendar-new"
import { useToast } from "@/hooks/use-toast"

interface GoogleCalendarButtonProps {
  appointments: any[]
  className?: string
}

export function GoogleCalendarButton({
  appointments,
  className
}: GoogleCalendarButtonProps) {
  const { toast } = useToast()
  const {
    isLoading,
    isSignedIn,
    signIn,
    syncMultipleAppointments
  } = useGoogleCalendar()

  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Auto-sync when calendar is connected and we have appointments (disabled for now)
  useEffect(() => {
    // Disable auto-sync to prevent network issues on page load
    // if (isSignedIn && appointments.length > 0 && !lastSyncTime) {
    //   handleAutoSync()
    // }
  }, [isSignedIn, appointments.length, lastSyncTime])

  // Listen for OAuth completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        toast({
          title: "Google Calendar Connected",
          description: "Your Google Calendar has been successfully connected.",
          variant: "default",
        })
        // Auto-sync after connection (disabled for now)
        // setTimeout(() => {
        //   handleAutoSync()
        // }, 1000)
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        toast({
          title: "Connection Failed",
          description: `Failed to connect to Google Calendar: ${event.data.error}`,
          variant: "destructive",
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast])

  const handleAutoSync = async () => {
    if (!isSignedIn || appointments.length === 0) return

    try {
      setIsSyncing(true)
      const results = await syncMultipleAppointments(appointments)
      setLastSyncTime(new Date())

      if (results.success > 0) {
        toast({
          title: "Auto-Sync Completed",
          description: `${results.success} appointment(s) synced to Google Calendar.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Auto-sync failed:', error)
      toast({
        title: "Auto-Sync Failed",
        description: "Failed to sync appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signIn()
      toast({
        title: "Connecting to Google Calendar",
        description: "Please complete the authorization in the popup window.",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Sign in failed:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Google Calendar.",
        variant: "destructive",
      })
    }
  }

  const handleManualSync = async () => {
    if (!isSignedIn) {
      await handleSignIn()
      return
    }

    try {
      setIsSyncing(true)
      const results = await syncMultipleAppointments(appointments)
      setLastSyncTime(new Date())

      if (results.success > 0) {
        toast({
          title: "Sync Completed",
          description: `${results.success} appointment(s) synced successfully.`,
          variant: "default",
        })
      } else if (results.failed > 0) {
        toast({
          title: "Sync Failed",
          description: `Failed to sync ${results.failed} appointment(s).`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Manual sync failed:', error)
      toast({
        title: "Sync Failed",
        description: "Failed to sync appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isSignedIn) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignIn}
        disabled={isLoading}
        className={className}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Add Calendar
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleManualSync}
      disabled={isSyncing || isLoading}
      className={`${className} ${lastSyncTime ? 'border-green-200 bg-green-50 hover:bg-green-100' : ''}`}
    >
      {isSyncing ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : lastSyncTime ? (
        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {lastSyncTime ? 'Synced' : 'Sync'}
    </Button>
  )
}
