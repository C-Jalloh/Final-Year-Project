"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Phone } from "lucide-react"

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  countryCode?: string
  placeholder?: string
  showIcon?: boolean
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({
    className,
    value = "",
    onChange,
    onValidationChange,
    countryCode = "+1",
    placeholder = "(555) 123-4567",
    showIcon = true,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [isValid, setIsValid] = React.useState(true)

    // Phone number formatting patterns
    const formatPhoneNumber = (phone: string): string => {
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, "")

      // Remove country code if present
      const withoutCountryCode = cleaned.startsWith(countryCode.replace(/\D/g, ""))
        ? cleaned.slice(countryCode.replace(/\D/g, "").length)
        : cleaned

      // Format as (XXX) XXX-XXXX
      if (withoutCountryCode.length >= 10) {
        return `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6, 10)}`
      } else if (withoutCountryCode.length >= 6) {
        return `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`
      } else if (withoutCountryCode.length >= 3) {
        return `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3)}`
      } else if (withoutCountryCode.length > 0) {
        return `(${withoutCountryCode}`
      }

      return withoutCountryCode
    }

    const validatePhoneNumber = (phone: string): boolean => {
      // Remove formatting and check if it's a valid 10-digit number
      const cleaned = phone.replace(/\D/g, "")
      return cleaned.length === 10
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhoneNumber(inputValue)

      setInternalValue(formatted)

      // Validate the phone number
      const valid = validatePhoneNumber(formatted)
      setIsValid(valid)
      onValidationChange?.(valid)

      // Call the onChange prop with the formatted value
      onChange?.(formatted)
    }

    React.useEffect(() => {
      setInternalValue(value)
      const valid = validatePhoneNumber(value)
      setIsValid(valid)
      onValidationChange?.(valid)
    }, [value, onValidationChange])

    return (
      <div className="relative">
        {showIcon && (
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={ref}
          type="tel"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            showIcon && "pl-10",
            !isValid && internalValue && "border-red-500 focus-visible:ring-red-500",
            isValid && internalValue && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
