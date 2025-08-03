import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"
import { enforceRateLimit } from "./rateLimit"

// Input sanitization helpers
function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
}

function sanitizeUrl(url: string): string {
  if (!url) return ''
  const trimmedUrl = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:') ||
    trimmedUrl.startsWith('file:')
  ) {
    return ''
  }
  
  return url.trim()
}

// Create a new event
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    calendarId: v.id("calendars"),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    // Ticket options
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    ticketName: v.optional(v.string()),
    ticketDescription: v.optional(v.string()),
    // Event options
    requiresApproval: v.optional(v.boolean()),
    hasCapacityLimit: v.optional(v.boolean()),
    capacity: v.optional(v.number()),
    waitingList: v.optional(v.boolean()),
    // Privacy
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Rate limiting
    await enforceRateLimit(ctx, user.userId, "createEvent")

    // Sanitize and validate required fields
    const sanitizedName = sanitizeText(args.name)
    const sanitizedDescription = args.description ? sanitizeText(args.description) : undefined
    const sanitizedLocation = args.location ? sanitizeText(args.location) : undefined
    const sanitizedImageUrl = args.imageUrl ? sanitizeUrl(args.imageUrl) : undefined
    const sanitizedTicketName = args.ticketName ? sanitizeText(args.ticketName) : undefined
    const sanitizedTicketDescription = args.ticketDescription ? sanitizeText(args.ticketDescription) : undefined
    
    if (!sanitizedName) {
      throw new Error("Event name is required")
    }

    if (sanitizedName.length > 200) {
      throw new Error("Event name must be less than 200 characters")
    }

    if (sanitizedDescription && sanitizedDescription.length > 1000) {
      throw new Error("Description must be less than 1000 characters")
    }

    // Validate calendar exists and user has access
    const calendar = await ctx.db.get(args.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only create events in your own calendars")
    }

    // Validate time
    if (args.startTime >= args.endTime) {
      throw new Error("End time must be after start time")
    }

    // Validate ticket pricing
    if (args.ticketType === "paid" && (!args.ticketPrice || args.ticketPrice <= 0)) {
      throw new Error("Paid tickets must have a valid price")
    }

    // Validate capacity
    if (args.hasCapacityLimit && (!args.capacity || args.capacity <= 0)) {
      throw new Error("Capacity limit must be greater than 0")
    }

    // Create the event with sanitized data
    const eventId = await ctx.db.insert("events", {
      name: sanitizedName,
      description: sanitizedDescription,
      calendarId: args.calendarId,
      startTime: args.startTime,
      endTime: args.endTime,
      timezone: args.timezone,
      location: sanitizedLocation,
      imageUrl: sanitizedImageUrl,
      imageStorageId: args.imageStorageId,
      theme: "Minimal", // Default theme
      ticketType: args.ticketType,
      ticketPrice: args.ticketType === "paid" ? args.ticketPrice : undefined,
      ticketName: sanitizedTicketName,
      ticketDescription: sanitizedTicketDescription,
      requiresApproval: args.requiresApproval || false,
      hasCapacityLimit: args.hasCapacityLimit || false,
      capacity: args.hasCapacityLimit ? args.capacity : undefined,
      waitingList: args.hasCapacityLimit ? (args.waitingList || false) : false,
      isPublic: args.isPublic ?? true,
      createdById: user.userId as any,
    })

    // Add the creator as an attendee
    await ctx.db.insert("eventAttendees", {
      eventId: eventId,
      userId: user.userId as any,
      attendeeType: "creator",
      registeredAt: Date.now(),
    })

    return { eventId }
  },
})

// Get events for a calendar
export const getCalendarEvents = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    return events.sort((a, b) => a.startTime - b.startTime)
  },
})

// Get upcoming events for a user
export const getUserUpcomingEvents = query({
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    const now = Date.now()

    // Get user's calendars
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    // Get upcoming events from user's calendars
    const events = await ctx.db
      .query("events")
      .collect()
      
    const upcomingEvents = events.filter(event => 
      calendarIds.includes(event.calendarId) && event.endTime > now
    )

    // Enrich events with calendar info
    const enrichedEvents = await Promise.all(
      upcomingEvents.map(async (event) => {
        const calendar = calendars.find(c => c._id === event.calendarId)
        return {
          ...event,
          calendar: calendar ? {
            _id: calendar._id,
            name: calendar.name,
            color: calendar.color,
          } : null,
        }
      })
    )

    return enrichedEvents.sort((a, b) => a.startTime - b.startTime)
  },
})

