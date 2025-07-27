"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { notFound } from "next/navigation"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { Header } from "@/components/header"
import { Spinner } from "@workspace/ui/components/spinner"

interface PublicProfilePageProps {
  params: Promise<{
    rllyId: string
  }>
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { rllyId } = use(params)
  const user = useQuery(api.auth.getUserByRllyId, { rllyId })
  const currentUser = useQuery(api.auth.getCurrentUser)
  
  // Check authentication status
  const isAuthenticated = currentUser !== null
  const isOwnProfile = currentUser?.rllyId === rllyId
  const displayUser = isOwnProfile ? currentUser : user

  // Show loading only when user data is still loading
  if (user === undefined) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
        {isAuthenticated ? <AuthenticatedHeader /> : <Header />}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </main>
    )
  }

  if (user === null) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      {isAuthenticated ? <AuthenticatedHeader /> : <Header />}
      
      <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Profile Header */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <div className="text-center space-y-3">
              {/* Profile Avatar */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-live-green/20 to-primary/20 rounded-full overflow-hidden">
                {displayUser?.image ? (
                  <img 
                    src={displayUser.image} 
                    alt={displayUser.name || displayUser.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              
              {/* User Info */}
              <div className="space-y-1">
                <h1 className="font-display text-xl font-medium text-foreground">
                  {displayUser?.name || displayUser?.username || "User"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(displayUser?._creationTime || 0).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex justify-center space-x-6 pt-2">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">0</p>
                    <p className="text-xs text-muted-foreground">hosted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">0</p>
                    <p className="text-xs text-muted-foreground">attended</p>
                  </div>
                </div>
              </div>

              {/* Share Profile */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    if (displayUser?.rllyId) {
                      const url = `${window.location.origin}/user/${displayUser.rllyId}`
                      navigator.clipboard.writeText(url)
                    }
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>

          {/* Past Events */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <h2 className="font-display text-lg font-medium text-foreground mb-4">
              Past Events
            </h2>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No events yet</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}