"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { OptimizedAvatar } from "@/components/optimized-avatar"

// Mock data for now - we'll replace this with real data later
const mockCalendars = [
  {
    id: "1",
    name: "Hmza",
    avatar: "/api/placeholder/80/80", // This will be replaced with real user image
    subscribers: 0,
    isUserCalendar: true,
  },
  {
    id: "2", 
    name: "hmza's calendar",
    avatar: null,
    subscribers: 0,
    isUserCalendar: false,
    color: "bg-green-500", // Calendar-specific color
  }
]

function CalendarCard({ calendar }: { calendar: typeof mockCalendars[0] }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border/80 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4 flex flex-col items-center text-center h-32">
        <div className="mb-3">
          {calendar.isUserCalendar ? (
            <OptimizedAvatar
              src={calendar.avatar}
              alt={calendar.name}
              fallback={
                <span className="bg-gradient-to-br from-live-green/20 to-primary/20 text-base font-medium w-full h-full flex items-center justify-center">
                  {calendar.name.charAt(0).toUpperCase()}
                </span>
              }
              className="w-14 h-14"
              size={56}
            />
          ) : (
            <div className={`w-14 h-14 rounded-full ${calendar.color || 'bg-green-500'} flex items-center justify-center`}>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white/80 rounded-full"></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Calendar Name - Fixed at bottom */}
        <div className="flex-1 flex flex-col justify-end w-full min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm mb-1 truncate">
            {calendar.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {calendar.subscribers === 0 ? "No Subscribers" : `${calendar.subscribers} Subscribers`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarGrid() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">My Calendars</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockCalendars.map((calendar) => (
            <CalendarCard key={calendar.id} calendar={calendar} />
          ))}
        </div>
      </div>
    </div>
  )
}