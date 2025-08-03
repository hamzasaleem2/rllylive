"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { PageLayout } from "@/components/page-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { CalendarEvents } from "./components/calendar-events"
import { CalendarPeople } from "./components/calendar-people"
import { CalendarSettings } from "./components/calendar-settings"
import { CalendarStats } from "./components/calendar-stats"
import { ErrorBoundary } from "../../../../components/error-boundary"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Globe, Lock, Calendar, Users, Settings, BarChart3, UserCheck, ExternalLink } from "lucide-react"

export default function CalendarManagePage() {
  const params = useParams()
  const calendarId = params.calendarId as string
  const [activeTab, setActiveTab] = useState("events")

  // Fetch calendar data
  const calendar = useQuery(api.calendars.getCalendar, { 
    calendarId: calendarId as any 
  })
  const stats = useQuery(api.calendars.getCalendarStats, { 
    calendarId: calendarId as any 
  })

  if (calendar === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-destructive font-medium">Calendar not found</div>
          <p className="text-sm text-muted-foreground mt-2">
            This calendar may not exist or you may not have permission to view it.
          </p>
        </div>
      </div>
    )
  }

  if (!calendar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-6 w-full max-w-4xl px-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getViewCalendarUrl = () => {
    if (calendar?.publicUrl) {
      return `/cal/${calendar.publicUrl}`
    }
    return `/cal/${calendarId}`
  }

  const viewCalendarButton = calendar ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open(getViewCalendarUrl(), '_blank')}
      className="gap-2 cursor-pointer"
    >
      <ExternalLink className="h-4 w-4" />
      View Calendar
    </Button>
  ) : null

  return (
    <ErrorBoundary>
      <PageLayout title={calendar.name} rightElement={viewCalendarButton}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
            <TabsTrigger
              value="events"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              People
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Settings
            </TabsTrigger>
          </TabsList>
          
          <ErrorBoundary>
            <TabsContent value="events" className="mt-6">
              <CalendarEvents calendarId={calendarId as any} />
            </TabsContent>
          </ErrorBoundary>

          <ErrorBoundary>
            <TabsContent value="people" className="mt-6">
              <CalendarPeople calendarId={calendarId as any} />
            </TabsContent>
          </ErrorBoundary>

          <ErrorBoundary>
            <TabsContent value="analytics" className="mt-6">
              <CalendarStats calendarId={calendarId as any} />
            </TabsContent>
          </ErrorBoundary>

          <ErrorBoundary>
            <TabsContent value="settings" className="mt-6">
              <CalendarSettings 
                calendarId={calendarId as any} 
                calendar={calendar}
              />
            </TabsContent>
          </ErrorBoundary>
        </Tabs>
      </PageLayout>
    </ErrorBoundary>
  )
}