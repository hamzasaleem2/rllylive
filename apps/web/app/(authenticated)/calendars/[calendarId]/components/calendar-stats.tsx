"use client"

import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface CalendarStatsProps {
  calendarId: string
}

export function CalendarStats({ calendarId }: CalendarStatsProps) {
  const stats = useQuery(api.calendars.getCalendarStats, { 
    calendarId: calendarId as any 
  })

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Insights</h2>
        <p className="text-xs text-muted-foreground">
          Only events created under this calendar count towards these stats
        </p>
      </div>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Events</p>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} upcoming
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">RSVPs</p>
              <div className="text-2xl font-bold">{stats.totalRSVPs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalGoing} going
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Subscribers</p>
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueParticipants} active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}