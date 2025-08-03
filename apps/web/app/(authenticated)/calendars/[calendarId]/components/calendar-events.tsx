"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface CalendarEventsProps {
  calendarId: string
}

// Import the EventCard from the main events page
import { EventCard } from "../../../events/components/event-card"
import { EventCardSkeleton } from "../../../events/components/event-card-skeleton"

export function CalendarEvents({ calendarId }: CalendarEventsProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  
  const events = useQuery(api.calendars.getCalendarEvents, { calendarId: calendarId as any })

  const renderSkeletonTimeline = () => {
    return (
      <div className="relative">
        {/* Timeline line connecting all dots */}
        <div className="absolute left-3 md:left-[163.5px] top-2 bottom-0 w-0.5 border-l border-dashed border-border"></div>
        
        <div className="space-y-10">
          {[...Array(5)].map((_, groupIndex) => (
            <div key={groupIndex} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 pl-12 md:pl-0">
              {/* Date section */}
              <div className="md:w-32 flex-shrink-0">
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Timeline dot */}
              <div className="absolute left-[9px] md:relative md:left-auto flex items-center justify-center w-2 h-2 bg-border rounded-full ring-4 ring-background flex-shrink-0 mt-2 z-10"></div>
              
              {/* Card section */}
              <div className="flex-1 space-y-4">
                <EventCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (events === undefined) {
    return (
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-end mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="past">
                <Skeleton className="h-4 w-12" />
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="upcoming">
            {renderSkeletonTimeline()}
          </TabsContent>
          
          <TabsContent value="past">
            {renderSkeletonTimeline()}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const now = Date.now()
  const upcomingEvents = events?.filter(event => event.startTime > now) || []
  const pastEvents = events?.filter(event => event.endTime < now) || []
  const liveEvents = events?.filter(event => event.startTime <= now && event.endTime >= now) || []

  // Combine live and upcoming for the upcoming tab
  const allUpcomingEvents = [...liveEvents, ...upcomingEvents]

  const groupEventsByDate = (eventsList: any[]) => {
    const grouped = eventsList.reduce((acc: Record<string, any[]>, event: any) => {
      // Use event's timezone for grouping, fallback to local timezone
      const eventTimeZone = event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      const date = new Date(event.startTime).toLocaleDateString('en-US', { 
        timeZone: eventTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    }, {} as Record<string, any[]>)

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
  }

  const renderEventTimeline = (eventsList: any[]) => {
    if (eventsList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            No {activeTab} events
          </div>
        </div>
      )
    }

    const groupedEvents = groupEventsByDate(eventsList)

    return (
      <div className="relative">
        {/* Timeline line connecting all dots */}
        <div className="absolute left-3 md:left-[163.5px] top-2 bottom-0 w-0.5 border-l border-dashed border-border"></div>
        
        <div className="space-y-10">
          {groupedEvents.map(([dateString, dayEvents]) => {
            // Get timezone from first event in the group
            const eventTimeZone = dayEvents[0]?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
            const displayDate = new Date(dayEvents[0]?.startTime)
            
            return (
              <div key={dateString} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 pl-12 md:pl-0">
                {/* Date section */}
                <div className="md:w-32 flex-shrink-0">
                  <div className="text-lg font-semibold text-foreground">
                    {displayDate.toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short',
                      timeZone: eventTimeZone 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {displayDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      timeZone: eventTimeZone 
                    })}
                  </div>
                </div>
              
              {/* Timeline dot */}
              <div className="absolute left-[9px] md:relative md:left-auto flex items-center justify-center w-2 h-2 bg-border rounded-full ring-4 ring-background flex-shrink-0 mt-2 z-10"></div>
              
              {/* Card section */}
              <div className="flex-1 space-y-4">
                {dayEvents.map((event: any) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-end mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming">
          {renderEventTimeline(allUpcomingEvents)}
        </TabsContent>
        
        <TabsContent value="past">
          {renderEventTimeline(pastEvents)}
        </TabsContent>
      </Tabs>
    </div>
  )
}