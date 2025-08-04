"use client"

import '../../create/components/description-preview.css'
import { DescriptionEditor } from '../../create/components/description-editor'
import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, Lock, Globe, CheckCircle, Timer, Video, ExternalLink, ChevronDown, ChevronUp, UserPlus, Share2 } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { ContactHostDialog } from "./contact-host-dialog"
import { ReportEventDialog } from "./report-event-dialog"
import { CancelRegistrationDialog } from "./cancel-registration-dialog"
import { InviteFriendDialog } from "./invite-friend-dialog"
import { ShareEventDialog } from "./share-event-dialog"
import { ApprovalRequestsDialog } from "./approval-requests-dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { toast } from "sonner"

interface EventPreviewProps {
  event: any
}

export function EventPreview({ event }: EventPreviewProps) {
  const router = useRouter()
  const [contactHostOpen, setContactHostOpen] = useState(false)
  const [reportEventOpen, setReportEventOpen] = useState(false)
  const [cancelRegistrationOpen, setCancelRegistrationOpen] = useState(false)
  const [inviteFriendOpen, setInviteFriendOpen] = useState(false)
  const [shareEventOpen, setShareEventOpen] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  
  // Get current user and their RSVP status
  const currentUser = useQuery(api.auth.getCurrentUser)
  const userRSVP = useQuery(api.eventRSVPs.getUserRSVP, { eventId: event._id })
  const updateRSVP = useMutation(api.eventRSVPs.updateRSVP)
  
  // Get approval request status
  const approvalStatus = useQuery(api.eventApprovals.getApprovalRequestStatus, { eventId: event._id })
  const requestApproval = useMutation(api.eventApprovals.requestEventApproval)
  
  // Get attendees who are going (public query)
  const attendingUsers = useQuery(api.eventRSVPs.getEventAttendees, { 
    eventId: event._id
  })
  
  // Check event status
  const now = Date.now()
  const isLive = now >= event.startTime && now <= event.endTime
  const isPast = now > event.endTime
  const isFuture = now < event.startTime
  
  // Calculate time until start for future events
  const getTimeUntilStart = () => {
    if (!isFuture) return null
    
    const timeDiff = event.startTime - now
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `Starts in ${days} day${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else {
      return "Starting soon"
    }
  }
  
  const timeUntilStart = getTimeUntilStart()

  const handleHostClick = (username?: string, rllyId?: string) => {
    const identifier = username || rllyId
    if (identifier) {
      router.push(`/user/${identifier}`)
    }
  }

  const handleAttendeeClick = (user: any) => {
    const identifier = user.username || user.rllyId
    if (identifier) {
      router.push(`/user/${identifier}`)
    }
  }

  const handleJoinEvent = async () => {
    if (!currentUser) return
    
    setIsJoining(true)
    try {
      // Check if event requires approval
      if (event.requiresApproval && !event.userStatus?.isCreator && !event.userStatus?.isCalendarOwner) {
        // Check if user already has an approved request
        if (!approvalStatus || approvalStatus.status !== "approved") {
          await requestApproval({
            eventId: event._id,
            message: "I would like to attend this event."
          })
          toast.success("Approval request sent! You'll be notified when reviewed.")
          return
        }
      }
      
      // Proceed with normal RSVP
      await updateRSVP({
        eventId: event._id,
        status: "going"
      })
      // The userRSVP query will automatically update
    } catch (error) {
      console.error("Failed to join event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to join event")
    } finally {
      setIsJoining(false)
    }
  }

  const handleCancelRegistration = () => {
    setCancelRegistrationOpen(true)
  }

  const handleRegistrationCancelled = () => {
    // The userRSVP query will automatically update
  }


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSocialClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const SocialLinks = ({ user }: { user: any }) => {
    const socialLinks = []
    
    if (user.website) {
      socialLinks.push({
        icon: <ExternalLink className="w-4 h-4" />,
        url: user.website.startsWith('http') ? user.website : `https://${user.website}`,
        label: 'Website'
      })
    }
    
    if (user.twitter) {
      socialLinks.push({
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        url: `https://x.com/${user.twitter.replace('@', '')}`,
        label: 'X (Twitter)'
      })
    }
    
    if (user.instagram) {
      socialLinks.push({
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        ),
        url: `https://instagram.com/${user.instagram.replace('@', '')}`,
        label: 'Instagram'
      })
    }

    if (socialLinks.length === 0) return null

    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {socialLinks.map((link, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleSocialClick(e, link.url)}
                  className="text-muted-foreground hover:text-primary transition-colors p-1 -m-1 rounded cursor-pointer"
                >
                  {link.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{link.url}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    )
  }

  const formatDateTime = (timestamp: number, timezone: string) => {
    const date = new Date(timestamp)
    
    // Create a more reliable timezone display
    let timezoneDisplay = timezone
    try {
      // Try to get the short timezone name (e.g., "PKT" for Pakistan Standard Time)
      const shortTz = date.toLocaleTimeString('en-US', { 
        timeZoneName: 'short',
        timeZone: timezone
      }).split(' ').pop()
      
      // If we got a valid short timezone, use format: "Asia/Karachi (PKT)"
      if (shortTz && shortTz !== timezone) {
        timezoneDisplay = `${timezone} (${shortTz})`
      }
    } catch (error) {
      // Fallback to just the timezone string if formatting fails
      timezoneDisplay = timezone
    }
    
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: timezone
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
      }),
      shortDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: timezone
      }),
      timezoneDisplay
    }
  }

  const startDateTime = formatDateTime(event.startTime, event.timezone)
  const endDateTime = formatDateTime(event.endTime, event.timezone)

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')
  }


  const hasDescription = event.description && stripHtml(event.description).trim() !== ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Mobile Event Header - Show first on mobile only */}
      <div className="lg:hidden mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-4 tracking-tight leading-tight">{event.name}</h1>
        
        {/* Event Meta Info on Mobile */}
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-card border rounded-lg flex flex-col items-center justify-center text-center">
              <div className="text-xs text-muted-foreground leading-none">
                {startDateTime.shortDate.split(' ')[0]}
              </div>
              <div className="text-sm font-medium leading-none">
                {startDateTime.shortDate.split(' ')[1]}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium">{startDateTime.date}</div>
              <div className="text-sm text-muted-foreground">
                {startDateTime.time} - {endDateTime.time}
              </div>
              <div className="text-xs text-muted-foreground">
                {startDateTime.timezoneDisplay}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-card border rounded-lg flex items-center justify-center">
              {event.location ? (
                event.location.toLowerCase().includes('virtual') || 
                event.location.toLowerCase().includes('online') ? (
                  <Video className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                )
              ) : (
                <Video className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">
                {userRSVP?.status === "going" ? (
                  event.location || 'Virtual'
                ) : (
                  <span className="text-muted-foreground">Register to See Address</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
        
        {/* Left Sidebar */}
        <div className="lg:w-96 flex-shrink-0 space-y-6">
          
          {/* Event Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-muted/20 border relative">
            {event.imageUrl && (
              <Image
                src={event.imageUrl}
                alt={event.name}
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Calendar Info Card / Management Card */}
          {event.userStatus?.isCreator || event.userStatus?.isCalendarOwner ? (
            /* Management Card for creators/owners */
            <div className="bg-card/30 border border-muted-foreground/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">You have manage access for this event.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="text-xs px-3 cursor-pointer"
                  onClick={() => router.push(`/events/${event._id}/manage`)}
                >
                  Manage
                </Button>
                {/* Approval Management - Only show if event requires approval */}
                {event.requiresApproval && (
                  <ApprovalRequestsDialog
                    eventId={event._id}
                    trigger={
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-3 cursor-pointer"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Approvals
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            /* Regular Calendar Info Card for regular users */
            <div className="bg-card/30 border border-muted-foreground/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={event.calendar?.profileImage} />
                  <AvatarFallback 
                    style={{ backgroundColor: event.calendar?.color || '#6366f1' }}
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Presented by</div>
                  <div className="font-medium flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                    {event.calendar?.name || 'Calendar'}
                    <svg className="w-3 h-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full border border-border/50 hover:bg-muted/50 text-xs px-3 cursor-pointer">
                  Subscribe
                </Button>
              </div>
              
              {event.calendar?.description ? (
                !descriptionExpanded ? (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {event.calendar.description}
                    </div>
                    {event.calendar.description.length > 60 && (
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setDescriptionExpanded(true)}
                          className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-full border border-primary/30 bg-card/80 backdrop-blur-sm hover:bg-primary/10 cursor-pointer"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {event.calendar.description}
                  </div>
                )
              ) : (
                <div className="text-xs text-muted-foreground/60 italic">
                  No description provided
                </div>
              )}
              
              {/* Calendar Social Links */}
              {(event.calendar?.owner?.website || event.calendar?.owner?.twitter || event.calendar?.owner?.instagram) && (
                <div className="flex items-center gap-2">
                  {event.calendar.owner.website && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(event.calendar.owner.website.startsWith('http') ? event.calendar.owner.website : `https://${event.calendar.owner.website}`, '_blank', 'noopener,noreferrer')
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {event.calendar.owner.website.startsWith('http') ? event.calendar.owner.website : `https://${event.calendar.owner.website}`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {event.calendar.owner.twitter && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://x.com/${event.calendar.owner.twitter.replace('@', '')}`, '_blank', 'noopener,noreferrer')
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          https://x.com/{event.calendar.owner.twitter.replace('@', '')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {event.calendar.owner.instagram && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://instagram.com/${event.calendar.owner.instagram.replace('@', '')}`, '_blank', 'noopener,noreferrer')
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          https://instagram.com/{event.calendar.owner.instagram.replace('@', '')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Attendees Section */}
          {attendingUsers && attendingUsers.length > 0 && (
            <div className="bg-muted/20 rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-3">
                {attendingUsers.length} {attendingUsers.length === 1 ? 'person' : 'people'} going
              </div>
              
              <div className="flex flex-wrap gap-2">
                {attendingUsers.slice(0, 12).map((rsvp) => (
                  rsvp.user && (
                    <div key={rsvp._id} className="relative group">
                      <Avatar 
                        className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-background cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleAttendeeClick(rsvp.user)}
                      >
                        <AvatarImage src={rsvp.user.image} />
                        <AvatarFallback className="text-xs">
                          {getInitials(rsvp.user.name || rsvp.user.username || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Tooltip on hover */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute inset-0 cursor-pointer" onClick={() => handleAttendeeClick(rsvp.user)} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{rsvp.user.name || rsvp.user.username}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                ))}
                
                {/* Show +X more if there are more than 12 attendees */}
                {attendingUsers.length > 12 && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-muted rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{attendingUsers.length - 12}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hosted By Section */}
          <div className="bg-muted/20 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-3">Hosted By</div>
            
            {/* Event Creator */}
            <div 
              onClick={() => handleHostClick(event.createdBy?.username, event.createdBy?.rllyId)}
              className="flex items-center gap-3 mb-3 group cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                {event.createdBy?.image ? (
                  <Image
                    src={event.createdBy.image}
                    alt={event.createdBy.name || 'Event Creator'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
                    {getInitials(event.createdBy?.name || event.createdBy?.username || 'Event Host')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="font-medium text-sm group-hover:text-foreground dark:group-hover:text-white transition-colors">
                  {event.createdBy?.name || event.createdBy?.username || 'Event Host'}
                </div>
                {event.createdBy && <SocialLinks user={event.createdBy} />}
              </div>
            </div>

            {/* Calendar Owner (if different from creator) */}
            {event.calendar?.ownerId !== event.createdById && event.calendar?.owner && (
              <div 
                onClick={() => handleHostClick(event.calendar.owner.username, event.calendar.owner.rllyId)}
                className="flex items-center gap-3 mb-3 group cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 p-2 -m-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                  {event.calendar.owner.image ? (
                    <Image
                      src={event.calendar.owner.image}
                      alt={event.calendar.owner.name || 'Calendar Owner'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-medium text-xs">
                      {getInitials(event.calendar.owner.name || event.calendar.owner.username || 'Host')}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm group-hover:text-foreground dark:group-hover:text-white transition-colors">
                      {event.calendar.owner.name || event.calendar.owner.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Calendar Owner
                    </div>
                  </div>
                  <SocialLinks user={event.calendar.owner} />
                </div>
              </div>
            )}

            {/* Action Links */}
            <div className="pt-3 border-t border-border/20 flex flex-col gap-2 text-xs">
              <button 
                onClick={() => setContactHostOpen(true)}
                className="text-primary hover:underline font-medium text-left cursor-pointer"
              >
                Contact Host
              </button>
              {/* Only show Report Event if user has RSVP'd as going */}
              {userRSVP?.status === "going" && (
                <button 
                  onClick={() => setReportEventOpen(true)}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors text-left cursor-pointer"
                >
                  Report Event
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          
          {/* Event Header - Desktop Only */}
          <div className="hidden lg:block">
            <h1 className="text-3xl font-semibold text-foreground mb-6 tracking-tight leading-tight">{event.name}</h1>
          </div>

          {/* Event Meta Info - Desktop Only */}
          <div className="space-y-4 hidden lg:block">
            
            {/* Date and Time */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card border rounded-lg flex flex-col items-center justify-center text-center">
                <div className="text-xs text-muted-foreground leading-none">
                  {startDateTime.shortDate.split(' ')[0]}
                </div>
                <div className="text-sm font-medium leading-none">
                  {startDateTime.shortDate.split(' ')[1]}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{startDateTime.date}</div>
                <div className="text-sm text-muted-foreground">
                  {startDateTime.time} - {endDateTime.time}
                </div>
                <div className="text-xs text-muted-foreground">
                  {startDateTime.timezoneDisplay}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card border rounded-lg flex items-center justify-center">
                {event.location ? (
                  event.location.toLowerCase().includes('virtual') || 
                  event.location.toLowerCase().includes('online') ? (
                    <Video className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  )
                ) : (
                  <Video className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {/* Show full location ONLY if user has RSVP'd as going */}
                  {userRSVP?.status === "going" ? (
                    // Show actual location for users who have joined
                    event.location || 'Virtual'
                  ) : (
                    // Show placeholder for all non-RSVPed users (including creators who haven't joined yet)
                    <span className="text-muted-foreground">Register to See Address</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RSVP/Registration Card */}
          <div className="bg-card border rounded-xl p-4 space-y-4">
            {userRSVP?.status === "going" ? (
              /* Already Registered - Show "You're In" state */
              <>
                {/* Top Section - User Info and Status Badges */}
                <div className="space-y-3">
                  {/* User info row */}
                  <div className="flex items-center gap-3">
                    {currentUser && (
                      <>
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={currentUser.image} />
                            <AvatarFallback />
                          </Avatar>
                          {isLive && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{currentUser.name || currentUser.username || 'User'}</div>
                          <div className="text-sm text-muted-foreground">{currentUser.email}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Status badges row */}
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                        LIVE
                      </div>
                    )}
                    {isFuture && timeUntilStart && (
                      <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                        {timeUntilStart}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="font-medium">You're In</div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                <Button 
  className="flex-1 bg-primary hover:bg-primary/90" 
  onClick={() => {
    const link = event.virtualLink || event.location;
    const url = link.startsWith('http://') || link.startsWith('https://') 
      ? link 
      : `https://${link}`;
    window.open(url, '_blank');
  }}
>
  <Video className="w-4 h-4 mr-2" />
  Join Event
</Button>

                  
                  <Button variant="outline" className="flex-shrink-0" onClick={() => setInviteFriendOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                  
                  <Button variant="outline" className="flex-shrink-0" onClick={() => setShareEventOpen(true)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Cancel Registration */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    No longer able to attend? Notify the host by{' '}
                    <button 
                      onClick={handleCancelRegistration}
                      className="text-primary hover:underline font-medium underline-offset-2 cursor-pointer"
                    >
                      cancelling your registration
                    </button>
                    .
                  </div>
                </div>
              </>
            ) : (
              /* Not Registered - Show Registration Form */
              <>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">Registration</h3>
                    <p className="text-sm text-muted-foreground">Welcome! To join the event, please register below.</p>
                  </div>

                  {/* User Info */}
                  {currentUser && (
                    <div className="p-3 bg-muted/20 rounded-lg space-y-3">
                      {/* User info row */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={currentUser.image} />
                            <AvatarFallback>{getInitials(currentUser.name || currentUser.username || 'User')}</AvatarFallback>
                          </Avatar>
                          {isLive && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{currentUser.name || currentUser.username || 'User'}</div>
                          <div className="text-sm text-muted-foreground">{currentUser.email}</div>
                        </div>
                      </div>
                      
                      {/* Status badges row */}
                      {(isLive || (isFuture && timeUntilStart)) && (
                        <div className="flex items-center gap-2">
                          {isLive && (
                            <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                              LIVE
                            </div>
                          )}
                          {isFuture && timeUntilStart && (
                            <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                              {timeUntilStart}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* RSVP/Approval Button */}
                  {event.requiresApproval && !event.userStatus?.isCreator && !event.userStatus?.isCalendarOwner ? (
                    // Event requires approval
                    approvalStatus?.status === "pending" ? (
                      <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600" 
                        disabled
                        size="lg"
                      >
                        Approval Pending
                      </Button>
                    ) : approvalStatus?.status === "rejected" ? (
                      <Button 
                        className="w-full bg-red-500 hover:bg-red-600" 
                        disabled
                        size="lg"
                      >
                        Request Rejected
                      </Button>
                    ) : approvalStatus?.status === "approved" ? (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
                        onClick={handleJoinEvent}
                        disabled={isJoining || isPast}
                        size="lg"
                        variant={isPast ? "secondary" : "default"}
                      >
                        {isPast 
                          ? "Event Has Ended" 
                          : isJoining 
                            ? "Registering..." 
                            : "Join Event"}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600" 
                        onClick={handleJoinEvent}
                        disabled={isJoining || isPast}
                        size="lg"
                        variant={isPast ? "secondary" : "default"}
                      >
                        {isPast 
                          ? "Event Has Ended" 
                          : isJoining 
                            ? "Requesting..." 
                            : "Request Approval"}
                      </Button>
                    )
                  ) : (
                    // Regular RSVP
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                      onClick={handleJoinEvent}
                      disabled={isJoining || isPast}
                      size="lg"
                      variant={isPast ? "secondary" : "default"}
                    >
                      {isPast 
                        ? "Event Has Ended" 
                        : isJoining 
                          ? "Registering..." 
                          : "One-Click RSVP"}
                    </Button>
                  )}

                  {/* Share Event Button for non-registered users */}
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShareEventOpen(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* About Event Card */}
          {hasDescription && (
              <DescriptionEditor 
                description={event.description} 
                readOnly={true}
              />
          )}


        </div>
      </div>

      {/* Dialogs */}
      <ContactHostDialog
        open={contactHostOpen}
        onOpenChange={setContactHostOpen}
        hostName="Event Host"
        userEmail="hamzasaleembusiness@gmail.com"
      />
      
      <ReportEventDialog
        open={reportEventOpen}
        onOpenChange={setReportEventOpen}
        eventId={event._id}
        eventName={event.name}
      />
      
      <CancelRegistrationDialog
        open={cancelRegistrationOpen}
        onOpenChange={setCancelRegistrationOpen}
        eventId={event._id}
        eventName={event.name}
        onCancelled={handleRegistrationCancelled}
      />

      <InviteFriendDialog
        open={inviteFriendOpen}
        onOpenChange={setInviteFriendOpen}
        eventId={event._id}
        eventName={event.name}
      />

      <ShareEventDialog
        open={shareEventOpen}
        onOpenChange={setShareEventOpen}
        eventId={event._id}
        eventName={event.name}
      />
    </div>
  )
}