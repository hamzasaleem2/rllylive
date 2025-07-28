import { Metadata } from "next"
import { use } from "react"
import { ProfileClient } from "./profile-client"

interface PublicProfilePageProps {
  params: Promise<{
    rllyId: string
  }>
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { rllyId } = await params
  
  return {
    title: `${rllyId} - Profile`,
    description: `View ${rllyId}'s profile on rlly.live - events that actually happen`,
    openGraph: {
      title: `${rllyId} - Profile | rlly.live`,
      description: `Check out ${rllyId}'s events and profile on rlly.live`,
      type: 'profile',
      url: `https://rlly.live/user/${rllyId}`,
    },
    twitter: {
      card: 'summary',
      title: `${rllyId} - Profile | rlly.live`,
      description: `Check out ${rllyId}'s events and profile on rlly.live`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { rllyId } = use(params)

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <ProfileClient rllyId={rllyId} />
    </main>
  )
}