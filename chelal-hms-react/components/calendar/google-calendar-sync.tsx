"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  LogIn,
  LogOut
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGoogleCalendar } from "@/lib/services/google-calendar-new"
import { Appointment } from "@/components/calendar"
import { useToast } from "@/hooks/use-toast"

interface GoogleCalendarSyncProps {
  appointments: Appointment[]
  onSyncComplete?: (results: { success: number, failed: number, errors: string[] }) => void
  className?: string
}

export function GoogleCalendarSync({
  appointments,
  onSyncComplete,
  className
}: GoogleCalendarSyncProps) {
  const { toast } = useToast()
  const {
    isLoading,
    isSignedIn,
    signIn,
    signOut,
    syncMultipleAppointments
  } = useGoogleCalendar()

  const [syncResults, setSyncResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Listen for OAuth completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        toast({
          title: "Google Calendar Connected",
          description: "Your Google Calendar has been successfully connected. You can now sync your appointments.",
          variant: "default",
        })
        // Refresh the connection status
        setTimeout(() => {
          window.location.reload()
        }, 1000)
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

  const handleSync = async () => {
    try {
      const results = await syncMultipleAppointments(appointments)
      setSyncResults(results)
      onSyncComplete?.(results)

      if (results.success > 0) {
        toast({
          title: "Sync Completed",
          description: `${results.success} appointment(s) synced successfully${results.failed > 0 ? `, ${results.failed} failed` : ''}.`,
          variant: results.failed > 0 ? "default" : "default",
        })
      } else if (results.failed > 0) {
        toast({
          title: "Sync Failed",
          description: `Failed to sync ${results.failed} appointment(s). Check the details for more information.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncResults({
        success: 0,
        failed: appointments.length,
        errors: ['Failed to sync appointments. Please try again.']
      })
      toast({
        title: "Sync Failed",
        description: "Failed to sync appointments. Please check your connection and try again.",
        variant: "destructive",
      })
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

      // Check if it's an authentication error
      if (error.message?.includes('popup') || error.message?.includes('allow popups')) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        })
      } else if (error.response?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Google Calendar.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to Google Calendar. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Disconnected",
        description: "Google Calendar has been disconnected.",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Sign out failed:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Calendar.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Google Calendar Sync
        </CardTitle>
        <CardDescription>
          Sync your appointments with Google Calendar for better organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isSignedIn ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Not Connected</span>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={isSignedIn ? handleSignOut : handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : isSignedIn ? (
              <LogOut className="mr-2 h-4 w-4" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {isSignedIn ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {/* Sync Actions */}
        {isSignedIn && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {appointments.length} appointments ready to sync
              </span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Sync All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sync Appointments to Google Calendar</DialogTitle>
                    <DialogDescription>
                      This will create calendar events for all {appointments.length} appointments.
                      Existing events with the same title will be updated.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {!syncResults ? (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSync} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            'Start Sync'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {syncResults.success} Success
                          </Badge>
                          {syncResults.failed > 0 && (
                            <Badge variant="destructive">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {syncResults.failed} Failed
                            </Badge>
                          )}
                        </div>

                        {syncResults.errors.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-red-600">Errors:</h4>
                            <ul className="text-sm text-red-600 space-y-1">
                              {syncResults.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              setSyncResults(null)
                              setIsDialogOpen(false)
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sync Settings */}
            <div className="pt-3 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Sync Settings
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isSignedIn && (
          <div className="text-sm text-muted-foreground">
            Connect your Google account to sync appointments automatically and receive calendar notifications.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
