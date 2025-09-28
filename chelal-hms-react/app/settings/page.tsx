"use client"

import React, { useState, useEffect, useCallback, Suspense, lazy, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppLayout } from '@/components/layout/app-layout'
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Key,
  Save,
  RefreshCw,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  Globe,
  Clock,
  Users,
  Building,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Send
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'
import { apiHelpers } from '@/lib/api-client'
import apiClient from '@/lib/api-client'
import { AdminOnly } from '@/components/auth/ConditionalRender'
import { SettingsSkeleton } from '@/components/ui/skeleton-loader'
import { toast } from 'sonner'

// Loading component for lazy-loaded modal
const CropModalLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-2">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-sm text-muted-foreground">Loading crop tool...</p>
    </div>
  </div>
)

// Lazy load the crop modal to reduce initial bundle size
const ImageCropModal = lazy(() => import('@/components/ui/image-crop-modal').then(module => ({ default: module.ImageCropModal })))

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  department: string
  phone: string
  avatar?: string
  joinDate: string
  lastLogin: string
}

// Extend the User type to include preferences and language_preference
interface User {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  avatar?: string
  preferences?: any
  language_preference?: string
}

interface SystemSettings {
  hospitalName: string
  address: string
  phone: string
  email: string
  timezone: string
  currency: string
  language: string
  dateFormat: string
  timeFormat: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  medicationAlerts: boolean
  systemUpdates: boolean
  emergencyAlerts: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAttempts: number
  ipWhitelist: string[]
}

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { user, updateProfile, updatePreferences } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showCropModal, setShowCropModal] = useState(false)

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoize user profile to prevent unnecessary re-renders
  const memoizedUserProfile = useMemo(() => ({
    id: user?.id || '1',
    name: `${user?.first_name || 'Dev'} ${user?.last_name || 'User'}`,
    email: user?.email || 'dev@chelal.com',
    role: typeof user?.role === 'object' ? user?.role?.name || 'Chief Medical Officer' : user?.role || 'Chief Medical Officer',
    department: 'Administration',
    phone: '+1 (555) 123-4567',
    avatar: user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}` : undefined,
    joinDate: '2023-01-15',
    lastLogin: '2025-09-20T10:30:00Z'
  }), [user])

  // Mock data - in real app, this would come from API
  const [userProfile, setUserProfile] = useState<UserProfile>(memoizedUserProfile)

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    hospitalName: 'Chelal General Hospital',
    address: '123 Medical Center Drive, Healthcare City, HC 12345',
    phone: '+1 (555) 987-6543',
    email: 'info@chelalhospital.com',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    medicationAlerts: true,
    systemUpdates: true,
    emergencyAlerts: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: []
  })

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // User preferences state
  const [userPreferences, setUserPreferences] = useState({
    language_preference: user?.language_preference || 'en',
    preferences: user?.preferences || {}
  })

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await apiHelpers.getPreferences()
        setUserPreferences({
          language_preference: response.data.language_preference || userPreferences.language_preference,
          preferences: response.data.preferences || userPreferences.preferences
        })
      } catch (error) {
        console.error('Failed to load preferences:', error)
        // Use localStorage or default values if API fails
        const savedPrefs = localStorage.getItem('userPreferences')
        if (savedPrefs) {
          try {
            const parsed = JSON.parse(savedPrefs)
            setUserPreferences({
              language_preference: parsed.language_preference || userPreferences.language_preference,
              preferences: parsed.preferences || userPreferences.preferences
            })
          } catch (parseError) {
            console.error('Failed to parse saved preferences:', parseError)
          }
        }
      }
    }

    if (user) {
      loadPreferences()
    }
  }, [user])

  // Update theme when userPreferences change
  useEffect(() => {
    if (userPreferences.preferences?.theme) {
      setTheme(userPreferences.preferences.theme)
    }
  }, [userPreferences.preferences?.theme, setTheme])

  // Update notification settings from preferences
  useEffect(() => {
    if (userPreferences.preferences?.notifications) {
      setNotificationSettings(userPreferences.preferences.notifications)
    }
  }, [userPreferences.preferences?.notifications])

  // Update security settings from preferences
  useEffect(() => {
    if (userPreferences.preferences?.security) {
      setSecuritySettings(userPreferences.preferences.security)
    }
  }, [userPreferences.preferences?.security])

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1000) // Show skeleton for 1 second

    return () => clearTimeout(timer)
  }, [])

  const handleSave = async (section: string) => {
    setIsLoading(true)
    setSaveStatus('saving')

    try {
      if (section === 'profile') {
        // Save profile information
        await updateProfile({
          first_name: userProfile.name.split(' ')[0],
          last_name: userProfile.name.split(' ').slice(1).join(' '),
          email: userProfile.email
        })
      } else if (section === 'preferences') {
        // Save user preferences
        await updatePreferences({
          language_preference: userPreferences.language_preference,
          preferences: {
            ...userPreferences.preferences,
            theme: theme
          }
        })
      } else if (section === 'notifications') {
        // Save notification preferences
        await updatePreferences({
          preferences: {
            ...userPreferences.preferences,
            notifications: notificationSettings
          }
        })
      } else if (section === 'security') {
        // Save security preferences
        await updatePreferences({
          preferences: {
            ...userPreferences.preferences,
            security: securitySettings
          }
        })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error: any) {
      console.error('Save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  // File handling functions
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB for cropping)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUploadAvatar = async () => {
    if (!croppedImage || !user) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Convert data URL to blob
      const response = await fetch(croppedImage)
      const blob = await response.blob()

      // Create FormData for file upload - only send the image file
      const formData = new FormData()
      const imageFile = new File([blob], 'profile_image.jpg', { type: 'image/jpeg' })
      formData.append('profile_image', imageFile)

      // Debug: log FormData contents
      console.log('FormData contents:')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      // Update progress
      setUploadProgress(50)

      // Upload to backend using profile endpoint
      await updateProfile(formData as any)

      // Refresh user profile to get updated data
      await updateProfile({})

      setUploadProgress(100)
      setTimeout(() => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setCroppedImage(null)
        setIsUploading(false)
        setUploadProgress(0)
        toast.success('Profile picture updated successfully!')
      }, 500)

    } catch (error: any) {
      setIsUploading(false)
      setUploadProgress(0)
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload profile picture')
    }
  }

  const handleCancelUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setCroppedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl)
    setShowCropModal(false)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setUserPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: newTheme
      }
    }))
  }

  const handleExportData = () => {
    // Simulate data export
    toast.info('Data export functionality would be implemented here')
  }

  const handleImportData = () => {
    // Simulate data import
    toast.info('Data import functionality would be implemented here')
  }

  return (
    <AppLayout>
      {isPageLoading ? (
        <SettingsSkeleton />
      ) : (
        <AdminOnly
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access system settings.</p>
                <p className="text-sm text-gray-400 mt-2">This area is restricted to administrators only.</p>
              </div>
            </div>
          }
        >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-400">Settings</h1>
              <p className="text-gray-600">Manage your account and system preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={handleImportData}>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>

        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            saveStatus === 'saving' ? 'bg-blue-50 text-blue-700' :
            saveStatus === 'saved' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
            {saveStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {saveStatus === 'saving' && 'Saving changes...'}
              {saveStatus === 'saved' && 'Changes saved successfully!'}
              {saveStatus === 'error' && 'Failed to save changes'}
            </span>
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Roles</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={userProfile.department} onValueChange={(value) => setUserProfile({...userProfile, department: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Administration">Administration</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={() => handleSave('profile')} disabled={isLoading}>
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Change Password
                    </CardTitle>
                    <CardDescription>Update your account password for security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange} disabled={isLoading}>
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload a new profile picture (max 5MB, JPG/PNG)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={croppedImage || userProfile.avatar} alt={userProfile.name} />
                        <AvatarFallback className="text-lg">
                          {userProfile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {!selectedFile ? (
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 w-full">
                          <div className="text-sm text-center text-muted-foreground">
                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>

                          {croppedImage && (
                            <div className="text-sm text-center text-green-600 font-medium">
                              ✓ Image cropped and ready to upload
                            </div>
                          )}

                          {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={handleUploadAvatar}
                              disabled={isUploading || !croppedImage}
                              className="flex-1"
                            >
                              {isUploading ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelUpload}
                              disabled={isUploading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge variant="secondary">{userProfile.role}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{userProfile.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">{new Date(userProfile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Login</span>
                      <span className="text-sm font-medium">{new Date(userProfile.lastLogin).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Role Management */}
          <TabsContent value="roles" className="space-y-6">
            <RoleManagementTab />
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Hospital Information
                  </CardTitle>
                  <CardDescription>Configure hospital details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-name">Hospital Name</Label>
                    <Input
                      id="hospital-name"
                      value={systemSettings.hospitalName}
                      onChange={(e) => setSystemSettings({...systemSettings, hospitalName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital-address">Address</Label>
                    <Input
                      id="hospital-address"
                      value={systemSettings.address}
                      onChange={(e) => setSystemSettings({...systemSettings, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hospital-phone">Phone</Label>
                      <Input
                        id="hospital-phone"
                        value={systemSettings.phone}
                        onChange={(e) => setSystemSettings({...systemSettings, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital-email">Email</Label>
                      <Input
                        id="hospital-email"
                        type="email"
                        value={systemSettings.email}
                        onChange={(e) => setSystemSettings({...systemSettings, email: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Localization
                  </CardTitle>
                  <CardDescription>Set timezone, language, and regional preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings({...systemSettings, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings({...systemSettings, timeFormat: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleSave('system')} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save System Settings
              </Button>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alert Types</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Medication Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts for medication schedules</p>
                    </div>
                    <Switch
                      checked={notificationSettings.medicationAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, medicationAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about system updates and maintenance</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Emergency Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive critical emergency notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emergencyAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emergencyAlerts: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('notifications')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Authentication
                  </CardTitle>
                  <CardDescription>Configure authentication and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Select value={securitySettings.sessionTimeout.toString()} onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Select value={securitySettings.passwordExpiry.toString()} onValueChange={(value) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-attempts">Max Login Attempts</Label>
                    <Select value={securitySettings.loginAttempts.toString()} onValueChange={(value) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Access Control
                  </CardTitle>
                  <CardDescription>Manage IP whitelisting and access restrictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                    <div className="space-y-2">
                      {securitySettings.ipWhitelist.map((ip, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input value={ip} readOnly className="flex-1" />
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        Add IP Address
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Two-Factor Auth</span>
                        <Badge variant={securitySettings.twoFactorAuth ? "default" : "secondary"}>
                          {securitySettings.twoFactorAuth ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Security</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Password Strength</span>
                        <Badge variant="default">Strong</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleSave('security')} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Security Settings
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Theme & Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h5 className="font-medium mb-2">Light Theme</h5>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gray-900 text-white">
                        <h5 className="font-medium mb-2">Dark Theme</h5>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-500 rounded w-1/2"></div>
                        </div>
                      </Card>
                      <Card className="p-4 border-2 border-dashed border-gray-300">
                        <h5 className="font-medium mb-2">System Theme</h5>
                        <p className="text-sm text-muted-foreground">Automatically matches your system preference</p>
                      </Card>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('appearance')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Appearance Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Cropping Modal */}
      <Suspense fallback={<CropModalLoading />}>
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={previewUrl}
          onCropComplete={handleCropComplete}
        />
      </Suspense>
      </AdminOnly>
      )}
    </AppLayout>
  )
}

// Role Management Tab Component
const RoleManagementTab: React.FC = () => {
  const { user } = useAuth()
  const [roleRequests, setRoleRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Available roles for requests (excluding Admin and defaultuser)
  const availableRoles = [
    { value: 'Doctor', label: 'Doctor - Medical practitioner' },
    { value: 'Nurse', label: 'Nurse - Nursing staff providing patient care' },
    { value: 'Pharmacist', label: 'Pharmacist - Pharmacy staff managing medications' },
    { value: 'Receptionist', label: 'Receptionist - Front desk staff managing appointments' },
    { value: 'Patient', label: 'Patient - Access to personal health records' }
  ]

  useEffect(() => {
    loadRoleRequests()
  }, [])

  const loadRoleRequests = async () => {
    try {
      const response = await apiHelpers.getRoleChangeRequests()
      setRoleRequests(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to load role requests:', error)
    }
  }

  const handleRoleRequest = async () => {
    if (!selectedRole || !requestReason.trim()) {
      toast.error('Please select a role and provide a reason')
      return
    }

    setIsLoading(true)
    try {
      // Find the role ID
      const rolesResponse = await apiClient.get('/roles/')
      const role = rolesResponse.data.find((r: any) => r.name === selectedRole)

      if (!role) {
        toast.error('Selected role not found')
        return
      }

      await apiHelpers.createRoleChangeRequest({
        requested_role_id: role.id,
        reason: requestReason
      })

      toast.success('Role change request submitted successfully!')
      setSelectedRole('')
      setRequestReason('')
      setShowRequestForm(false)
      loadRoleRequests()
    } catch (error: any) {
      console.error('Failed to submit role request:', error)
      toast.error(error.response?.data?.detail || 'Failed to submit request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this role change request?')) return

    try {
      await apiHelpers.approveRoleChangeRequest(requestId, {
        admin_response: 'Approved'
      })
      toast.success('Request approved successfully!')
      loadRoleRequests()
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await apiHelpers.rejectRoleChangeRequest(requestId, {
        admin_response: reason
      })
      toast.success('Request rejected successfully!')
      loadRoleRequests()
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast.error('Failed to reject request')
    }
  }

  const isDefaultUser = user?.role === 'defaultuser'
  const isAdmin = user?.role === 'Admin'

  return (
    <div className="space-y-6">
      {/* Current Role Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Current Role
          </CardTitle>
          <CardDescription>Your current role and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {typeof user?.role === 'object' ? user?.role?.name || 'No Role' : user?.role || 'No Role'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {(typeof user?.role === 'string' ? user?.role : user?.role?.name) === 'defaultuser' && 'You can request to change your role to access more features.'}
                {(typeof user?.role === 'string' ? user?.role : user?.role?.name) === 'Admin' && 'You have full administrative access to manage users and roles.'}
                {(typeof user?.role === 'string' ? user?.role : user?.role?.name) === 'Doctor' && 'You can manage patient records and appointments.'}
                {(typeof user?.role === 'string' ? user?.role : user?.role?.name) === 'Receptionist' && 'You can manage appointments and patient check-ins.'}
                {user?.role === 'Patient' && 'You can view your medical records and appointments.'}
              </p>
            </div>
            {isDefaultUser && (
              <Button onClick={() => setShowRequestForm(!showRequestForm)}>
                <Send className="w-4 h-4 mr-2" />
                Request Role Change
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Request Form */}
      {showRequestForm && isDefaultUser && (
        <Card>
          <CardHeader>
            <CardTitle>Request Role Change</CardTitle>
            <CardDescription>Submit a request to change your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requested-role">Requested Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-reason">Reason for Request</Label>
              <textarea
                id="request-reason"
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md"
                placeholder="Please explain why you need this role..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRoleRequest} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Change Requests Management (Admin Only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Role Change Requests</CardTitle>
            <CardDescription>Review and manage role change requests</CardDescription>
          </CardHeader>
          <CardContent>
            {roleRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No role change requests</p>
            ) : (
              <div className="space-y-4">
                {roleRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{request.user.username}</span>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Requested: <span className="font-medium">{request.requested_role.name}</span>
                        </p>
                        <p className="text-sm mb-2">{request.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.admin_response && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Admin Response:</strong> {request.admin_response}
                          </div>
                        )}
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Role Change Requests (Default Users) */}
      {isDefaultUser && roleRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Role Change Requests</CardTitle>
            <CardDescription>Track the status of your role change requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleRequests
                .filter((request) => request.user.id === user?.id)
                .map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">Request for {request.requested_role.name}</span>
                          <Badge
                            variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.admin_response && (
                          <p className="text-sm mt-2">
                            <strong>Response:</strong> {request.admin_response}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default SettingsPage

