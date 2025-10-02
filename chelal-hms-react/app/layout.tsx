import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chelal HMS - Hospital Management System",
  description: "Comprehensive hospital management system for modern healthcare facilities",
    generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
