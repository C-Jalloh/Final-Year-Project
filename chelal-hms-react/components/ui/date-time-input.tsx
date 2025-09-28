"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Calendar, Clock } from "lucide-react"

interface DateTimeInputProps {
  dateValue?: string
  timeValue?: string
  onDateChange?: (date: string) => void
  onTimeChange?: (time: string) => void
  onDateTimeChange?: (dateTime: { date: string; time: string }) => void
  datePlaceholder?: string
  timePlaceholder?: string
  minDate?: string
  maxDate?: string
  disabled?: boolean
  className?: string
  showIcons?: boolean
}

const DateTimeInput = React.forwardRef<HTMLDivElement, DateTimeInputProps>(
  ({
    dateValue = "",
    timeValue = "",
    onDateChange,
    onTimeChange,
    onDateTimeChange,
    datePlaceholder = "Select date",
    timePlaceholder = "Select time",
    minDate,
    maxDate,
    disabled = false,
    className,
    showIcons = true,
    ...props
  }, ref) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value
      onDateChange?.(newDate)
      onDateTimeChange?.({ date: newDate, time: timeValue })
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value
      onTimeChange?.(newTime)
      onDateTimeChange?.({ date: dateValue, time: newTime })
    }

    return (
      <div ref={ref} className={cn("grid grid-cols-2 gap-2", className)} {...props}>
        <div className="relative">
          {showIcons && (
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          )}
          <Input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            placeholder={datePlaceholder}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            className={cn(showIcons && "pl-10")}
          />
        </div>

        <div className="relative">
          {showIcons && (
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          )}
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            placeholder={timePlaceholder}
            disabled={disabled}
            className={cn(showIcons && "pl-10")}
          />
        </div>
      </div>
    )
  }
)

DateTimeInput.displayName = "DateTimeInput"

export { DateTimeInput }
