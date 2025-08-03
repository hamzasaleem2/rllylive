"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

interface OverviewTabProps {
  event: any
}

export function OverviewTab({ event }: OverviewTabProps) {
  const rsvpSummary = useQuery(api.eventRSVPs.getEventRSVPSummary, { eventId: event._id })
  const approvalStats = useQuery(api.eventApprovals.getEventApprovalStats, { eventId: event._id })
  const attendees = useQuery(api.eventRSVPs.getEventAttendees, { eventId: event._id })

  const now = Date.now()
  const isEventEnded = now > event.endTime
  const isLive = now >= event.startTime && now <= event.endTime

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: event.timezone
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Event Status */}
      {isEventEnded && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Badge variant="secondary">Event Ended</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{rsvpSummary?.going || 0}</div>
            <div className="text-sm text-muted-foreground">Going</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{rsvpSummary?.maybe || 0}</div>
            <div className="text-sm text-muted-foreground">Maybe</div>
          </CardContent>
        </Card>

        {event.requiresApproval && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{approvalStats?.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Registrations */}
      {attendees && attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendees.slice(0, 5).map((rsvp) => (
                rsvp.user && (
                  <div key={rsvp._id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={rsvp.user.image} />
                      <AvatarFallback className="text-xs">
                        {getInitials(rsvp.user.name || rsvp.user.username || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {rsvp.user.name || rsvp.user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rsvp.rsvpAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              ))}
              {attendees.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{attendees.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}