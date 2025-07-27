import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - rlly.live",
  description: "Manage your events and RSVPs in real-time",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl font-medium text-foreground">
          Welcome to your Dashboard
        </h1>
        <p className="text-muted-foreground">
          This is where authenticated users will land
        </p>
      </div>
    </div>
  )
}