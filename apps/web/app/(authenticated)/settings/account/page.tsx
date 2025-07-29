import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { AccountTab } from "../account-tab"
import { SettingsNav } from "../settings-nav"

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account profile, username, and personal information on rlly.live",
  robots: "noindex, nofollow",
}

export default function AccountSettingsPage() {
  return (
    <PageLayout
      title="Settings"
      rightElement={<SettingsNav activeTab="account" />}
    >
      <AccountTab />
    </PageLayout>
  )
} 