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
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Copy, Check, Globe, Calendar, Clock, MapPin, Users, Video } from "lucide-react"

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
  
  // Only get current user if we're authenticated (this won't throw error if unauthenticated)
  const currentUser = useQuery(api.auth.getCurrentUser)
  
  // Determine which user data to use
  const user = userByUsername || userByRllyId
  
  // Get user profile stats and events
  const userStats = useQuery(api.events.getUserProfileStats, 
    user ? { userId: user._id } : "skip"
  )
  const userEvents = useQuery(api.events.getUserProfileEvents, 
    user ? { userId: user._id, limit: 6 } : "skip"
  )
  
  // Check authentication status - only show enhanced data if it's the user's own profile
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
                  <span className="text-lg font-semibold text-foreground">
                    {userStats?.hosted ?? 0}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">hosted</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-foreground">
                    {userStats?.attended ?? 0}
                  </span>
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
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
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
            {userEvents === undefined ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center min-w-[60px]">
                        <Skeleton className="h-4 w-8 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userEvents && userEvents.length > 0 ? (
              <div className="p-6 space-y-3">
                {userEvents.map((event) => (
                  <ProfileEventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileEventCard({ event }: { event: any }) {
  const router = useRouter()
  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const now = new Date()
  
  const isLive = startDate <= now && endDate >= now
  const isPast = endDate < now
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const getEventStatus = () => {
    if (isLive) {
      return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-xs">LIVE</Badge>
    }
    if (isPast) {
      return <Badge variant="secondary" className="text-xs">Past</Badge>
    }
    return <Badge variant="outline" className="text-xs">Upcoming</Badge>
  }

  const getTypeIndicator = () => {
    if (event.type === "hosted") {
      return <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">Hosted</Badge>
    }
    return <Badge variant="outline" className="text-xs">Attended</Badge>
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => router.push(`/events/${event._id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Date/Time section */}
          <div className="flex-shrink-0 text-center min-w-[60px]">
            <div className="text-sm font-semibold text-foreground">
              {formatDate(startDate)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(startDate)}
            </div>
          </div>
          
          {/* Event info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getEventStatus()}
              {getTypeIndicator()}
            </div>
            
            <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-1">
              {event.name}
            </h3>
            
            {/* Calendar info */}
            {event.calendar && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Calendar className="w-3 h-3" />
                <span className="truncate">{event.calendar.name}</span>
              </div>
            )}
            
            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {event.location.toLowerCase().includes('virtual') || 
                 event.location.toLowerCase().includes('online') ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}