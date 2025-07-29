"use client"

import { useState } from "react"
import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { DateTimeSelector } from "./components/date-time-selector"
import { type ITimezoneOption } from "react-timezone-select"

export default function CreateEventPage() {
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [timezone, setTimezone] = useState<string | ITimezoneOption>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  return (
    <PageLayout title="">
          <DateTimeSelector
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            timezone={timezone}
            onStartDateChange={setStartDate}
            onStartTimeChange={setStartTime}
            onEndDateChange={setEndDate}
            onEndTimeChange={setEndTime}
            onTimezoneChange={setTimezone}
          />
    </PageLayout>
  )
} 