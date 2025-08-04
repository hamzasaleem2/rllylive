import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"
import { enforceRateLimit } from "./rateLimit"
import { api } from "./_generated/api"

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

function sanitizePublicUrl(url: string): string {
  if (!url) return ''
  return url
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 50)
}

function sanitizeEmail(email: string): string {
  if (!email) return ''
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

// Create a new calendar
export const createCalendar = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    publicUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    isGlobal: v.optional(v.boolean()),
    profileImageStorageId: v.optional(v.id("_storage")), // Storage ID for profile image
    coverImageStorageId: v.optional(v.id("_storage")), // Storage ID for cover image
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    // Rate limiting
    await enforceRateLimit(ctx, user.userId, "createCalendar")

    // Sanitize and validate required fields
    const sanitizedName = sanitizeText(args.name)
    const sanitizedDescription = args.description ? sanitizeText(args.description) : undefined
    const sanitizedLocation = args.location ? sanitizeText(args.location) : undefined
    const sanitizedPublicUrl = args.publicUrl ? sanitizePublicUrl(args.publicUrl) : undefined
    
    if (!sanitizedName) {
      throw new Error("Calendar name is required")
    }

    if (sanitizedName.length > 100) {
      throw new Error("Calendar name must be less than 100 characters")
    }

    if (sanitizedDescription && sanitizedDescription.length > 500) {
      throw new Error("Description must be less than 500 characters")
    }

    // Validate public URL if provided
    if (sanitizedPublicUrl) {
      if (!/^[a-z0-9_-]+$/.test(sanitizedPublicUrl)) {
        throw new Error("Public URL can only contain lowercase letters, numbers, hyphens, and underscores")
      }

      // Check if public URL is already taken
      const existingCalendar = await ctx.db
        .query("calendars")
        .withIndex("by_public_url", (q) => q.eq("publicUrl", sanitizedPublicUrl))
        .first()

      if (existingCalendar) {
        throw new Error("This public URL is already taken")
      }
    }

    // Convert storage IDs to URLs if provided
    let profileImageUrl: string | undefined
    let coverImageUrl: string | undefined

    if (args.profileImageStorageId) {
      const url = await ctx.storage.getUrl(args.profileImageStorageId)
      if (!url) {
        throw new Error("Failed to get profile image URL")
      }
      profileImageUrl = url
    }

    if (args.coverImageStorageId) {
      const url = await ctx.storage.getUrl(args.coverImageStorageId)
      if (!url) {
        throw new Error("Failed to get cover image URL")
      }
      coverImageUrl = url
    }

    // Create the calendar with sanitized data
    const calendarId = await ctx.db.insert("calendars", {
      name: sanitizedName,
      description: sanitizedDescription,
      color: args.color,
      publicUrl: sanitizedPublicUrl,
      location: sanitizedLocation,
      isGlobal: args.isGlobal || false,
      ownerId: user.userId as any,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
    })

    return { calendarId }
  },
})

// Get user's calendars
export const getUserCalendars = query({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }

    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.userId))
      .collect()

    // Get subscriber counts for each calendar
    const calendarsWithCounts = await Promise.all(
      calendars.map(async (calendar) => {
        const subscriberCount = await ctx.db
          .query("calendarSubscriptions")
          .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
          .collect()
          .then((subs) => subs.length)

        return {
          ...calendar,
          subscriberCount,
        }
      })
    )

    return calendarsWithCounts
  },
})

// Get calendar by ID
export const getCalendar = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      return null
    }

    // Get subscriber count
    const subscriberCount = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
      .collect()
      .then((subs) => subs.length)

    // Get owner info
    const owner = await ctx.db.get(calendar.ownerId)

    return {
      ...calendar,
      subscriberCount,
      owner: owner ? {
        _id: owner._id,
        name: owner.name,
        username: owner.username,
        image: owner.image,
      } : null,
    }
  },
})

