'use client';

import React, { useState } from 'react';

interface FormData {
  usernameOrEmail: string;
  password: string;
}

interface FormErrors {
  usernameOrEmail?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username/Email validation
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    } else if (formData.usernameOrEmail.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.usernameOrEmail)) {
        newErrors.usernameOrEmail = 'Please enter a valid email address';
      }
    } else if (formData.usernameOrEmail.length < 3) {
      newErrors.usernameOrEmail = 'Username must be at least 3 characters long';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call to authenticate
      console.log('Login attempt:', formData);
      
      // For demo purposes, show success message
      alert('Login successful! (This is a demo)');
    } catch (error) {
      setErrors({
        general: 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Here you would typically navigate to forgot password page
    alert('Forgot password functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hospital Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2M12 6h4.5a2.5 2.5 0 010 5H12M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Brikama General Hospital
          </h1>
          <p className="text-gray-600">
            Staff & Patient Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Sign In to Your Account
          </h2>

          {errors.general && (
            <div 
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username/Email Field */}
            <div className="mb-4">
              <label 
                htmlFor="usernameOrEmail" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username or Email Address
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.usernameOrEmail 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your username or email"
                aria-describedby={errors.usernameOrEmail ? 'username-error' : undefined}
                aria-invalid={errors.usernameOrEmail ? 'true' : 'false'}
                autoComplete="username"
                required
              />
              {errors.usernameOrEmail && (
                <p 
                  id="username-error" 
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.usernameOrEmail}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter your password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p 
                  id="password-error" 
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline transition-colors"
              >
                Forgot my password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
              aria-describedby="login-button-description"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
            <p id="login-button-description" className="sr-only">
              Click to sign in to your Brikama General Hospital account
            </p>
          </form>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help accessing your account?{' '}
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                onClick={() => alert('Contact support functionality would be implemented here')}
              >
                Contact IT Support
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Brikama General Hospital. All rights reserved.</p>
          <p className="mt-1">
            For technical support, call: +220-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  );
}
