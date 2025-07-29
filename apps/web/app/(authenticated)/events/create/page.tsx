"use client"

import { useState } from "react"
import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { CalendarSelector } from "./components/calendar-selector"

export default function CreateEventPage() {
  const [selectedCalendarId, setSelectedCalendarId] = useState("")

  return (
    <PageLayout title="">
          <CalendarSelector
            selectedCalendarId={selectedCalendarId}
            onCalendarChange={setSelectedCalendarId}
          />
    </PageLayout>
  )
} 