// Update calendar
export const updateCalendar = mutation({
  args: {
    calendarId: v.id("calendars"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    publicUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    isGlobal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    const calendar = await ctx.db.get(args.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only edit your own calendars")
    }

    // Sanitize and validate fields
    const sanitizedName = args.name !== undefined ? sanitizeText(args.name) : undefined
    const sanitizedDescription = args.description !== undefined ? sanitizeText(args.description) : undefined
    const sanitizedLocation = args.location !== undefined ? sanitizeText(args.location) : undefined
    const sanitizedPublicUrl = args.publicUrl !== undefined ? sanitizePublicUrl(args.publicUrl) : undefined
    
    if (sanitizedName !== undefined) {
      if (!sanitizedName) {
        throw new Error("Calendar name is required")
      }
      if (sanitizedName.length > 100) {
        throw new Error("Calendar name must be less than 100 characters")
      }
    }

    if (sanitizedDescription !== undefined && sanitizedDescription.length > 500) {
      throw new Error("Description must be less than 500 characters")
    }

    // Validate public URL if provided
    if (sanitizedPublicUrl !== undefined && sanitizedPublicUrl !== calendar.publicUrl) {
      if (sanitizedPublicUrl && !/^[a-z0-9_-]+$/.test(sanitizedPublicUrl)) {
        throw new Error("Public URL can only contain lowercase letters, numbers, hyphens, and underscores")
      }

      if (sanitizedPublicUrl) {
        const existingCalendar = await ctx.db
          .query("calendars")
          .withIndex("by_public_url", (q) => q.eq("publicUrl", sanitizedPublicUrl))
          .first()

        if (existingCalendar && existingCalendar._id !== args.calendarId) {
          throw new Error("This public URL is already taken")
        }
      }
    }

    // Update the calendar with sanitized data
    await ctx.db.patch(args.calendarId, {
      ...(sanitizedName !== undefined && { name: sanitizedName }),
      ...(sanitizedDescription !== undefined && { description: sanitizedDescription }),
      ...(args.color !== undefined && { color: args.color }),
      ...(sanitizedPublicUrl !== undefined && { publicUrl: sanitizedPublicUrl }),
      ...(sanitizedLocation !== undefined && { location: sanitizedLocation }),
      ...(args.isGlobal !== undefined && { isGlobal: args.isGlobal }),
    })

    return { success: true }
  },
})

// Delete calendar
export const deleteCalendar = mutation({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only delete your own calendars")
    }

    // CRITICAL: Complete cascading delete implementation
    // First, get all events for this calendar
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    // For each event, delete ALL related data
    for (const event of events) {
      // 1. Delete all RSVPs for this event
      const eventRSVPs = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect()
      
      for (const rsvp of eventRSVPs) {
        await ctx.db.delete(rsvp._id)
      }

      // 2. Delete all invitations for this event
      const eventInvitations = await ctx.db
        .query("eventInvitations")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect()
      
      for (const invitation of eventInvitations) {
        await ctx.db.delete(invitation._id)
      }

      // 3. Delete all attendees for this event
      const eventAttendees = await ctx.db
        .query("eventAttendees")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect()
      
      for (const attendee of eventAttendees) {
        await ctx.db.delete(attendee._id)
      }

      // 4. Delete all reports for this event
      const eventReports = await ctx.db
        .query("eventReports")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect()
      
      for (const report of eventReports) {
        await ctx.db.delete(report._id)
      }
    }

    // Delete all events for this calendar
    for (const event of events) {
      await ctx.db.delete(event._id)
    }

    // Delete all calendar subscriptions
    const subscriptions = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id)
    }

    // Finally, delete the calendar itself
    await ctx.db.delete(calendarId)

    return { success: true }
  },
})

// Subscribe to calendar
export const subscribeToCalendar = mutation({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    // Check if calendar exists
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Check if already subscribed
    const existingSubscription = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar_user", (q) => 
        q.eq("calendarId", calendarId).eq("userId", user.userId)
      )
      .first()

    if (existingSubscription) {
      throw new Error("Already subscribed to this calendar")
    }

    // Create subscription
    await ctx.db.insert("calendarSubscriptions", {
      calendarId,
      userId: user.userId as any,
    })

    return { success: true }
  },
})

// Unsubscribe from calendar
export const unsubscribeFromCalendar = mutation({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar_user", (q) => 
        q.eq("calendarId", calendarId).eq("userId", user.userId)
      )
      .first()

    if (!subscription) {
      throw new Error("Not subscribed to this calendar")
    }

    await ctx.db.delete(subscription._id)

    return { success: true }
  },
})

// Check if public URL is available
export const checkPublicUrlAvailability = query({
  args: { publicUrl: v.string() },
  handler: async (ctx, { publicUrl }) => {
    if (!publicUrl.trim()) {
      return { available: false, message: "Public URL cannot be empty" }
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(publicUrl)) {
      return { 
        available: false, 
        message: "Public URL can only contain letters, numbers, hyphens, and underscores" 
      }
    }

    const existingCalendar = await ctx.db
      .query("calendars")
      .withIndex("by_public_url", (q) => q.eq("publicUrl", publicUrl))
      .first()

    if (existingCalendar) {
      return { available: false, message: "This public URL is already taken" }
    }

    return { available: true, message: "Public URL is available" }
  },
})