// Get past events for a user
export const getUserPastEvents = query({
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    const now = Date.now()

    // Get user's calendars
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    // Get past events from user's calendars
    const events = await ctx.db
      .query("events")
      .collect()
      
    const pastEvents = events.filter(event => 
      calendarIds.includes(event.calendarId) && event.endTime <= now
    )

    // Enrich events with calendar info
    const enrichedEvents = await Promise.all(
      pastEvents.map(async (event) => {
        const calendar = calendars.find(c => c._id === event.calendarId)
        return {
          ...event,
          calendar: calendar ? {
            _id: calendar._id,
            name: calendar.name,
            color: calendar.color,
          } : null,
        }
      })
    )

    return enrichedEvents.sort((a, b) => b.startTime - a.startTime) // Most recent first
  },
})

// Get all events for a user (for backwards compatibility)
export const getUserEvents = query({
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    // Get user's calendars
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    // Get all events from user's calendars
    const events = await ctx.db
      .query("events")
      .collect()
      
    const userEvents = events.filter(event => 
      calendarIds.includes(event.calendarId)
    )

    // Enrich events with calendar info
    const enrichedEvents = await Promise.all(
      userEvents.map(async (event) => {
        const calendar = calendars.find(c => c._id === event.calendarId)
        return {
          ...event,
          calendar: calendar ? {
            _id: calendar._id,
            name: calendar.name,
            color: calendar.color,
          } : null,
        }
      })
    )

    return enrichedEvents.sort((a, b) => a.startTime - b.startTime)
  },
})

// Get event by ID with full details
export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    
    const event = await ctx.db.get(eventId)
    if (!event) {
      return null
    }

    // Get calendar info
    const calendar = await ctx.db.get(event.calendarId)
    
    // Get event creator details
    const createdBy = await ctx.db.get(event.createdById)
    
    // Get calendar owner details (if different from creator)
    let calendarOwner = null
    if (calendar && calendar.ownerId !== event.createdById) {
      calendarOwner = await ctx.db.get(calendar.ownerId)
    }
    
    // Get attendee count
    const attendeeCount = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(attendees => attendees.length)

    // Get RSVP summary
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()

    const rsvpSummary = {
      going: 0,
      maybe: 0,
      not_going: 0,
      totalGuests: 0,
    }

    rsvps.forEach((rsvp) => {
      rsvpSummary[rsvp.status] += 1
      if (rsvp.status === "going") {
        rsvpSummary.totalGuests += 1 + (rsvp.guestCount || 0)
      }
    })

    // Get user's relationship to this event (if logged in)
    let userStatus = null
    if (user) {
      // Check if user is invited
      const invitation = await ctx.db
        .query("eventInvitations")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", eventId).eq("invitedUserId", user.userId)
        )
        .first()

      // Check if user is an attendee
      const attendee = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", eventId).eq("userId", user.userId)
        )
        .first()

      // Check user's RSVP
      const userRSVP = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", eventId).eq("userId", user.userId)
        )
        .first()

      userStatus = {
        isCreator: event.createdById === user.userId,
        isCalendarOwner: calendar?.ownerId === user.userId,
        invitation: invitation ? {
          status: invitation.status,
          invitedAt: invitation.invitedAt,
          invitedBy: invitation.invitedBy,
        } : null,
        isAttendee: !!attendee,
        attendeeType: attendee?.attendeeType || null,
        rsvp: userRSVP ? {
          status: userRSVP.status,
          guestCount: userRSVP.guestCount,
          rsvpAt: userRSVP.rsvpAt,
        } : null,
      }
    }
    
    return {
      ...event,
      calendar: calendar ? {
        _id: calendar._id,
        name: calendar.name,
        description: calendar.description,
        color: calendar.color,
        profileImage: calendar.profileImage,
        ownerId: calendar.ownerId,
        owner: calendarOwner ? {
          userId: calendarOwner._id,
          name: calendarOwner.name,
          username: calendarOwner.username,
          rllyId: calendarOwner.rllyId,
          image: calendarOwner.image,
          website: calendarOwner.website,
          twitter: calendarOwner.twitter,
          instagram: calendarOwner.instagram,
        } : null,
      } : null,
      createdBy: createdBy ? {
        userId: createdBy._id,
        name: createdBy.name,
        username: createdBy.username,
        rllyId: createdBy.rllyId,
        image: createdBy.image,
        website: createdBy.website,
        twitter: createdBy.twitter,
        instagram: createdBy.instagram,
      } : null,
      attendeeCount,
      rsvpSummary,
      userStatus,
    }
  },
})

