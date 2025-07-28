"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { PageHeader } from "@/components/page-header"
import { AccountTab } from "./account-tab"
import { NotificationsTab } from "./notifications-tab"

export default function SettingsPage() {
  return (
    <div className="flex-1 flex justify-center px-6 pt-6 pb-12">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="account" className="space-y-6">
          <PageHeader title="Settings">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
          </PageHeader>
          <TabsContent value="account" className="mt-6">
            <AccountTab />
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <NotificationsTab/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}