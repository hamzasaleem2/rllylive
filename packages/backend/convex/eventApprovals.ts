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

// Request approval to join an event that requires approval
export const requestEventApproval = mutation({
  args: {
    eventId: v.id("events"),
    message: v.optional(v.string()),
    guestCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Rate limiting
    await enforceRateLimit(ctx, user.userId, "sendInvitation", args.eventId)

    // Get the event
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if event requires approval
    if (!event.requiresApproval) {
      throw new Error("This event does not require approval")
    }

    // Check if user already has a pending or approved request
    const existingRequest = await ctx.db
      .query("eventApprovalRequests")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        throw new Error("You already have a pending approval request for this event")
      }
      if (existingRequest.status === "approved") {
        throw new Error("You are already approved for this event")
      }
      // If rejected, allow a new request (user can try again)
    }

    // Check capacity if limited
    if (event.hasCapacityLimit && event.capacity) {
      // Count approved requests and current attendees
      const approvedRequests = await ctx.db
        .query("eventApprovalRequests")
        .withIndex("by_event_status", (q) => 
          q.eq("eventId", args.eventId).eq("status", "approved")
        )
        .collect()

      const currentAttendees = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect()

      const totalApproved = approvedRequests.length + currentAttendees.length
      const requestedGuests = (args.guestCount || 0) + 1 // +1 for the requester

      if (totalApproved + requestedGuests > event.capacity) {
        if (!event.waitingList) {
          throw new Error("Event is at capacity and does not have a waiting list")
        }
        // If waiting list is enabled, we'll allow the request but note it's waitlisted
      }
    }

    // Sanitize message
    const sanitizedMessage = args.message ? sanitizeText(args.message) : undefined

    // Create or update the approval request
    if (existingRequest && existingRequest.status === "rejected") {
      // Update existing rejected request
      await ctx.db.patch(existingRequest._id, {
        status: "pending",
        requestedAt: Date.now(),
        reviewedAt: undefined,
        reviewedBy: undefined,
        message: sanitizedMessage,
        reviewNotes: undefined,
        guestCount: args.guestCount || 0,
      })
    } else {
      // Create new request
      await ctx.db.insert("eventApprovalRequests", {
        eventId: args.eventId,
        userId: user.userId as any,
        status: "pending",
        requestedAt: Date.now(),
        message: sanitizedMessage,
        guestCount: args.guestCount || 0,
      })
    }

    return { success: true }
  },
})

// Approve or reject an approval request (for event creators/calendar owners)
export const reviewApprovalRequest = mutation({
  args: {
    requestId: v.id("eventApprovalRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the approval request
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error("Approval request not found")
    }

    if (request.status !== "pending") {
      throw new Error("This request has already been reviewed")
    }

    // Get the event
    const event = await ctx.db.get(request.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Get the calendar
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Check permissions - only event creator or calendar owner can approve
    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to review this request")
    }

    // If approving, check capacity again
    if (args.action === "approve" && event.hasCapacityLimit && event.capacity) {
      const approvedRequests = await ctx.db
        .query("eventApprovalRequests")
        .withIndex("by_event_status", (q) => 
          q.eq("eventId", request.eventId).eq("status", "approved")
        )
        .collect()

      const currentAttendees = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event", (q) => q.eq("eventId", request.eventId))
        .collect()

      const totalApproved = approvedRequests.length + currentAttendees.length
      const requestedGuests = (request.guestCount || 0) + 1

      if (totalApproved + requestedGuests > event.capacity) {
        throw new Error("Approving this request would exceed event capacity")
      }
    }

    // Sanitize review notes
    const sanitizedNotes = args.reviewNotes ? sanitizeText(args.reviewNotes) : undefined

    // Update the request
    await ctx.db.patch(args.requestId, {
      status: args.action === "approve" ? "approved" : "rejected",
      reviewedAt: Date.now(),
      reviewedBy: user.userId as any,
      reviewNotes: sanitizedNotes,
    })

    // If approved, create an RSVP and attendee record
    if (args.action === "approve") {
      // Create RSVP
      const existingRSVP = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", request.eventId).eq("userId", request.userId)
        )
        .first()

      if (!existingRSVP) {
        await ctx.db.insert("eventRSVPs", {
          eventId: request.eventId,
          userId: request.userId,
          status: "going",
          rsvpAt: Date.now(),
          guestCount: request.guestCount || 0,
        })
      } else {
        // Update existing RSVP
        await ctx.db.patch(existingRSVP._id, {
          status: "going",
          rsvpAt: Date.now(),
          guestCount: request.guestCount || 0,
        })
      }

      // Create attendee record
      const existingAttendee = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event_user", (q) => 
          q.eq("eventId", request.eventId).eq("userId", request.userId)
        )
        .first()

      if (!existingAttendee) {
        await ctx.db.insert("eventAttendees", {
          eventId: request.eventId,
          userId: request.userId,
          attendeeType: "registered",
          registeredAt: Date.now(),
        })
      }
    }

    return { success: true }
  },
})

// Get pending approval requests for an event (for event creators/calendar owners)
export const getPendingApprovalRequests = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    // Get the event
    const event = await ctx.db.get(eventId)
    if (!event) {
      return []
    }

    // Get the calendar
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      return []
    }

    // Check permissions
    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      return []
    }

    // Get pending requests
    const requests = await ctx.db
      .query("eventApprovalRequests")
      .withIndex("by_event_status", (q) => 
        q.eq("eventId", eventId).eq("status", "pending")
      )
      .order("desc")
      .collect()

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const requestUser = await ctx.db.get(request.userId)
        return {
          ...request,
          user: requestUser ? {
            _id: requestUser._id,
            name: requestUser.name,
            username: requestUser.username,
            image: requestUser.image,
            rllyId: requestUser.rllyId,
          } : null,
        }
      })
    )

    return enrichedRequests
  },
})

// Get approval request status for a user and event
export const getApprovalRequestStatus = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null
    }

    const request = await ctx.db
      .query("eventApprovalRequests")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", eventId).eq("userId", user.userId)
      )
      .first()

    if (!request) {
      return null
    }

    // Get reviewer info if reviewed
    let reviewer = null
    if (request.reviewedBy) {
      const reviewerUser = await ctx.db.get(request.reviewedBy)
      if (reviewerUser) {
        reviewer = {
          name: reviewerUser.name,
          username: reviewerUser.username,
        }
      }
    }

    return {
      ...request,
      reviewer,
    }
  },
})

// Get all approval requests for an event with status (for analytics)
export const getEventApprovalStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null
    }

    // Get the event
    const event = await ctx.db.get(eventId)
    if (!event) {
      return null
    }

    // Get the calendar
    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      return null
    }

    // Check permissions
    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      return null
    }

    // Get all requests
    const allRequests = await ctx.db
      .query("eventApprovalRequests")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()

    const stats = {
      pending: allRequests.filter(r => r.status === "pending").length,
      approved: allRequests.filter(r => r.status === "approved").length,
      rejected: allRequests.filter(r => r.status === "rejected").length,
      total: allRequests.length,
    }

    return stats
  },
})