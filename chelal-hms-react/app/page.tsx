"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stethoscope, Users, Calendar, Pill, Shield, Activity } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">Chelal HMS</CardTitle>
          <CardDescription className="text-lg">
            Healthcare Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Redirecting to login page...
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Patient Management</h3>
              <p className="text-sm text-muted-foreground">Comprehensive patient records</p>
            </div>
            <div className="text-center p-4">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Appointment Scheduling</h3>
              <p className="text-sm text-muted-foreground">Efficient scheduling system</p>
            </div>
            <div className="text-center p-4">
              <Pill className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Medication Tracking</h3>
              <p className="text-sm text-muted-foreground">Prescription management</p>
            </div>
            <div className="text-center p-4">
              <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Medical Records</h3>
              <p className="text-sm text-muted-foreground">Digital health records</p>
            </div>
            <div className="text-center p-4">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Secure & Compliant</h3>
              <p className="text-sm text-muted-foreground">HIPAA compliant system</p>
            </div>
            <div className="text-center p-4">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Clinical Tools</h3>
              <p className="text-sm text-muted-foreground">Advanced medical tools</p>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => router.push("/login")} size="lg">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