// Add calendar member
export const addCalendarMember = mutation({
  args: { 
    calendarId: v.id("calendars"),
    email: v.string()
  },
  handler: async (ctx, { calendarId, email }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user owns the calendar
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only add members to your own calendars")
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email)
    if (!sanitizedEmail) {
      throw new Error("Please enter a valid email address")
    }

    // Find user by email
    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), sanitizedEmail))
      .first()

    if (targetUser) {
      // User exists - check if already subscribed
      const existingSubscription = await ctx.db
        .query("calendarSubscriptions")
        .withIndex("by_calendar_user", (q) => 
          q.eq("calendarId", calendarId).eq("userId", targetUser._id)
        )
        .first()

      if (existingSubscription) {
        throw new Error("This user is already a member of this calendar")
      }
      
      // Don't allow adding the calendar owner as a member
      if (targetUser._id === calendar.ownerId) {
        throw new Error("You cannot add yourself as a member")
      }
      
      // Add existing user directly to calendar
      await ctx.db.insert("calendarSubscriptions", {
        calendarId,
        userId: targetUser._id,
      })
      
      return { success: true, type: "existing_user", userId: targetUser._id }
    } else {
      // User doesn't exist - create pending invitation
      
      // Check if there's already a pending invitation
      const existingInvitation = await ctx.db
        .query("calendarInvitations")
        .withIndex("by_calendar_email", (q) => 
          q.eq("calendarId", calendarId).eq("email", sanitizedEmail)
        )
        .first()

      if (existingInvitation) {
        throw new Error("An invitation has already been sent to this email address")
      }
      
      // Create pending invitation
      const invitationId = await ctx.db.insert("calendarInvitations", {
        calendarId,
        email: sanitizedEmail,
        invitedBy: user.userId as any,
        status: "pending",
        invitedAt: Date.now(),
      })
      
      // Send invitation email (using inviter's userId for notification preferences)
      await ctx.runMutation(api.emailEngine.triggerEmailEvent, {
        eventType: "calendar_invitation",
        userId: user.userId, // Use inviter's ID for notification preferences
        data: {
          email: sanitizedEmail,
          calendarName: calendar.name,
          inviterName: user.name || user.username || "Someone",
          joinUrl: `https://rlly.live/join/calendar/${invitationId}`,
        }
      })
      
      return { success: true, type: "invitation_sent", invitationId }
    }
  },
})

// Accept calendar invitation after user signs up
export const acceptPendingCalendarInvitations = mutation({
  args: { 
    email: v.string() 
  },
  handler: async (ctx, { email }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Find all pending invitations for this email
    const pendingInvitations = await ctx.db
      .query("calendarInvitations")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    const results = []

    for (const invitation of pendingInvitations) {
      try {
        // Check if user is already subscribed to this calendar
        const existingSubscription = await ctx.db
          .query("calendarSubscriptions")
          .withIndex("by_calendar_user", (q) => 
            q.eq("calendarId", invitation.calendarId).eq("userId", user.userId)
          )
          .first()

        if (!existingSubscription) {
          // Add user to calendar
          await ctx.db.insert("calendarSubscriptions", {
            calendarId: invitation.calendarId,
            userId: user.userId as any,
          })
        }

        // Mark invitation as accepted
        await ctx.db.patch(invitation._id, {
          status: "accepted",
          acceptedAt: Date.now(),
        })

        results.push({
          calendarId: invitation.calendarId,
          success: true
        })
      } catch (error) {
        console.error("Error accepting calendar invitation:", error)
        results.push({
          calendarId: invitation.calendarId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    return { 
      processedInvitations: results.length,
      results 
    }
  },
})

// Remove calendar member
export const removeCalendarMember = mutation({
  args: { 
    calendarId: v.id("calendars"),
    userId: v.id("users")
  },
  handler: async (ctx, { calendarId, userId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user owns the calendar
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only remove members from your own calendars")
    }

    // Don't allow removing the calendar owner
    if (userId === calendar.ownerId) {
      throw new Error("Cannot remove the calendar owner")
    }

    // Find the subscription
    const subscription = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar_user", (q) => 
        q.eq("calendarId", calendarId).eq("userId", userId)
      )
      .first()

    if (!subscription) {
      throw new Error("User is not a member of this calendar")
    }

    // Remove the subscription
    await ctx.db.delete(subscription._id)

    // Get user info for response message
    const targetUser = await ctx.db.get(userId)
    const userName = targetUser?.name || targetUser?.username || 'User'

    return { 
      success: true, 
      message: `${userName} has been removed from the calendar`
    }
  },
})

// Get calendar events
export const getCalendarEvents = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    // Check if calendar exists
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Check access: owner, subscriber, or global calendar
    const isOwner = calendar.ownerId === user.userId
    const isGlobal = calendar.isGlobal
    
    let isSubscriber = false
    if (!isOwner && !isGlobal) {
      const subscription = await ctx.db
        .query("calendarSubscriptions")
        .withIndex("by_calendar_user", (q) => 
          q.eq("calendarId", calendarId).eq("userId", user.userId)
        )
        .first()
      isSubscriber = !!subscription
    }

    if (!isOwner && !isGlobal && !isSubscriber) {
      throw new Error("You don't have access to this calendar")
    }

    // Get all events for this calendar
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .order("desc")
      .collect()

    // Get RSVP counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const rsvps = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect()

        const goingCount = rsvps.filter(rsvp => rsvp.status === "going").length
        const maybeCount = rsvps.filter(rsvp => rsvp.status === "maybe").length
        const notGoingCount = rsvps.filter(rsvp => rsvp.status === "not_going").length

        return {
          ...event,
          rsvpCounts: {
            going: goingCount,
            maybe: maybeCount,
            not_going: notGoingCount,
            total: rsvps.length
          }
        }
      })
    )

    return eventsWithCounts
  },
})

