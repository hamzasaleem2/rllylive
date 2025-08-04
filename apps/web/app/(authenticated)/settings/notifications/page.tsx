import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { NotificationsTab } from "../notifications-tab"
import { SettingsNav } from "../settings-nav"

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Manage your notification preferences and email settings on rlly.live",
  robots: "noindex, nofollow",
}

export default function NotificationSettingsPage() {
  return (
    <PageLayout
      title="Settings"
      rightElement={<SettingsNav />}
    >
      <NotificationsTab />
    </PageLayout>
  )
} 