// Get events user is invited to
export const getUserInvitedEvents = query({
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    const now = Date.now()

    // Get pending invitations
    const invitations = await ctx.db
      .query("eventInvitations")
      .withIndex("by_invited_user", (q) => q.eq("invitedUserId", user.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    // Get the events for these invitations
    const invitedEvents = await Promise.all(
      invitations.map(async (invitation) => {
        const event = await ctx.db.get(invitation.eventId)
        if (!event || event.endTime <= now) return null // Skip past events

        const calendar = await ctx.db.get(event.calendarId)
        const inviter = await ctx.db.get(invitation.invitedBy)

        return {
          ...event,
          calendar: calendar ? {
            _id: calendar._id,
            name: calendar.name,
            color: calendar.color,
          } : null,
          invitation: {
            _id: invitation._id,
            status: invitation.status,
            invitedAt: invitation.invitedAt,
            message: invitation.message,
            inviter: inviter ? {
              _id: inviter._id,
              name: inviter.name,
              username: inviter.username,
              image: inviter.image,
            } : null,
          },
        }
      })
    )

    return invitedEvents.filter(event => event !== null).sort((a, b) => a.startTime - b.startTime)
  },
})

// Get all events for user (owned + invited + attending)
export const getAllUserEvents = query({
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return {
        upcoming: [],
        past: [],
      }
    }

    const now = Date.now()

    // Get user's calendars (owned events)
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    // Get all events from user's calendars
    const ownedEvents = await ctx.db
      .query("events")
      .collect()
      .then(events => events.filter(event => calendarIds.includes(event.calendarId)))

    // Get events user is attending (but doesn't own)
    const attendeeRecords = await ctx.db
      .query("eventAttendees")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .collect()

    const attendingEventIds = attendeeRecords
      .filter(record => record.attendeeType !== "creator")
      .map(record => record.eventId)

    const attendingEvents = await Promise.all(
      attendingEventIds.map(eventId => ctx.db.get(eventId))
    ).then(events => events.filter(event => event !== null))

    // Combine and deduplicate events
    const allEventIds = new Set()
    const combinedEvents = []

    for (const event of [...ownedEvents, ...attendingEvents]) {
      if (!allEventIds.has(event._id)) {
        allEventIds.add(event._id)
        combinedEvents.push(event)
      }
    }

    // Enrich events with calendar info and user status
    const enrichedEvents = await Promise.all(
      combinedEvents.map(async (event) => {
        const calendar = calendars.find(c => c._id === event.calendarId) || 
                         await ctx.db.get(event.calendarId)

        // Get user's status for this event
        const attendee = attendeeRecords.find(a => a.eventId === event._id)
        const userRSVP = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event_user", (q) => 
            q.eq("eventId", event._id).eq("userId", user.userId)
          )
          .first()

        const invitation = await ctx.db
          .query("eventInvitations")
          .withIndex("by_event_user", (q) => 
            q.eq("eventId", event._id).eq("invitedUserId", user.userId)
          )
          .first()

        return {
          ...event,
          calendar: calendar ? {
            _id: calendar._id,
            name: calendar.name,
            color: calendar.color,
          } : null,
          userStatus: {
            isCreator: event.createdById === user.userId,
            isCalendarOwner: calendar?.ownerId === user.userId,
            attendeeType: attendee?.attendeeType || null,
            rsvpStatus: userRSVP?.status || null,
            invitationStatus: invitation?.status || null,
          },
        }
      })
    )

    // Split into upcoming and past
    const upcoming = enrichedEvents
      .filter(event => event.endTime > now)
      .sort((a, b) => a.startTime - b.startTime)

    const past = enrichedEvents
      .filter(event => event.endTime <= now)
      .sort((a, b) => b.startTime - a.startTime)

    return { upcoming, past }
  },
})

// Get user profile statistics (hosted/attended counts) - public query
export const getUserProfileStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get events hosted by this user (through their calendars)
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    let hostedEvents = 0
    if (calendarIds.length > 0) {
      const events = await ctx.db
        .query("events")
        .collect()
      
      hostedEvents = events.filter(event => 
        calendarIds.includes(event.calendarId)
      ).length
    }

    // Get events attended by this user (through RSVPs with status "going")
    const attendedRSVPs = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const attendedEvents = attendedRSVPs.filter(rsvp => rsvp.status === "going").length

    return {
      hosted: hostedEvents,
      attended: attendedEvents
    }
  },
})

// Get user profile events (only hosted events) - public query
export const getUserProfileEvents = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    // Get events hosted by this user (through their calendars)
    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect()

    const calendarIds = calendars.map(c => c._id)
    
    if (calendarIds.length === 0) {
      return []
    }

    const events = await ctx.db
      .query("events")
      .collect()
    
    const hostedEvents = await Promise.all(
      events
        .filter(event => calendarIds.includes(event.calendarId))
        .map(async (event) => {
          const calendar = calendars.find(c => c._id === event.calendarId)
          // Get the calendar owner (which is the event host)
          const owner = await ctx.db.get(calendar?.ownerId!)
          return {
            ...event,
            calendar,
            owner: owner ? {
              _id: owner._id,
              name: owner.name,
              username: owner.username,
              image: owner.image,
            } : null
          }
        })
    )

    return hostedEvents
      .sort((a, b) => b.startTime - a.startTime) // Most recent first
      .slice(0, limit)
  },
})

