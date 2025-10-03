"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  Moon,
  Sun,
  Stethoscope,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "../../lib/auth-context"
import { ROLES, hasAnyRole } from "../../lib/permissions"
import type { Role } from "../../lib/permissions"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  allowedRoles: Role[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and statistics",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
    description: "Patient management",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: Calendar,
    description: "Schedule and bookings",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]
  },
  {
    name: "Medications",
    href: "/medications",
    icon: Pill,
    description: "Pharmacy and prescriptions",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PHARMACIST]
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    description: "Financial transactions",
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST]
  },
  {
    name: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    description: "Insights and data analysis",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DEFAULTUSER]
  },
]

interface AppLayoutProps {
  children: React.ReactNode
}

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Filter navigation items based on user roles
  const filteredNavigation = navigation.filter(item =>
    hasAnyRole(user, item.allowedRoles)
  )

  // Debug logging
  console.log('Sidebar Debug:', {
    user,
    userRole: user?.role,
    userRoleName: typeof user?.role === 'string' ? user?.role : user?.role?.name,
    filteredNavigationCount: filteredNavigation.length,
    allNavigationCount: navigation.length,
    isLoading
  })

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className={cn("pb-12", className)}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="flex items-center mb-6">
              <Stethoscope className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-lg font-semibold">Chelal HMS</h2>
            </div>
            <div className="space-y-1">
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <Stethoscope className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-lg font-semibold">Chelal HMS</h2>
          </div>
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto py-2 px-3",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href} title={item.description}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notifications] = useState(3) // Mock notification count

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo on the left for all screen sizes */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">Chelal HMS</h2>
          </Link>
        </div>

        {/* Mobile menu trigger - only on mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <ScrollArea className="h-full">
              <Sidebar />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Header actions grouped on the far right */}
        <div className="flex items-center ml-auto">
          {/* Grouped action buttons with subtle background */}
          <div className="flex items-center space-x-3 bg-muted/50 rounded-lg p-2 border">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                  {notifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} alt={`${user?.first_name} ${user?.last_name}`} />
                    <AvatarFallback className="text-xs">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <Header />

      {/* Sidebar + Content wrapper */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30">
          <div className="flex flex-col flex-grow pt-16 bg-card border-r">
            <ScrollArea className="flex-1">
              <Sidebar />
            </ScrollArea>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
