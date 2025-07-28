"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { notFound, redirect } from "next/navigation"
import { useRouter } from "next/navigation"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Copy, Check, Instagram, Globe } from "lucide-react"

interface ProfileClientProps {
  identifier: string
}

function CopyLinkButton({ identifier }: { identifier?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!identifier) return
    
    try {
      const url = `${window.location.origin}/user/${identifier}`
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
      className="h-8 px-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-live-green" />
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function ProfileClient({ identifier }: ProfileClientProps) {
  const router = useRouter()
  
  // Try to get user by username first, then by rllyId
  const userByUsername = useQuery(api.auth.getUserByUsername, { username: identifier })
  const userByRllyId = useQuery(api.auth.getUserByRllyId, { rllyId: identifier })
  const currentUser = useQuery(api.auth.getCurrentUser)
  
  // Determine which user data to use
  const user = userByUsername || userByRllyId
  
  // Check authentication status
  const isOwnProfile = currentUser?.rllyId === user?.rllyId
  const displayUser = isOwnProfile ? currentUser : user

  // Redirect from rllyId to username if available
  useEffect(() => {
    if (user && identifier.startsWith('rlly') && user.username) {
      // Only redirect if we're on the rllyId URL and user has a username
      router.replace(`/user/${user.username}`)
    }
  }, [user, identifier, router])

  // Update document title with actual user data when available
  useEffect(() => {
    if (displayUser) {
      const displayName = displayUser.name || displayUser.username || 'Profile'
      document.title = `${displayName} | rlly.live`
    }
  }, [displayUser])

  // Show loading only when user data is still loading
  if (userByUsername === undefined && userByRllyId === undefined) {
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

  // Get the best identifier for copying (username if available, otherwise rllyId)
  const copyIdentifier = displayUser?.username || displayUser?.rllyId

  return (
    <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
      <div className="w-full max-w-2xl">
        {/* Profile Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-start gap-4">
            {/* Profile Avatar */}
            <Avatar className="w-20 h-20 flex-shrink-0 cursor-pointer">
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
                <CopyLinkButton identifier={copyIdentifier} />
              </div>
              
              {/* Username and Bio */}
              {displayUser?.username && (
                <p className="text-sm text-muted-foreground mb-2">
                  @{displayUser.username}
                </p>
              )}
              
              {displayUser?.bio && (
                <p className="text-sm text-muted-foreground mb-3 max-w-md">
                  {displayUser.bio}
                </p>
              )}
              
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
              
              {/* Social Links */}
              {(displayUser?.instagram || displayUser?.twitter || displayUser?.website) && (
                <div className="flex gap-3 mt-4">
                  {displayUser?.instagram && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={`https://instagram.com/${displayUser.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer nofollow" 
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            data-external-link="true"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Instagram: @{displayUser.instagram}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {displayUser?.twitter && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={`https://x.com/${displayUser.twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer nofollow" 
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            data-external-link="true"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" className="h-5 w-5">
                              <path fill="currentColor" d="m108.783 107.652-38.24-55.748.066.053L105.087 12H93.565L65.478 44.522 43.174 12H12.957l35.7 52.048-.005-.005L11 107.653h11.522L53.748 71.47l24.817 36.182zM38.609 20.696l53.652 78.26h-9.13l-53.696-78.26z"></path>
                            </svg>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>X: @{displayUser.twitter}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {displayUser?.website && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={displayUser.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Globe className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Website: {displayUser.website}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      
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