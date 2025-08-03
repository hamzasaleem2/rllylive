"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { EventManagementClient } from "./components/event-management-client"
import { notFound } from "next/navigation"
import { Id } from "@workspace/backend/convex/_generated/dataModel.js"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function EventManagePage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = React.use(params)
  const eventId = resolvedParams.eventId as Id<"events">
  const event = useQuery(api.events.getEvent, { eventId })
  const currentUser = useQuery(api.auth.getCurrentUser)

  if (event === undefined || currentUser === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (event === null) {
    notFound()
  }

  // Check if user has permission to manage this event
  if (!event.userStatus?.isCreator && !event.userStatus?.isCalendarOwner) {
    notFound()
  }

  return <EventManagementClient event={event} />
}