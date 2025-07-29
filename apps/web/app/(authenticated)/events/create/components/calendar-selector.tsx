"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"
import { Check, ChevronDown, Plus, Info } from "lucide-react"
import { QuickCalendarCreate } from "./quick-calendar-create"

interface CalendarSelectorProps {
  selectedCalendarId: string
  onCalendarChange: (calendarId: string) => void
}

export function CalendarSelector({ selectedCalendarId, onCalendarChange }: CalendarSelectorProps) {
  const userCalendars = useQuery(api.calendars.getUserCalendars)
  const selectedCalendar = userCalendars?.find(cal => cal._id === selectedCalendarId)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCalendarCreated = (calendarId: string) => {
    onCalendarChange(calendarId)
  }

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger className="flex 
      items-center gap-2 rounded-full px-3 py-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={selectedCalendar?.profileImage} />
          <AvatarFallback />
        </Avatar>
        <span className="font-medium text-sm">
          {selectedCalendar?.name || "Select a calendar"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Choose the calendar of the event:
        </DropdownMenuLabel>
        {userCalendars && userCalendars.length > 0 && userCalendars.map((calendar) => (
          <DropdownMenuItem
            key={calendar._id}
            onClick={() => onCalendarChange(calendar._id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={calendar.profileImage} />
                <AvatarFallback />
              </Avatar>
              <span>{calendar.name}</span>
            </div>
            {selectedCalendarId === calendar._id && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
        <Avatar className="w-6 h-6 inline-flex items-center justify-center">
        <Plus />
        </Avatar>
          <span>Create Calendar</span>
        </DropdownMenuItem>
        
        {/* Info tip inside dropdown */}
        <div className="p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[140px]">
              Events created in this calendar can be managed by its admins.
            </p>
          </div>
        </div>
      </DropdownMenuContent>
      </DropdownMenu>

      <QuickCalendarCreate
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCalendarCreated={handleCalendarCreated}
      />
    </>
  )
}