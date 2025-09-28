"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Lock } from "lucide-react"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showIcon?: boolean
  showToggle?: boolean
  strengthIndicator?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    className,
    showIcon = true,
    showToggle = true,
    strengthIndicator = false,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [passwordStrength, setPasswordStrength] = React.useState(0)

    const calculatePasswordStrength = (password: string): number => {
      let strength = 0
      if (password.length >= 8) strength += 1
      if (/[a-z]/.test(password)) strength += 1
      if (/[A-Z]/.test(password)) strength += 1
      if (/[0-9]/.test(password)) strength += 1
      if (/[^A-Za-z0-9]/.test(password)) strength += 1
      return strength
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (strengthIndicator) {
        setPasswordStrength(calculatePasswordStrength(value))
      }
      props.onChange?.(e)
    }

    const getStrengthColor = (strength: number): string => {
      if (strength <= 2) return "bg-red-500"
      if (strength <= 3) return "bg-yellow-500"
      if (strength <= 4) return "bg-blue-500"
      return "bg-green-500"
    }

    const getStrengthText = (strength: number): string => {
      if (strength <= 2) return "Weak"
      if (strength <= 3) return "Fair"
      if (strength <= 4) return "Good"
      return "Strong"
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          {showIcon && (
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              showIcon && "pl-10",
              showToggle && "pr-10",
              className
            )}
            onChange={handleInputChange}
            {...props}
          />
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={props.disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>

        {strengthIndicator && props.value && (
          <div className="space-y-1">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 w-full rounded-full transition-colors",
                    level <= passwordStrength
                      ? getStrengthColor(passwordStrength)
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <p className={cn(
              "text-xs",
              passwordStrength <= 2 && "text-red-600",
              passwordStrength === 3 && "text-yellow-600",
              passwordStrength === 4 && "text-blue-600",
              passwordStrength === 5 && "text-green-600"
            )}>
              Password strength: {getStrengthText(passwordStrength)}
            </p>
          </div>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
