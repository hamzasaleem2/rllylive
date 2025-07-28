import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | rlly.live",
    default: "rlly.live - Create events that actually happen"
  },
  robots: "noindex, nofollow", // Authenticated pages shouldn't be indexed
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Authenticated pages use the unified header from root layout */}
      {children}
    </div>
  )
}