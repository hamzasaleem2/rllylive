"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { PageLayout } from "@/components/page-layout"
import { EventPreview } from "./components/event-preview"
import { EventPreviewSkeleton } from "./components/event-preview-skeleton"
import { notFound } from "next/navigation"
import { Id } from "@workspace/backend/convex/_generated/dataModel.js"

interface EventPageProps {
  params: { eventId: string }
}

export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = React.use(params)
  const eventId = resolvedParams.eventId as Id<"events">
  
  const event = useQuery(api.events.getEvent, { eventId })

  if (event === undefined) {
    return (
      <PageLayout>
        <EventPreviewSkeleton />
      </PageLayout>
    )
  }

  if (event === null) {
    notFound()
  }

  return (
    <PageLayout>
      <EventPreview event={event} />
    </PageLayout>
  )
}