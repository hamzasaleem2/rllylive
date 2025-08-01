"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { PageLayout } from "@/components/page-layout"
import { EventCard } from "./components/event-card"
import { EventCardSkeleton } from "./components/event-card-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Doc } from "@workspace/backend/convex/_generated/dataModel.js"

type EventWithCalendar = Doc<"events"> & {
  calendar?: {
    _id: string
    name: string
    color: string
  } | null
  userStatus?: {
    isCreator: boolean
    isCalendarOwner: boolean
    attendeeType: "creator" | "invited" | "registered" | null
    rsvpStatus: "going" | "maybe" | "not_going" | null
    invitationStatus: "pending" | "accepted" | "declined" | null
  } | null
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const allEvents = useQuery(api.events.getAllUserEvents)
  const upcomingEvents = allEvents?.upcoming
  const pastEvents = allEvents?.past

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

  if (allEvents === undefined) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PageLayout 
          title="Events"
          rightElement={
            <TabsList>
              <TabsTrigger value="upcoming">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="past">
                <Skeleton className="h-4 w-12" />
              </TabsTrigger>
            </TabsList>
          }
        >
          <TabsContent value="upcoming">
            {renderSkeletonTimeline()}
          </TabsContent>
          
          <TabsContent value="past">
            {renderSkeletonTimeline()}
          </TabsContent>
        </PageLayout>
      </Tabs>
    )
  }

  const groupEventsByDate = (events: EventWithCalendar[]) => {
    const grouped = events.reduce((acc: Record<string, EventWithCalendar[]>, event: EventWithCalendar) => {
      const date = new Date(event.startTime).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    }, {} as Record<string, EventWithCalendar[]>)

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
  }


  const renderEventTimeline = (events: EventWithCalendar[]) => {
    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            No {activeTab} events
          </div>
        </div>
      )
    }

    const groupedEvents = groupEventsByDate(events)

    return (
      <div className="relative">
        {/* Timeline line connecting all dots */}
        <div className="absolute left-3 md:left-[163.5px] top-2 bottom-0 w-0.5 border-l border-dashed border-border"></div>
        
        <div className="space-y-10">
          {groupedEvents.map(([dateString, dayEvents]) => (
            <div key={dateString} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 pl-12 md:pl-0">
              {/* Date section */}
              <div className="md:w-32 flex-shrink-0">
                <div className="text-lg font-semibold text-foreground">
                  {new Date(dateString).getDate()} {new Date(dateString).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
              </div>
              
              {/* Timeline dot */}
              <div className="absolute left-[9px] md:relative md:left-auto flex items-center justify-center w-2 h-2 bg-border rounded-full ring-4 ring-background flex-shrink-0 mt-2 z-10"></div>
              
              {/* Card section */}
              <div className="flex-1 space-y-4">
                {dayEvents.map((event: EventWithCalendar) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <PageLayout 
        title="Events"
        rightElement={
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="upcoming">
          {renderEventTimeline(upcomingEvents || [])}
        </TabsContent>
        
        <TabsContent value="past">
          {renderEventTimeline(pastEvents || [])}
        </TabsContent>
      </PageLayout>
    </Tabs>
  )
} 