import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { CreateCalendarForm } from "./create-calendar-form"

export const metadata: Metadata = {
  title: "Create Calendar",
  description: "Create a new calendar to organize your events",
}

export default function CreateCalendarPage() {
  return (
    <PageLayout title="Create Calendar">
      <CreateCalendarForm />
    </PageLayout>
  )
}