"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { PageLayout } from "@/components/page-layout"
import { ExternalLink } from "lucide-react"
import { OverviewTab } from "./overview-tab"
import { GuestsTab } from "./guests-tab"
import { RegistrationTab } from "./registration-tab"

interface EventManagementClientProps {
  event: any
}

type TabType = "overview" | "guests" | "registration"

export function EventManagementClient({ event }: EventManagementClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const viewEventButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/events/${event._id}`)}
      className="gap-2 cursor-pointer"
    >
      <ExternalLink className="h-4 w-4" />
      View Event
    </Button>
  )

  return (
    <PageLayout title={event.name} rightElement={viewEventButton}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewTab event={event} />
        </TabsContent>
        
        <TabsContent value="guests" className="mt-6">
          <GuestsTab event={event} />
        </TabsContent>
        
        <TabsContent value="registration" className="mt-6">
          <RegistrationTab event={event} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}