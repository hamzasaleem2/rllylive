import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { NotificationsTab } from "../notifications-tab"
import { SettingsNav } from "../settings-nav"

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Manage your notification preferences and email settings on rlly.live",
  robots: "noindex, nofollow",
}

export default function NotificationSettingsPage() {
  return (
    <div className="flex-1 flex justify-center px-6 pt-6 pb-12">
      <div className="w-full max-w-4xl">
        <PageHeader title="Settings">
          <SettingsNav activeTab="notifications" />
        </PageHeader>
        <div className="mt-6">
          <NotificationsTab />
        </div>
      </div>
    </div>
  )
} 