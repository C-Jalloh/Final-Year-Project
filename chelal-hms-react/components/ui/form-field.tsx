"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormFieldProps {
  label?: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  className?: string
  children: React.ReactNode
  id?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, error, success, required, className, children, id, ...props }, ref) => {
    const fieldId = id || React.useId()

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          {React.isValidElement(children) ? (
            React.cloneElement(children, {
              className: cn(
                (children.props as any).className,
                error && "border-red-500 focus-visible:ring-red-500",
                success && "border-green-500 focus-visible:ring-green-500"
              )
            } as any)
          ) : (
            children
          )}
        </div>

        {description && !error && !success && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && (
          <div className="flex items-center space-x-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export { FormField }
