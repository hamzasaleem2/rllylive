import { Metadata } from "next"
import { use } from "react"
import { ProfileClient } from "./profile-client"

interface PublicProfilePageProps {
  params: Promise<{
    identifier: string
  }>
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { identifier } = await params
  
  // For usernames, show the username (which could be a display name)
  // For rllyIds, show "Profile" since we can't get the actual display name without a query
  const displayName = identifier.startsWith('rlly') ? 'Profile' : identifier
  
  return {
    title: displayName,
    description: `View profile on rlly.live - events that actually happen`,
    openGraph: {
      title: `${displayName} | rlly.live`,
      description: `Check out this profile on rlly.live`,
      type: 'profile',
      url: `https://rlly.live/user/${identifier}`,
    },
    twitter: {
      card: 'summary',
      title: `${displayName} | rlly.live`,
      description: `Check out this profile on rlly.live`,
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

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { identifier } = use(params)

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <ProfileClient identifier={identifier} />
    </main>
  )
} 