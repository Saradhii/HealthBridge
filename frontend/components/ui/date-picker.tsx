"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className,
  disabled,
}: DatePickerProps) {
  // Convert Date to YYYY-MM-DD for the native date input
  const dateToString = (date?: Date) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  // Convert YYYY-MM-DD string to Date
  const stringToDate = (dateString: string) => {
    if (!dateString) return undefined
    const date = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
    return isNaN(date.getTime()) ? undefined : date
  }

  const [inputValue, setInputValue] = React.useState(dateToString(value))

  React.useEffect(() => {
    setInputValue(dateToString(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    const newDate = stringToDate(newValue)
    onChange?.(newDate)
  }

  return (
    <input
      type="date"
      value={inputValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}