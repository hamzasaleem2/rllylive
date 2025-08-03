"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Copy, Check, Calendar, MapPin, Clock, Users, Video, Lock } from "lucide-react"

interface CalendarViewClientProps {
  identifier: string
}

function CopyLinkButton({ identifier }: { identifier?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!identifier) return
    
    try {
      const url = `${window.location.origin}/cal/${identifier}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
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
        <Check className="h-4 w-4 text-live-green" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

function EventCard({ event }: { event: any }) {
  const router = useRouter()
  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const now = new Date()
  
  const isLive = startDate <= now && endDate >= now
  const isPast = endDate < now
  const isUpcoming = startDate > now

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getEventStatus = () => {
    if (isLive) {
      return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">LIVE</Badge>
    }
    if (isPast) {
      return <Badge variant="secondary">Past</Badge>
    }
    return <Badge variant="outline">Upcoming</Badge>
  }

  const handleEventClick = () => {
    router.push(`/events/${event._id}`)
  }

  return (
    <div 
      className="w-full bg-card border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleEventClick}
    >
      <div className="p-6 flex gap-6">
        {/* Event info */}
        <div className="flex-1">
          {/* Time with LIVE indicator */}
          <div className="flex items-center gap-2 mb-3">
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-bold text-emerald-600 tracking-wide">LIVE</span>
              </div>
            )}
            <span className="text-base text-muted-foreground font-semibold">
              {formatTime(startDate)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl leading-tight mb-4 line-clamp-2">
            {event.name || event.title}
          </h3>


          {/* Key Info - one per row */}
          <div className="space-y-3">
            {/* Location */}
            {!event.location ? (
              <div className="flex items-center gap-2 text-orange-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M7.277 8.487a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-1.5 0zm.75 3.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" />
                  <path stroke="currentColor" strokeWidth="1.5" d="M2.08 9.103C3.372 6.313 4.313 4.287 5.174 2.9 6.044 1.498 6.717.948 7.388.813a3.3 3.3 0 0 1 1.277 0c.671.135 1.344.685 2.214 2.087.86 1.387 1.802 3.414 3.094 6.203.582 1.256.98 2.12 1.185 2.828.194.673.187 1.122.017 1.557-.086.22-.273.53-.427.71-.318.368-.688.575-1.29.71-.644.145-1.485.192-2.728.258a51 51 0 0 1-5.407 0c-1.243-.066-2.083-.113-2.728-.258-.602-.135-.972-.342-1.29-.71a2.9 2.9 0 0 1-.427-.71c-.17-.435-.177-.884.017-1.557.204-.707.603-1.572 1.185-2.828Z" />
                </svg>
                <span>Location Missing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {event.location.toLowerCase().includes('virtual') || 
                 event.location.toLowerCase().includes('online') || 
                 event.location.toLowerCase().includes('youtube') ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Capacity or RSVP counts */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {event.rsvpCounts ? (
                <span>{event.rsvpCounts.going} going, {event.rsvpCounts.total} total RSVPs</span>
              ) : event.capacity ? (
                <span>{event.capacity} spots</span>
              ) : (
                <span>Unlimited capacity</span>
              )}
            </div>
          </div>

          {/* Bottom section - status badges */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {getEventStatus()}
            </div>
          </div>
        </div>
        
        {/* Event image */}
        <div className="flex-shrink-0 self-start">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.name || event.title}
              className="w-40 h-40 rounded-lg object-cover"
            />
          ) : (
            <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"></div>
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarStats({ stats }: { stats: any }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Events</p>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">RSVPs</p>
            <div className="text-2xl font-bold">{stats.totalRSVPs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGoing} going
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Subscribers</p>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Live</p>
            <div className="text-2xl font-bold">{stats.liveEvents}</div>
            <p className="text-xs text-muted-foreground">
              happening now
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function CalendarViewClient({ identifier }: CalendarViewClientProps) {
  const router = useRouter()
  
  // Try both approaches - first by ID, then by URL
  // We'll let the backend determine validity
  const calendarById = useQuery(api.calendars.getPublicCalendar, 
    { calendarId: identifier as any }
  )
  
  const calendarByUrl = useQuery(api.calendars.getPublicCalendarByUrl, 
    { publicUrl: identifier }
  )
  
  // Use whichever one returns a valid calendar
  const calendarResponse = calendarById?.status === "public" || calendarById?.status === "private" 
    ? calendarById 
    : calendarByUrl
  const calendar = calendarResponse?.status === "public" ? calendarResponse.calendar : null
  const isPrivate = calendarResponse?.status === "private"
  
  // Get events and stats if we have a calendar
  const events = useQuery(
    api.calendars.getPublicCalendarEvents, 
    calendar ? { calendarId: calendar._id } : "skip"
  )
  
  const stats = useQuery(
    api.calendars.getPublicCalendarStats,
    calendar ? { calendarId: calendar._id } : "skip"
  )

  // Redirect from ID to public URL if available (similar to user profiles)
  useEffect(() => {
    // Only redirect if we found calendar by ID and it has a public URL
    if (calendarById?.status === "public" && calendarById.calendar?.publicUrl && identifier !== calendarById.calendar.publicUrl) {
      router.replace(`/cal/${calendarById.calendar.publicUrl}`)
    }
  }, [calendarById, identifier, router])

  // Update document title with calendar name
  useEffect(() => {
    if (calendar) {
      document.title = `${calendar.name} | rlly.live`
    }
  }, [calendar])

  // Show loading while data is loading
  if (calendarById === undefined || calendarByUrl === undefined) {
    return (
      <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-4xl">
          {/* Calendar Header Skeleton */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Events Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center min-w-[60px]">
                      <Skeleton className="h-4 w-8 mb-1" />
                      <Skeleton className="h-8 w-8 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show private calendar message
  if (isPrivate && calendarResponse?.calendar) {
    return (
      <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg">
            <div className="mb-4">
              <p className="text-muted-foreground mb-6">
                This calendar is private and not available for public viewing.
              </p>
              <p className="text-sm text-muted-foreground">
                If you're the owner, you can make this calendar public in the settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show not found if calendar doesn't exist (but only if we have a response)
  if (calendarResponse && calendarResponse.status === "not_found") {
    notFound()
  }

  // Get the best identifier for copying (public URL if available, otherwise ID)
  const copyIdentifier = calendar?.publicUrl || calendar?._id

  return (
    <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
      <div className="w-full max-w-4xl">
        {/* Calendar Header */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-start gap-4">
            {/* Calendar Avatar */}
            <div className="flex-shrink-0">
              {calendar?.profileImage ? (
                <img 
                  src={calendar.profileImage} 
                  alt={calendar.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-live-green/20 to-primary/20 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Calendar Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-xl font-medium text-foreground truncate">
                  {calendar?.name}
                </h1>
                <CopyLinkButton identifier={copyIdentifier} />
              </div>
              
              {calendar?.description && (
                <p className="text-sm text-muted-foreground mb-3 max-w-2xl">
                  {calendar.description}
                </p>
              )}

              {calendar?.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{calendar.location}</span>
                </div>
              )}
              
              {calendar?.owner && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Created by</span>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/user/${calendar.owner.username || calendar.owner._id}`)
                    }}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={calendar.owner.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {calendar.owner.name?.[0] || calendar.owner.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {calendar.owner.name || calendar.owner.username}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Stats */}
        <CalendarStats stats={stats} />

        {/* Events Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-display text-lg font-medium text-foreground">
              Events
            </h2>
          </div>
          
          <div className="p-6">
            {events === undefined ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center min-w-[60px]">
                          <Skeleton className="h-4 w-8 mb-1" />
                          <Skeleton className="h-8 w-8 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events?.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No events yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}