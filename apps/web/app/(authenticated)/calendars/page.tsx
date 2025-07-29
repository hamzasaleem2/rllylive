import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { CalendarGrid } from "./calendar-grid"

export const metadata: Metadata = {
  title: "Calendars",
  description: "Manage your calendars and events",
}

export default function CalendarsPage() {
  return (
    <PageLayout
      title="Calendars"
      rightElement={
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      }
    >
      <CalendarGrid />
    </PageLayout>
  )
}