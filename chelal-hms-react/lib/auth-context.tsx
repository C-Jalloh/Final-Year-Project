"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { apiHelpers } from './api-client'
import { preloadAppPages, prefetchCriticalData } from './preloader'

export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  role?: {
    id: number
    name: string
    description?: string
  } | string  // Allow both object and string for backward compatibility
  is_staff?: boolean
  avatar?: string
  language_preference?: string
  preferences?: any
  two_factor_enabled?: boolean
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
  updatePreferences: (preferencesData: any) => Promise<void>
  refreshProfile: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  isPreloading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreloading, setIsPreloading] = useState(false)
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          try {
            const response = await apiHelpers.getProfile()
            console.log('Profile fetch successful:', response.data)
            setUser(response.data)
            // Preload pages for authenticated user
            setIsPreloading(true)
            preloadAppPages(router).then(() => prefetchCriticalData()).then(() => {
              setIsPreloading(false)
            }).catch(console.error)
          } catch (profileError) {
            console.log('Profile fetch failed, clearing token and using mock user')
            console.error('Profile fetch error:', profileError)
            // Use mock user for development
            const mockUser = {
              id: 'dev-user',
              username: 'developer',
              email: 'dev@chelal.com',
              first_name: 'Dev',
              last_name: 'User',
              role: 'Admin',
              is_staff: true
            }
            setUser(mockUser)
            // Preload pages for mock user
            setIsPreloading(true)
            preloadAppPages(router).then(() => prefetchCriticalData()).then(() => {
              setIsPreloading(false)
            }).catch(console.error)
          }
        } else {
          // No token found, user is not authenticated - use mock user for development
          setUser({
            id: 'dev-user',
            username: 'developer',
            email: 'dev@chelal.com',
            first_name: 'Dev',
            last_name: 'User',
            role: 'Admin',
            is_staff: true
          })
        }
      } catch (error: any) {
        console.log('Authentication check failed:', error.response?.status)
        // Clear invalid tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        
        // Use mock user for development
        setUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@chelal.com',
          first_name: 'Dev',
          last_name: 'User',
          role: 'Admin',
          is_staff: true
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiHelpers.login({ username, password })

      const { access, refresh } = response.data

      // Store tokens
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      // Fetch user profile after successful login
      try {
        const profileResponse = await apiHelpers.getProfile()
        setUser(profileResponse.data)
      } catch (profileError) {
        console.error('Failed to fetch profile after login:', profileError)
        // Set a basic user object if profile fetch fails
        setUser({
          id: 'temp-user',
          username,
          email: '',
          role: 'Admin' // Default to admin for now
        })
      }

      // Start preloading pages and data in background
      setIsPreloading(true)
      preloadAppPages(router).then(() => {
        console.log('Pages preloaded successfully')
      }).catch(console.error)
      
      prefetchCriticalData().then(() => {
        console.log('Critical data prefetched successfully')
        setIsPreloading(false)
      }).catch(console.error)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setIsLoading(true)
      await apiHelpers.register(userData)
      // After successful registration, log them in
      await login(userData.username, userData.password)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Clear user state
    setUser(null)

    // Redirect to login
    router.push('/login')
  }

  const updateProfile = async (profileData: Partial<User> | FormData) => {
    try {
      const response = await apiHelpers.updateProfile(profileData)
      const updatedUser = response.data
      setUser(updatedUser)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      throw new Error(error.response?.data?.detail || 'Failed to update profile')
    }
  }

  const updatePreferences = async (preferencesData: any) => {
    try {
      const response = await apiHelpers.updatePreferences(preferencesData)
      // Update user state if preferences affect user object
      if (user) {
        const updatedUser = { ...user, preferences: response.data.preferences }
        setUser(updatedUser)
      }
    } catch (error: any) {
      console.error('Failed to update preferences:', error)
      throw new Error(error.response?.data?.detail || 'Failed to update preferences')
    }
  }

  const refreshProfile = async () => {
    try {
      const response = await apiHelpers.getProfile()
      setUser(response.data)
    } catch (error: any) {
      console.error('Failed to refresh profile:', error)
      throw new Error(error.response?.data?.detail || 'Failed to refresh profile')
    }
  }

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    updatePreferences,
    refreshProfile,
    isLoading,
    isAuthenticated: !!user,
    isPreloading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
