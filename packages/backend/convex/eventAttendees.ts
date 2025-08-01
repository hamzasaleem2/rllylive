import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

// Get attendees for an event
export const getEventAttendees = query({
  args: {
    eventId: v.id("events"),
    attendeeType: v.optional(v.union(v.literal("creator"), v.literal("invited"), v.literal("registered"))),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to view attendees
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // For private events, only organizers and attendees can see the list
    if (!event.isPublic) {
      const calendar = await ctx.db.get(event.calendarId)
      if (!calendar) {
        throw new Error("Calendar not found")
      }

      const isOrganizer = event.createdById === user.userId || calendar.ownerId === user.userId
      
      if (!isOrganizer) {
        // Check if user is an attendee
        const userAttendee = await ctx.db
          .query("eventAttendees")
          .withIndex("by_event_user", (q) => 
            q.eq("eventId", args.eventId).eq("userId", user.userId)
          )
          .first()

        if (!userAttendee) {
          throw new Error("You don't have permission to view attendees for this event")
        }
      }
    }

    let attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Filter by attendee type if provided
    if (args.attendeeType) {
      attendees = attendees.filter(attendee => attendee.attendeeType === args.attendeeType)
    }

    // Enrich with user info and RSVP details
    const enrichedAttendees = await Promise.all(
      attendees.map(async (attendee) => {
        const attendeeUser = await ctx.db.get(attendee.userId)
        
        // Get RSVP info if available
        const rsvp = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event_user", (q) => 
            q.eq("eventId", args.eventId).eq("userId", attendee.userId)
          )
          .first()

        return {
          ...attendee,
          user: attendeeUser ? {
            _id: attendeeUser._id,
            name: attendeeUser.name,
            username: attendeeUser.username,
            image: attendeeUser.image,
          } : null,
          rsvp: rsvp ? {
            status: rsvp.status,
            guestCount: rsvp.guestCount,
            dietaryRestrictions: rsvp.dietaryRestrictions,
            notes: rsvp.notes,
          } : null,
        }
      })
    )

    return enrichedAttendees.sort((a, b) => a.registeredAt - b.registeredAt)
  },
})

// Get attendee count for an event
export const getEventAttendeeCount = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Get detailed counts
    const counts = {
      total: attendees.length,
      creators: 0,
      invited: 0,
      registered: 0,
      checkedIn: 0,
    }

    attendees.forEach((attendee) => {
      counts[attendee.attendeeType] += 1
      if (attendee.checkedIn) {
        counts.checkedIn += 1
      }
    })

    return counts
  },
})

// Check in attendee
export const checkInAttendee = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to check in attendees
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to check in attendees")
    }

    // Find the attendee
    const attendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first()

    if (!attendee) {
      throw new Error("User is not an attendee of this event")
    }

    if (attendee.checkedIn) {
      throw new Error("User is already checked in")
    }

    // Check in the attendee
    await ctx.db.patch(attendee._id, {
      checkedIn: true,
      checkedInAt: Date.now(),
    })

    return { success: true }
  },
})

// Check out attendee (undo check-in)
export const checkOutAttendee = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to check out attendees
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to check out attendees")
    }

    // Find the attendee
    const attendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first()

    if (!attendee) {
      throw new Error("User is not an attendee of this event")
    }

    if (!attendee.checkedIn) {
      throw new Error("User is not checked in")
    }

    // Check out the attendee
    await ctx.db.patch(attendee._id, {
      checkedIn: false,
      checkedInAt: undefined,
    })

    return { success: true }
  },
})

// Remove attendee (for organizers)
export const removeAttendee = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to remove attendees
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to remove attendees")
    }

    // Find the attendee
    const attendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first()

    if (!attendee) {
      throw new Error("User is not an attendee of this event")
    }

    // Can't remove the event creator
    if (attendee.attendeeType === "creator") {
      throw new Error("Cannot remove the event creator")
    }

    // Remove attendee
    await ctx.db.delete(attendee._id)

    // Also remove their RSVP if they have one
    const rsvp = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first()

    if (rsvp) {
      await ctx.db.delete(rsvp._id)
    }

    // If they were invited, update invitation status
    const invitation = await ctx.db
      .query("eventInvitations")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("invitedUserId", args.userId)
      )
      .first()

    if (invitation && invitation.status === "accepted") {
      await ctx.db.patch(invitation._id, {
        status: "declined",
        respondedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

// Get user's attendance history
export const getUserAttendanceHistory = query({
  args: {
    userId: v.optional(v.id("users")), // If not provided, uses current user
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const targetUserId = args.userId || user.userId

    // If checking another user's history, make sure it's allowed
    if (targetUserId !== user.userId) {
      // For now, only allow users to see their own history
      // In the future, you might allow calendar owners to see their members' history
      throw new Error("You can only view your own attendance history")
    }

    const attendances = await ctx.db
      .query("eventAttendees")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect()

    // Enrich with event info
    const enrichedAttendances = await Promise.all(
      attendances.map(async (attendance) => {
        const event = await ctx.db.get(attendance.eventId)
        
        let calendar = null
        if (event) {
          calendar = await ctx.db.get(event.calendarId)
        }

        return {
          ...attendance,
          event: event ? {
            ...event,
            calendar: calendar ? {
              _id: calendar._id,
              name: calendar.name,
              color: calendar.color,
            } : null,
          } : null,
        }
      })
    )

    return enrichedAttendances.sort((a, b) => b.registeredAt - a.registeredAt)
  },
})