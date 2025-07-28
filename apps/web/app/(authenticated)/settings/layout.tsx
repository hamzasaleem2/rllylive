import type { Metadata } from "next"

export const metadata: Metadata = {
  description: "Manage your account settings and notification preferences on rlly.live",
  robots: "noindex, nofollow", // Settings pages shouldn't be indexed
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 