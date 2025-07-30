"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Calendar, MapPin, Users, Video } from "lucide-react"
import { Doc } from "@workspace/backend/convex/_generated/dataModel.js"

interface EventCardProps {
  event: Doc<"events"> & {
    calendar?: {
      _id: string
      name: string
      color: string
    } | null
  }
}

export function EventCard({ event }: EventCardProps) {
  const now = Date.now()
  const isLive = now >= event.startTime && now <= event.endTime
  const isPast = now > event.endTime

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
    <div className="flex-shrink-0 w-80 sm:w-96 bg-card border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="p-4">
        {/* Top section with image and info */}
        <div className="flex gap-3 mb-4">
          {/* Event image */}
          <div className="flex-shrink-0">
            {event.imageUrl ? (
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"></div>
            )}
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            {/* Time */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {formatTime(startDate)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight mb-3 line-clamp-2">
              {event.name}
            </h3>

            {/* Attributes */}
            <div className="space-y-1">
              {/* Location warning or info */}
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

              {/* Guest count */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>No guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status or actions */}
            <div>
              {isLive ? (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Invited
                </Badge>
              ) : (
                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  <span>Manage Event</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}