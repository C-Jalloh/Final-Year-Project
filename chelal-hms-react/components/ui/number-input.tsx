"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Hash, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: number | string
  onChange?: (value: number | string) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  showControls?: boolean
  showIcon?: boolean
  allowNegative?: boolean
  formatOptions?: Intl.NumberFormatOptions
  placeholder?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    className,
    value = "",
    onChange,
    min,
    max,
    step = 1,
    precision = 0,
    showControls = false,
    showIcon = true,
    allowNegative = true,
    formatOptions,
    placeholder = "Enter number",
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      value === "" ? "" : String(value)
    )

    React.useEffect(() => {
      setInternalValue(value === "" ? "" : String(value))
    }, [value])

    const formatNumber = (num: number): string => {
      if (formatOptions) {
        return new Intl.NumberFormat(undefined, formatOptions).format(num)
      }
      return precision > 0 ? num.toFixed(precision) : String(num)
    }

    const parseNumber = (str: string): number => {
      const cleaned = str.replace(/[^\d.-]/g, "")
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }

    const validateAndSetValue = (newValue: string) => {
      if (newValue === "") {
        setInternalValue("")
        onChange?.("")
        return
      }

      const numValue = parseNumber(newValue)

      // Apply constraints
      let constrainedValue = numValue
      if (!allowNegative && constrainedValue < 0) constrainedValue = 0
      if (min !== undefined && constrainedValue < min) constrainedValue = min
      if (max !== undefined && constrainedValue > max) constrainedValue = max

      const formatted = formatNumber(constrainedValue)
      setInternalValue(formatted)
      onChange?.(precision > 0 ? constrainedValue : Math.round(constrainedValue))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setInternalValue(inputValue)
    }

    const handleInputBlur = () => {
      validateAndSetValue(internalValue)
    }

    const handleIncrement = () => {
      const currentValue = parseNumber(internalValue)
      const newValue = currentValue + step
      validateAndSetValue(String(newValue))
    }

    const handleDecrement = () => {
      const currentValue = parseNumber(internalValue)
      const newValue = currentValue - step
      validateAndSetValue(String(newValue))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        handleIncrement()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        handleDecrement()
      }
    }

    return (
      <div className="relative">
        {showIcon && (
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            showIcon && "pl-10",
            showControls && "pr-20",
            className
          )}
          {...props}
        />
        {showControls && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-6 p-0 hover:bg-muted"
              onClick={handleIncrement}
              disabled={props.disabled || (max !== undefined && parseNumber(internalValue) >= max)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-6 p-0 hover:bg-muted"
              onClick={handleDecrement}
              disabled={props.disabled || (min !== undefined && parseNumber(internalValue) <= min) || (!allowNegative && parseNumber(internalValue) <= 0)}
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
