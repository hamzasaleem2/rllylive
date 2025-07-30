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
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const upcomingEvents = useQuery(api.events.getUserUpcomingEvents)
  const pastEvents = useQuery(api.events.getUserPastEvents)

  const renderSkeletonTimeline = () => {
    return (
      <div className="relative">
        {/* Desktop timeline line */}
        <div className="absolute w-0.5 border-l border-dashed border-border left-0 top-[18px] bottom-0 hidden md:block"></div>
        <ol className="relative">
          {[...Array(5)].map((_, groupIndex) => (
            <li key={groupIndex} className="mb-10 ms-0 md:ms-6 relative">
              {/* Desktop dot */}
              <div className="absolute w-3 h-3 bg-muted-foreground rounded-full mt-1.5 -left-[30px] ring-4 ring-background hidden md:block"></div>
            
            {/* Large date on left - responsive positioning */}
            <div className="mb-4 md:mb-0 md:absolute md:-left-[106px] md:top-0">
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            {/* Card on right - responsive */}
            <div className="overflow-x-auto">
              <div className="pb-4">
                <EventCardSkeleton />
              </div>
            </div>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (upcomingEvents === undefined || pastEvents === undefined) {
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
        {/* Desktop timeline line */}
        <div className="absolute w-0.5 border-l border-dashed border-border left-[-1px] top-[18px] bottom-0 hidden md:block"></div>
        <ol className="relative">
          {groupedEvents.map(([dateString, dayEvents]) => (
            <li key={dateString} className="mb-10 ms-0 md:ms-6 relative">
              {/* Desktop dot */}
              <div className="absolute w-3 h-3 bg-muted-foreground rounded-full mt-1.5 -left-[30px] ring-4 ring-background hidden md:block"></div>
            
            {/* Large date on left - responsive positioning */}
            <div className="mb-4 md:mb-0 md:absolute md:-left-[106px] md:top-0">
              <div className="text-lg font-semibold text-foreground">
                {new Date(dateString).getDate()} {new Date(dateString).toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>
            
            {/* Cards on right - responsive */}
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4">
                {dayEvents.map((event: EventWithCalendar) => (
                  <EventCard key={event._id} event={event} />
                ))}  
              </div>
            </div>
            </li>
          ))}
        </ol>
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
              Upcoming ({upcomingEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents?.length || 0})
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