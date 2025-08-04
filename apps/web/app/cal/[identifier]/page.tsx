import { Metadata } from "next"
import { use } from "react"
import { CalendarViewClient } from "./calendar-view-client"

interface PublicCalendarPageProps {
  params: Promise<{
    identifier: string
  }>
}

export async function generateMetadata({ params }: PublicCalendarPageProps): Promise<Metadata> {
  const { identifier } = await params
  
  // For public URLs, show the URL (which could be a display name)
  // For calendar IDs, show "Calendar" since we can't get the actual name without a query
  const displayName = identifier.startsWith('rlly') ? 'Calendar' : identifier
  
  return {
    title: displayName,
    description: `View calendar on rlly.live - events that actually happen`,
    openGraph: {
      title: `${displayName} | rlly.live`,
      description: `Check out this calendar on rlly.live`,
      type: 'website',
      url: `https://app.rlly.live/cal/${identifier}`,
    },
    twitter: {
      card: 'summary',
      title: `${displayName} | rlly.live`,
      description: `Check out this calendar on rlly.live`,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'twitter:title': `${displayName} | rlly.live`,
    },
  }
}

export default function PublicCalendarPage({ params }: PublicCalendarPageProps) {
  const { identifier } = use(params)

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <CalendarViewClient identifier={identifier} />
    </main>
  )
}