// Get calendar participants (people who have interacted with any event in this calendar)
export const getCalendarParticipants = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    // Check if calendar exists
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Only owners can view participants (privacy sensitive)
    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only view participants from your own calendars")
    }

    // Get all events for this calendar
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    const eventIds = events.map(e => e._id)

    // Get all RSVPs for events in this calendar
    const allRSVPs = await Promise.all(
      eventIds.map(eventId => 
        ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect()
      )
    )

    // Flatten and deduplicate users
    const userIds = new Set<string>()
    allRSVPs.flat().forEach(rsvp => {
      userIds.add(rsvp.userId as string)
    })

    // Get user details
    const participants = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        // Explicitly query from users table
        const userDoc = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), userId as any))
          .first()
        
        if (!userDoc) return null

        // Count their interactions across all events in this calendar
        const userRSVPs = allRSVPs.flat().filter(rsvp => rsvp.userId === userId)
        const eventCounts = {
          going: userRSVPs.filter(rsvp => rsvp.status === "going").length,
          maybe: userRSVPs.filter(rsvp => rsvp.status === "maybe").length,
          not_going: userRSVPs.filter(rsvp => rsvp.status === "not_going").length,
          total: userRSVPs.length
        }

        // Get their most recent RSVP
        const mostRecentRSVP = userRSVPs.sort((a, b) => b.rsvpAt - a.rsvpAt)[0]

        return {
          _id: userDoc._id,
          name: userDoc.name || null,
          username: userDoc.username || null,
          rllyId: userDoc.rllyId || null,
          image: userDoc.image || null,
          email: userDoc.email || null,
          eventCounts,
          lastActivity: mostRecentRSVP?.rsvpAt || 0,
          lastStatus: mostRecentRSVP?.status || "not_going"
        }
      })
    )

    // Filter out null values and sort by last activity
    return participants
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.lastActivity - a.lastActivity)
  },
})

// Get calendar statistics
export const getCalendarStats = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null;
    }

    // Check if calendar exists
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Check access: owner, subscriber, or global calendar
    const isOwner = calendar.ownerId === user.userId
    const isGlobal = calendar.isGlobal
    
    let isSubscriber = false
    if (!isOwner && !isGlobal) {
      const subscription = await ctx.db
        .query("calendarSubscriptions")
        .withIndex("by_calendar_user", (q) => 
          q.eq("calendarId", calendarId).eq("userId", user.userId)
        )
        .first()
      isSubscriber = !!subscription
    }

    if (!isOwner && !isGlobal && !isSubscriber) {
      throw new Error("You don't have access to this calendar")
    }

    // Get all events
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    const now = Date.now()
    const upcomingEvents = events.filter(e => e.startTime > now)
    const pastEvents = events.filter(e => e.endTime < now)
    const liveEvents = events.filter(e => e.startTime <= now && e.endTime >= now)

    // Get subscriber count
    const subscriberCount = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()
      .then(subs => subs.length)

    // Get total RSVPs across all events
    const allRSVPs = await Promise.all(
      events.map(event => 
        ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect()
      )
    )

    const totalRSVPs = allRSVPs.flat().length
    const totalGoing = allRSVPs.flat().filter(rsvp => rsvp.status === "going").length

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      liveEvents: liveEvents.length,
      totalSubscribers: subscriberCount,
      totalRSVPs,
      totalGoing,
      uniqueParticipants: new Set(allRSVPs.flat().map(rsvp => rsvp.userId)).size
    }
  },
})

