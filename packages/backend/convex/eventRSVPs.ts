import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

// Create or update RSVP
export const updateRSVP = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going")),
    guestCount: v.optional(v.number()),
    dietaryRestrictions: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if event exists
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if event requires approval
    if (event.requiresApproval && args.status === "going") {
      // Check if user has an approved request
      const approvalRequest = await ctx.db
        .query("eventApprovalRequests")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", args.eventId).eq("userId", user.userId)
        )
        .first()

      // Allow if user is the event creator or calendar owner
      const calendar = await ctx.db.get(event.calendarId)
      const isCreator = event.createdById === user.userId
      const isCalendarOwner = calendar && calendar.ownerId === user.userId

      if (!isCreator && !isCalendarOwner) {
        if (!approvalRequest) {
          throw new Error("This event requires approval. Please request approval first.")
        }
        if (approvalRequest.status === "pending") {
          throw new Error("Your approval request is pending review.")
        }
        if (approvalRequest.status === "rejected") {
          throw new Error("Your approval request was rejected. You cannot RSVP to this event.")
        }
        if (approvalRequest.status !== "approved") {
          throw new Error("You need approval to attend this event.")
        }
      }
    }

    // Check if event is public or user is invited/has access
    if (!event.isPublic) {
      // Check if user is invited or is the creator
      const invitation = await ctx.db
        .query("eventInvitations")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", args.eventId).eq("invitedUserId", user.userId)
        )
        .first()

      const isCreator = event.createdById === user.userId

      if (!invitation && !isCreator) {
        throw new Error("You don't have access to RSVP for this event")
      }
    }

    // Validate guest count if event has capacity limits
    if (event.hasCapacityLimit && event.capacity) {
      const totalGuestCount = (args.guestCount || 0) + 1 // +1 for the user themselves
      
      // Get current attendee count
      const currentAttendees = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event_status", (q) => 
          q.eq("eventId", args.eventId).eq("status", "going")
        )
        .collect()

      const currentCount = currentAttendees.reduce((sum, rsvp) => {
        return sum + 1 + (rsvp.guestCount || 0)
      }, 0)

      // Subtract user's current RSVP if updating
      const existingRSVP = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", args.eventId).eq("userId", user.userId)
        )
        .first()

      let adjustedCurrentCount = currentCount
      if (existingRSVP && existingRSVP.status === "going") {
        adjustedCurrentCount -= (1 + (existingRSVP.guestCount || 0))
      }

      if (args.status === "going" && (adjustedCurrentCount + totalGuestCount) > event.capacity) {
        throw new Error("Event is at capacity")
      }
    }

    // Check if RSVP already exists
    const existingRSVP = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    if (existingRSVP) {
      // Update existing RSVP
      await ctx.db.patch(existingRSVP._id, {
        status: args.status,
        guestCount: args.guestCount,
        dietaryRestrictions: args.dietaryRestrictions,
        notes: args.notes,
        rsvpAt: Date.now(),
      })
    } else {
      // Create new RSVP
      await ctx.db.insert("eventRSVPs", {
        eventId: args.eventId,
        userId: user.userId as any,
        status: args.status,
        guestCount: args.guestCount,
        dietaryRestrictions: args.dietaryRestrictions,
        notes: args.notes,
        rsvpAt: Date.now(),
      })
    }

    // Update attendee status
    const existingAttendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    if (args.status === "going") {
      if (!existingAttendee) {
        // Add to attendees if going and not already there
        await ctx.db.insert("eventAttendees", {
          eventId: args.eventId,
          userId: user.userId as any,
          attendeeType: event.createdById === user.userId ? "creator" : "registered",
          registeredAt: Date.now(),
        })
      }
    } else {
      // Remove from attendees if not going (unless they're the creator)
      if (existingAttendee && existingAttendee.attendeeType !== "creator") {
        await ctx.db.delete(existingAttendee._id)
      }
    }

    return { success: true }
  },
})

// Get user's RSVP for an event
export const getUserRSVP = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null
    }

    const rsvp = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    return rsvp
  },
})

// Get all RSVPs for an event (for organizers)
export const getEventRSVPs = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going"))),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to view RSVPs
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to view RSVPs for this event")
    }

    let rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Filter by status if provided
    if (args.status) {
      rsvps = rsvps.filter(rsvp => rsvp.status === args.status)
    }

    // Enrich with user info
    const enrichedRSVPs = await Promise.all(
      rsvps.map(async (rsvp) => {
        const rsvpUser = await ctx.db.get(rsvp.userId)

        return {
          ...rsvp,
          user: rsvpUser ? {
            _id: rsvpUser._id,
            name: rsvpUser.name,
            username: rsvpUser.username,
            image: rsvpUser.image,
          } : null,
        }
      })
    )

    return enrichedRSVPs.sort((a, b) => b.rsvpAt - a.rsvpAt)
  },
})

// Get RSVP summary for an event
export const getEventRSVPSummary = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    const summary = {
      going: 0,
      maybe: 0,
      not_going: 0,
      totalGuests: 0,
    }

    rsvps.forEach((rsvp) => {
      summary[rsvp.status] += 1
      if (rsvp.status === "going") {
        summary.totalGuests += 1 + (rsvp.guestCount || 0)
      }
    })

    return summary
  },
})

// Get public attendees for an event (for displaying on event page)
export const getEventAttendees = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // This is a public query - no auth required to see who's attending
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_status", (q) => 
        q.eq("eventId", args.eventId).eq("status", "going")
      )
      .collect()

    // Enrich with basic user info (public profile data only)
    const enrichedRSVPs = await Promise.all(
      rsvps.map(async (rsvp) => {
        const rsvpUser = await ctx.db.get(rsvp.userId)

        return {
          _id: rsvp._id,
          rsvpAt: rsvp.rsvpAt,
          user: rsvpUser ? {
            _id: rsvpUser._id,
            name: rsvpUser.name,
            username: rsvpUser.username,
            rllyId: rsvpUser.rllyId,
            image: rsvpUser.image,
          } : null,
        }
      })
    )

    return enrichedRSVPs
      .filter(rsvp => rsvp.user !== null)
      .sort((a, b) => a.rsvpAt - b.rsvpAt) // Sort by RSVP time
  },
})

// Remove RSVP
export const removeRSVP = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rsvp = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    if (!rsvp) {
      throw new Error("No RSVP found to remove")
    }

    // Delete the RSVP
    await ctx.db.delete(rsvp._id)

    // Remove from attendees if they were going (unless they're the creator)
    if (rsvp.status === "going") {
      const attendee = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", args.eventId).eq("userId", user.userId)
        )
        .first()

      if (attendee && attendee.attendeeType !== "creator") {
        await ctx.db.delete(attendee._id)
      }
    }

    return { success: true }
  },
})