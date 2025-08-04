import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"
import { api } from "./_generated/api"

// Send invitation to an event
export const sendInvitation = mutation({
  args: {
    eventId: v.id("events"),
    invitedUserId: v.id("users"),
    message: v.optional(v.string()),
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

    // Check if user has permission to invite (event creator or calendar owner)
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to invite people to this event")
    }

    // Check if invitation already exists
    const existingInvitation = await ctx.db
      .query("eventInvitations")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("invitedUserId", args.invitedUserId)
      )
      .first()

    if (existingInvitation) {
      throw new Error("User has already been invited to this event")
    }

    // Check if user is already an attendee
    const existingAttendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", args.invitedUserId)
      )
      .first()

    if (existingAttendee) {
      throw new Error("User is already an attendee of this event")
    }

    // Create invitation
    const invitationId = await ctx.db.insert("eventInvitations", {
      eventId: args.eventId,
      invitedUserId: args.invitedUserId,
      invitedBy: user.userId as any,
      status: "pending",
      invitedAt: Date.now(),
      message: args.message,
    })

    // Get invited user data for email
    const invitedUser = await ctx.db.get(args.invitedUserId)
    if (invitedUser?.email) {
      // Trigger invitation email
      await ctx.runMutation(api.emailEngine.triggerEmailEvent, {
        eventType: "event_invitation",
        userId: args.invitedUserId,
        data: {
          invitedName: invitedUser.name || invitedUser.username || "User",
          inviterName: user.name || user.username || "Someone",
          eventName: event.name,
          eventDate: event.startTime,
          eventLocation: event.location,
          message: args.message,
          invitationUrl: `https://rlly.live/event/${args.eventId}`,
          email: invitedUser.email,
        }
      })
    }

    return { invitationId }
  },
})

// Respond to invitation
export const respondToInvitation = mutation({
  args: {
    invitationId: v.id("eventInvitations"),
    status: v.union(v.literal("accepted"), v.literal("declined")),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    if (invitation.invitedUserId !== user.userId) {
      throw new Error("You can only respond to your own invitations")
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation has already been responded to")
    }

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: args.status,
      respondedAt: Date.now(),
    })

    // If accepted, add to attendees
    if (args.status === "accepted") {
      await ctx.db.insert("eventAttendees", {
        eventId: invitation.eventId,
        userId: user.userId as any,
        attendeeType: "invited",
        registeredAt: Date.now(),
      })
    }

    return { success: true }
  },
})

// Get invitations for a user
export const getUserInvitations = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"))),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    let query = ctx.db
      .query("eventInvitations")
      .withIndex("by_invited_user", (q) => q.eq("invitedUserId", user.userId))

    let invitations = await query.collect()

    // Filter by status if provided
    if (args.status) {
      invitations = invitations.filter(inv => inv.status === args.status)
    }

    // Enrich with event and inviter info
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const event = await ctx.db.get(invitation.eventId)
        const inviter = await ctx.db.get(invitation.invitedBy)
        
        // Get calendar info for the event
        let calendar = null
        if (event) {
          calendar = await ctx.db.get(event.calendarId)
        }

        return {
          ...invitation,
          event: event ? {
            ...event,
            calendar: calendar ? {
              _id: calendar._id,
              name: calendar.name,
              color: calendar.color,
            } : null,
          } : null,
          inviter: inviter ? {
            _id: inviter._id,
            name: inviter.name,
            username: inviter.username,
            image: inviter.image,
          } : null,
        }
      })
    )

    return enrichedInvitations.sort((a, b) => b.invitedAt - a.invitedAt)
  },
})

// Get invitations for an event (for event organizers)
export const getEventInvitations = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"))),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to view invitations
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to view invitations for this event")
    }

    let invitations = await ctx.db
      .query("eventInvitations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Filter by status if provided
    if (args.status) {
      invitations = invitations.filter(inv => inv.status === args.status)
    }

    // Enrich with invitee and inviter info
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const invitee = await ctx.db.get(invitation.invitedUserId)
        const inviter = await ctx.db.get(invitation.invitedBy)

        return {
          ...invitation,
          invitee: invitee ? {
            _id: invitee._id,
            name: invitee.name,
            username: invitee.username,
            image: invitee.image,
          } : null,
          inviter: inviter ? {
            _id: inviter._id,
            name: inviter.name,
            username: inviter.username,
            image: inviter.image,
          } : null,
        }
      })
    )

    return enrichedInvitations.sort((a, b) => b.invitedAt - a.invitedAt)
  },
})

// Cancel invitation (for event organizers)
export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("eventInvitations"),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    // Check if user has permission to cancel invitation
    const event = await ctx.db.get(invitation.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to cancel this invitation")
    }

    // Delete the invitation
    await ctx.db.delete(args.invitationId)

    // If user had accepted, remove from attendees
    if (invitation.status === "accepted") {
      const attendee = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", invitation.eventId).eq("userId", invitation.invitedUserId)
        )
        .first()

      if (attendee && attendee.attendeeType === "invited") {
        await ctx.db.delete(attendee._id)
      }
    }

    return { success: true }
  },
})