// Update event - CRITICAL MISSING FUNCTIONALITY
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    timezone: v.optional(v.string()),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    ticketType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    ticketPrice: v.optional(v.number()),
    ticketName: v.optional(v.string()),
    ticketDescription: v.optional(v.string()),
    requiresApproval: v.optional(v.boolean()),
    hasCapacityLimit: v.optional(v.boolean()),
    capacity: v.optional(v.number()),
    waitingList: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Rate limiting
    await enforceRateLimit(ctx, user.userId, "updateEvent", args.eventId)

    // Get the event and verify permissions
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if user owns the calendar
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only edit events in your own calendars")
    }

    // Sanitize and validate fields if provided
    const sanitizedName = args.name !== undefined ? sanitizeText(args.name) : undefined
    const sanitizedDescription = args.description !== undefined ? sanitizeText(args.description) : undefined
    const sanitizedLocation = args.location !== undefined ? sanitizeText(args.location) : undefined
    const sanitizedTicketName = args.ticketName !== undefined ? sanitizeText(args.ticketName) : undefined
    const sanitizedTicketDescription = args.ticketDescription !== undefined ? sanitizeText(args.ticketDescription) : undefined
    
    if (sanitizedName !== undefined) {
      if (!sanitizedName) {
        throw new Error("Event name is required")
      }
      if (sanitizedName.length > 200) {
        throw new Error("Event name must be less than 200 characters")
      }
    }

    if (sanitizedDescription !== undefined && sanitizedDescription.length > 1000) {
      throw new Error("Description must be less than 1000 characters")
    }

    if (args.startTime !== undefined && args.endTime !== undefined) {
      if (args.startTime >= args.endTime) {
        throw new Error("Start time must be before end time")
      }
    }

    if (args.capacity !== undefined && args.capacity < 1) {
      throw new Error("Capacity must be at least 1")
    }

    // Handle image upload if provided
    let imageUrl: string | undefined = args.imageUrl
    if (args.imageStorageId) {
      const url = await ctx.storage.getUrl(args.imageStorageId)
      if (!url) {
        throw new Error("Failed to get image URL")
      }
      imageUrl = url
    }

    // Update the event with sanitized data
    await ctx.db.patch(args.eventId, {
      ...(sanitizedName !== undefined && { name: sanitizedName }),
      ...(sanitizedDescription !== undefined && { description: sanitizedDescription }),
      ...(args.startTime !== undefined && { startTime: args.startTime }),
      ...(args.endTime !== undefined && { endTime: args.endTime }),
      ...(args.timezone !== undefined && { timezone: args.timezone }),
      ...(sanitizedLocation !== undefined && { location: sanitizedLocation }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(args.ticketType !== undefined && { ticketType: args.ticketType }),
      ...(args.ticketPrice !== undefined && { ticketPrice: args.ticketPrice }),
      ...(sanitizedTicketName !== undefined && { ticketName: sanitizedTicketName }),
      ...(sanitizedTicketDescription !== undefined && { ticketDescription: sanitizedTicketDescription }),
      ...(args.requiresApproval !== undefined && { requiresApproval: args.requiresApproval }),
      ...(args.hasCapacityLimit !== undefined && { hasCapacityLimit: args.hasCapacityLimit }),
      ...(args.capacity !== undefined && { capacity: args.capacity }),
      ...(args.waitingList !== undefined && { waitingList: args.waitingList }),
      ...(args.isPublic !== undefined && { isPublic: args.isPublic }),
    })

    return { success: true }
  },
})

// Delete event - CRITICAL MISSING FUNCTIONALITY
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Rate limiting
    await enforceRateLimit(ctx, user.userId, "deleteEvent", eventId)

    // Get the event and verify permissions
    const event = await ctx.db.get(eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if user owns the calendar
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only delete events in your own calendars")
    }

    // CRITICAL: Proper cascading delete - Delete all related data
    
    // 1. Delete all RSVPs for this event
    const eventRSVPs = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
    
    for (const rsvp of eventRSVPs) {
      await ctx.db.delete(rsvp._id)
    }

    // 2. Delete all invitations for this event
    const eventInvitations = await ctx.db
      .query("eventInvitations")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
    
    for (const invitation of eventInvitations) {
      await ctx.db.delete(invitation._id)
    }

    // 3. Delete all attendees for this event
    const eventAttendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
    
    for (const attendee of eventAttendees) {
      await ctx.db.delete(attendee._id)
    }

    // 4. Delete all reports for this event
    const eventReports = await ctx.db
      .query("eventReports")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
    
    for (const report of eventReports) {
      await ctx.db.delete(report._id)
    }

    // 5. Finally, delete the event itself
    await ctx.db.delete(eventId)

    return { success: true }
  },
})