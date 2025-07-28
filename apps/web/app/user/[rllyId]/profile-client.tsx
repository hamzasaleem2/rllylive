"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { notFound } from "next/navigation"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Copy, Check } from "lucide-react"

interface ProfileClientProps {
  rllyId: string
}

function CopyLinkButton({ rllyId }: { rllyId?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!rllyId) return
    
    try {
      const url = `${window.location.origin}/user/${rllyId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback: show error state briefly
      setCopied(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 px-2 text-muted-foreground hover:text-foreground transition-all duration-200"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-live-green" />
          <span className="ml-1 text-xs text-live-green">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span className="ml-1 text-xs">Copy</span>
        </>
      )}
    </Button>
  )
}

export function ProfileClient({ rllyId }: ProfileClientProps) {
  const user = useQuery(api.auth.getUserByRllyId, { rllyId })
  const currentUser = useQuery(api.auth.getCurrentUser)
  
  // Check authentication status
  const isOwnProfile = currentUser?.rllyId === rllyId
  const displayUser = isOwnProfile ? currentUser : user

  // Show loading only when user data is still loading
  if (user === undefined) {
    return (
      <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-2xl">
          {/* Profile Section Skeleton */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-start gap-4">
              {/* Profile Avatar Skeleton */}
              <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
              
              {/* User Info Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-16" />
                </div>
                
                <Skeleton className="h-4 w-32 mb-3" />
                
                <div className="flex gap-6">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Divider Skeleton */}
          <Skeleton className="h-px w-full mb-6" />

          {/* Events Section Skeleton */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
            <div className="p-6 border-b border-border/50">
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="p-6">
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user === null) {
    notFound()
  }

  return (
    <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
      <div className="w-full max-w-2xl">
        {/* Profile Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-start gap-4">
            {/* Profile Avatar */}
            <Avatar className="w-20 h-20 flex-shrink-0">
              <AvatarImage 
                src={displayUser?.image || undefined} 
                alt={displayUser?.name || displayUser?.username || "User"} 
              />
              <AvatarFallback className="bg-gradient-to-br from-live-green/20 to-primary/20 text-lg font-medium">
                {displayUser?.name 
                  ? displayUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : displayUser?.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-xl font-medium text-foreground truncate">
                  {displayUser?.name || displayUser?.username || "User"}
                </h1>
                <CopyLinkButton rllyId={displayUser?.rllyId} />
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Joined {new Date(displayUser?._creationTime || 0).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              
              <div className="flex gap-6">
                <div>
                  <span className="text-lg font-semibold text-foreground">0</span>
                  <span className="text-sm text-muted-foreground ml-1">hosted</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-foreground">0</span>
                  <span className="text-sm text-muted-foreground ml-1">attended</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border/50 mb-6"></div>

        {/* Events Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-display text-lg font-medium text-foreground">
              Events
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No events yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}