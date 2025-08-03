"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { PageLayout } from "@/components/page-layout"
import { EditEventForm } from "./components/edit-event-form"
import { notFound } from "next/navigation"
import { Id } from "@workspace/backend/convex/_generated/dataModel.js"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface EditEventPageProps {
  params: { eventId: string }
}

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = React.use(params)
  const eventId = resolvedParams.eventId as Id<"events">
  
  const event = useQuery(api.events.getEvent, { eventId })
  const currentUser = useQuery(api.auth.getCurrentUser)

  if (event === undefined || currentUser === undefined) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  if (event === null) {
    notFound()
  }

  // Check if user has permission to edit this event
  if (!event.userStatus?.isCreator && !event.userStatus?.isCalendarOwner) {
    notFound()
  }

  return (
    <PageLayout>
      <EditEventForm event={event} />
    </PageLayout>
  )
}