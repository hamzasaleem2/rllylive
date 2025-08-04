"use client"

import React, { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Users, Search, Filter, UserCheck, Clock, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

interface GuestsTabProps {
  event: any
}

export function GuestsTab({ event }: GuestsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "going" | "maybe" | "not_going">("all")

  const rsvps = useQuery(api.eventRSVPs.getEventRSVPs, { 
    eventId: event._id,
    status: statusFilter === "all" ? undefined : statusFilter
  })
  const rsvpSummary = useQuery(api.eventRSVPs.getEventRSVPSummary, { eventId: event._id })

  const filteredRsvps = rsvps?.filter(rsvp => {
    if (!searchQuery) return true
    const user = rsvp.user
    if (!user) return false
    
    const searchLower = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower)
      // user.email?.toLowerCase().includes(searchLower)
    )
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "going":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Going
          </Badge>
        )
      case "maybe":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Maybe
          </Badge>
        )
      case "not_going":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <UserX className="h-3 w-3 mr-1" />
            Not Going
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      {/* At a Glance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{rsvpSummary?.going || 0}</div>
              <div className="text-sm text-muted-foreground">Going</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{rsvpSummary?.maybe || 0}</div>
              <div className="text-sm text-muted-foreground">Maybe</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{rsvpSummary?.totalGuests || 0}</div>
              <div className="text-sm text-muted-foreground">Total Guests</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest List
            </CardTitle>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "All Guests" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Guests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("going")}>
                  Going
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("maybe")}>
                  Maybe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("not_going")}>
                  Not Going
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRsvps === undefined ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredRsvps && filteredRsvps.length > 0 ? (
            <div className="space-y-3">
              {filteredRsvps.map((rsvp) => (
                rsvp.user && (
                  <div key={rsvp._id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={rsvp.user.image} />
                      <AvatarFallback>
                        {getInitials(rsvp.user.name || rsvp.user.username || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">
                          {rsvp.user.name || rsvp.user.username}
                        </p>
                        {rsvp.guestCount && rsvp.guestCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            +{rsvp.guestCount} guest{rsvp.guestCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        No email provided
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered {formatDate(rsvp.rsvpAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(rsvp.status)}
                      
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No guests found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No guests match your search criteria" 
                  : "No one has registered for this event yet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}