// Get public calendar by ID (no authentication required)
export const getPublicCalendar = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      return { status: "not_found", calendar: null }
    }

    // Return status if calendar exists but is not public
    if (!calendar.isGlobal) {
      return { 
        status: "private", 
        calendar: {
          _id: calendar._id,
          name: calendar.name,
          description: calendar.description,
        }
      }
    }

    // Get subscriber count
    const subscriberCount = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
      .collect()
      .then((subs) => subs.length)

    // Get owner info
    const owner = await ctx.db.get(calendar.ownerId)

    return {
      status: "public",
      calendar: {
        ...calendar,
        subscriberCount,
        owner: owner ? {
          _id: owner._id,
          name: owner.name,
          username: owner.username,
          image: owner.image,
        } : null,
      }
    }
  },
})

// Get public calendar by public URL (no authentication required)
export const getPublicCalendarByUrl = query({
  args: { publicUrl: v.string() },
  handler: async (ctx, { publicUrl }) => {
    const calendar = await ctx.db
      .query("calendars")
      .withIndex("by_public_url", (q) => q.eq("publicUrl", publicUrl))
      .first()

    if (!calendar) {
      return { status: "not_found", calendar: null }
    }

    // Return status if calendar exists but is not public
    if (!calendar.isGlobal) {
      return { 
        status: "private", 
        calendar: {
          _id: calendar._id,
          name: calendar.name,
          description: calendar.description,
        }
      }
    }

    // Get subscriber count
    const subscriberCount = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
      .collect()
      .then((subs) => subs.length)

    // Get owner info
    const owner = await ctx.db.get(calendar.ownerId)

    return {
      status: "public",
      calendar: {
        ...calendar,
        subscriberCount,
        owner: owner ? {
          _id: owner._id,
          name: owner.name,
          username: owner.username,
          image: owner.image,
        } : null,
      }
    }
  },
})

// Get public calendar events (no authentication required)
export const getPublicCalendarEvents = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    // Check if calendar exists and is public
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Only allow access to global calendars
    if (!calendar.isGlobal) {
      throw new Error("This calendar is not public")
    }

    // Get all events for this calendar
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .order("desc")
      .collect()

    // Get RSVP counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const rsvps = await ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect()

        const goingCount = rsvps.filter(rsvp => rsvp.status === "going").length
        const maybeCount = rsvps.filter(rsvp => rsvp.status === "maybe").length
        const notGoingCount = rsvps.filter(rsvp => rsvp.status === "not_going").length

        return {
          ...event,
          rsvpCounts: {
            going: goingCount,
            maybe: maybeCount,
            not_going: notGoingCount,
            total: rsvps.length
          }
        }
      })
    )

    return eventsWithCounts
  },
})

// Get public calendar stats (no authentication required)
export const getPublicCalendarStats = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, { calendarId }) => {
    // Check if calendar exists and is public
    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Only allow access to global calendars
    if (!calendar.isGlobal) {
      throw new Error("This calendar is not public")
    }

    // Get all events
    const events = await ctx.db
      .query("events")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    const now = Date.now()
    const upcomingEvents = events.filter(e => e.startTime > now)
    const pastEvents = events.filter(e => e.endTime < now)
    const liveEvents = events.filter(e => e.startTime <= now && e.endTime >= now)

    // Get subscriber count
    const subscriberCount = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()
      .then(subs => subs.length)

    // Get total RSVPs across all events
    const allRSVPs = await Promise.all(
      events.map(event => 
        ctx.db
          .query("eventRSVPs")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect()
      )
    )

    const totalRSVPs = allRSVPs.flat().length
    const totalGoing = allRSVPs.flat().filter(rsvp => rsvp.status === "going").length

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      liveEvents: liveEvents.length,
      totalSubscribers: subscriberCount,
      totalRSVPs,
      totalGoing,
      uniqueParticipants: new Set(allRSVPs.flat().map(rsvp => rsvp.userId)).size
    }
  },
})