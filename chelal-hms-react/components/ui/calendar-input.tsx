"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CalendarInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showTime?: boolean
  timeValue?: string
  onTimeChange?: (time: string) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  highlightedDates?: Date[]
  appointmentDates?: Date[]
  showAppointmentIndicators?: boolean
  dateFormat?: string
  timeFormat?: string
}

const CalendarInput = React.forwardRef<HTMLButtonElement, CalendarInputProps>(
  ({
    value,
    onChange,
    placeholder = "Pick a date",
    disabled = false,
    className,
    showTime = false,
    timeValue = "",
    onTimeChange,
    minDate,
    maxDate,
    disabledDates = [],
    highlightedDates = [],
    appointmentDates = [],
    showAppointmentIndicators = true,
    dateFormat = "PPP",
    timeFormat = "HH:mm",
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [internalTime, setInternalTime] = React.useState(timeValue)

    React.useEffect(() => {
      setInternalTime(timeValue)
    }, [timeValue])

    const handleDateSelect = (date: Date | undefined) => {
      onChange?.(date)
      if (!showTime) {
        setIsOpen(false)
      }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value
      setInternalTime(newTime)
      onTimeChange?.(newTime)
    }

    const formatDateTime = (date: Date | undefined, time: string) => {
      if (!date) return ""
      if (!showTime || !time) return format(date, dateFormat)
      return `${format(date, dateFormat)} at ${time}`
    }

    const isDateDisabled = (date: Date) => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return disabledDates.some(disabledDate =>
        date.toDateString() === disabledDate.toDateString()
      )
    }

    const isDateHighlighted = (date: Date) => {
      return highlightedDates.some(highlightedDate =>
        date.toDateString() === highlightedDate.toDateString()
      )
    }

    const hasAppointment = (date: Date) => {
      return appointmentDates.some(appointmentDate =>
        date.toDateString() === appointmentDate.toDateString()
      )
    }

    const modifiers = React.useMemo(() => ({
      disabled: isDateDisabled,
      highlighted: isDateHighlighted,
      appointment: hasAppointment,
    }), [disabledDates, highlightedDates, appointmentDates, minDate, maxDate])

    const modifiersStyles = React.useMemo(() => ({
      highlighted: {
        backgroundColor: "hsl(var(--primary) / 0.1)",
        color: "hsl(var(--primary))",
        fontWeight: "bold"
      },
      appointment: {
        position: "relative" as const,
        backgroundColor: "hsl(var(--accent) / 0.5)",
      }
    }), [])

    // Custom day component for appointment indicators
    const CustomDay = ({ date, ...props }: any) => {
      const hasAppointmentOnDate = hasAppointment(date)
      const isHighlighted = isDateHighlighted(date)

      return (
        <div className="relative">
          <button
            {...props}
            className={cn(
              props.className,
              isHighlighted && "bg-primary/10 text-primary font-bold",
              hasAppointmentOnDate && "bg-accent/50"
            )}
          />
          {hasAppointmentOnDate && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-destructive rounded-full"></div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
              disabled={disabled}
              {...props}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? formatDateTime(value, internalTime) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                components={{
                  Day: CustomDay
                }}
                initialFocus
              />

              {showTime && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={internalTime}
                      onChange={handleTimeChange}
                      className="flex-1"
                      placeholder="Select time"
                    />
                  </div>
                </div>
              )}

              {showAppointmentIndicators && appointmentDates.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>Appointment scheduled</span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange?.(undefined)
                    setInternalTime("")
                    onTimeChange?.("")
                    setIsOpen(false)
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={!value}
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Appointment indicators legend */}
        {showAppointmentIndicators && appointmentDates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-destructive rounded-full mr-1"></div>
              Appointments
            </Badge>
            {highlightedDates.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-primary/20 rounded-full mr-1"></div>
                Special Dates
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }
)

CalendarInput.displayName = "CalendarInput"

export { CalendarInput }
