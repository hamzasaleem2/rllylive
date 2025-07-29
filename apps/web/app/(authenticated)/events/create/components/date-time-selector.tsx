"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useTimezoneSelect, allTimezones, type ITimezoneOption } from "react-timezone-select"

interface DateTimeSelectorProps {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string | ITimezoneOption
  onStartDateChange: (date: string) => void
  onStartTimeChange: (time: string) => void
  onEndDateChange: (date: string) => void
  onEndTimeChange: (time: string) => void
  onTimezoneChange: (timezone: ITimezoneOption) => void
}

export function DateTimeSelector({
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onTimezoneChange,
}: DateTimeSelectorProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle: "original",
    timezones: allTimezones,
  })

  // Get current timezone value
  const currentTimezone = typeof timezone === 'string' ? timezone : timezone?.value
  
  // Get user's actual timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Find the selected timezone option
  const selectedOption = options.find(option => option.value === currentTimezone) || 
    options.find(option => option.value === userTimezone) ||
    options[0]

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Tue, 29 Jul"
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const parseDate = (dateStr: string) => {
    return dateStr ? new Date(dateStr) : undefined
  }

  const handleDateSelect = (date: Date | undefined, isStart: boolean) => {
    if (date) {
      const isoString = date.toISOString().split('T')[0]
      if (isoString) {
        if (isStart) {
          onStartDateChange(isoString)
          setStartDateOpen(false)
        } else {
          onEndDateChange(isoString)
          setEndDateOpen(false)
        }
      }
    }
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "12:00 PM"
    const [hours, minutes] = timeStr.split(':')
    if (!hours || !minutes) return "12:00 PM"
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const generateTimeOptions = () => {
    const times = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) { // 30-minute intervals
        const hour24 = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        const time24 = `${hour24}:${minute}`
        const timeFormatted = formatTime(time24)
        times.push({ value: time24, label: timeFormatted })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="flex gap-3">
      {/* Timeline Section */}
      <div className="relative h-16 w-6">
        {/* Timeline */}
        <div className="absolute left-3 top-4.5 bottom-3 w-0.5 border-l border-dashed border-border"></div>
        
        {/* Start Dot */}
        <div className="absolute top-3.5 left-2 w-2 h-2 bg-muted-foreground rounded-full"></div>
        
        {/* End Dot */}
        <div className="absolute bottom-1 left-2 w-2 h-2 border border-muted-foreground rounded-full"></div>
      </div>

      {/* Date/Time Sections */}
      <div className="flex flex-col gap-3">
        {/* Start Section */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground w-12">Start</span>
          
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between font-normal w-28">
                {formatDate(startDate)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(startDate)}
                onSelect={(date) => handleDateSelect(date, true)}
              />
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between font-normal">
                {formatTime(startTime)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 max-h-64 overflow-y-auto" align="start">
              {timeOptions.map((time) => (
                <DropdownMenuItem
                  key={time.value}
                  onClick={() => onStartTimeChange(time.value)}
                  className="text-sm"
                >
                  {time.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* End Section */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground w-12">End</span>
          
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between font-normal w-28">
                {formatDate(endDate)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(endDate)}
                onSelect={(date) => handleDateSelect(date, false)}
              />
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between font-normal">
                {formatTime(endTime)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 max-h-64 overflow-y-auto" align="start">
              {timeOptions.map((time) => (
                <DropdownMenuItem
                  key={time.value}
                  onClick={() => onEndTimeChange(time.value)}
                  className="text-sm"
                >
                  {time.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timezone Selector - Next Column */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-col h-16 px-3">
              <span className="text-xs font-mono">{selectedOption?.label?.split(' ')[0] || ''}</span>
              <span className="text-xs">{selectedOption?.value?.split('/')[1]?.replace(/_/g, ' ') || ''}</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onTimezoneChange(parseTimezone(option.value))}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.value.split('/')[1]?.replace(/_/g, ' ')}
                  </div>
                </div>
                {currentTimezone === option.value && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}