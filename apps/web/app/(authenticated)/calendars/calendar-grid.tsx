"use client"

import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent } from "@workspace/ui/components/card"
import { OptimizedAvatar } from "@/components/optimized-avatar"

type CalendarWithSubscriberCount = {
  _id: string
  name: string
  description?: string
  color: string
  publicUrl?: string
  location?: string
  isGlobal?: boolean
  ownerId: string
  coverImage?: string
  subscriberCount: number
}

function CalendarCard({ calendar }: { calendar: CalendarWithSubscriberCount }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border/80 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4 flex flex-col items-center text-center h-32">
        <div className="mb-3">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: calendar.color }}
          >
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white/80 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Calendar Name - Fixed at bottom */}
        <div className="flex-1 flex flex-col justify-end w-full min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm mb-1 truncate">
            {calendar.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {calendar.subscriberCount === 0 ? "No Subscribers" : `${calendar.subscriberCount} Subscribers`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarGrid() {
  const calendars = useQuery(api.calendars.getUserCalendars)

  if (calendars === undefined) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4">My Calendars</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">My Calendars</h2>
        {calendars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No calendars found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {calendars.map((calendar) => (
              <CalendarCard key={calendar._id} calendar={calendar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}