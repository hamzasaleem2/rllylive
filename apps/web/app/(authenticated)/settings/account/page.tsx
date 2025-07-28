import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { AccountTab } from "../account-tab"
import { SettingsNav } from "../settings-nav"

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account profile, username, and personal information on rlly.live",
  robots: "noindex, nofollow",
}

export default function AccountSettingsPage() {
  return (
    <div className="flex-1 flex justify-center px-6 pt-6 pb-12">
      <div className="w-full max-w-4xl">
        <PageHeader title="Settings">
          <SettingsNav activeTab="account" />
        </PageHeader>
        <div className="mt-6">
          <AccountTab />
        </div>
      </div>
    </div>
  )
} 