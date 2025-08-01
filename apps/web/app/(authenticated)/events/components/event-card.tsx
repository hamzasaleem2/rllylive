"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Calendar, MapPin, Users, Video } from "lucide-react"
import { Doc } from "@workspace/backend/convex/_generated/dataModel.js"
import { useRouter } from "next/navigation"

interface EventCardProps {
  event: Doc<"events"> & {
    calendar?: {
      _id: string
      name: string
      color: string
    } | null
    userStatus?: {
      isCreator: boolean
      isCalendarOwner: boolean
      attendeeType: "creator" | "invited" | "registered" | null
      rsvpStatus: "going" | "maybe" | "not_going" | null
      invitationStatus: "pending" | "accepted" | "declined" | null
    } | null
  }
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  const now = Date.now()
  const isLive = now >= event.startTime && now <= event.endTime
  const isPast = now > event.endTime

  const handleCardClick = () => {
    router.push(`/events/${event._id}`)
  }

  const startDate = new Date(event.startTime)

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

  return (
    <div 
      className="w-full bg-card border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
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
            {event.name}
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

            {/* Join Event Button - only if location exists */}
            {event.location && (
              <div>
                <button 
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle join event logic here
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Join Event</span>
                </button>
              </div>
            )}

            {/* Capacity or Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{event.capacity ? `${event.capacity} spots` : 'Unlimited capacity'}</span>
            </div>
          </div>

          {/* Bottom section - status badges */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {/* Show invitation status badge */}
              {event.userStatus?.invitationStatus === "pending" && (
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                  Invited
                </Badge>
              )}
              
              {/* Show attendee type badge */}
              {event.userStatus?.attendeeType === "invited" && event.userStatus?.invitationStatus === "accepted" && (
                <Badge className="bg-blue-700 text-white hover:bg-blue-700 border-0 font-medium px-3 py-1">
                  Invited
                </Badge>
              )}
              
              {/* Show RSVP status */}
              {event.userStatus?.rsvpStatus === "going" && (
                <Badge className="bg-green-600 text-white hover:bg-green-600 border-0 font-medium px-3 py-1">
                  Going
                </Badge>
              )}
              
              {event.userStatus?.rsvpStatus === "maybe" && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                  Maybe
                </Badge>
              )}
              
            </div>
          </div>
        </div>
        
        {/* Event image */}
        <div className="flex-shrink-0 self-start">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.name}
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