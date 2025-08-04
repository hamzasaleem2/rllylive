import { v } from "convex/values"
import { mutation, action, internalQuery } from "./_generated/server"
import { api, internal } from "./_generated/api"

// Schedule "event goes live" notifications when event is created
export const scheduleEventGoesLiveNotifications = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Get all attendees for this event
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Schedule "goes live" notification for event start time
    const eventStartTime = event.startTime
    const now = Date.now()
    
    // Only schedule if event is in the future
    if (eventStartTime > now) {
      await ctx.scheduler.runAt(eventStartTime, api.eventScheduler.sendEventGoesLiveNotifications, {
        eventId: args.eventId
      })
    }

    return { scheduled: attendees.length, eventStartTime }
  },
})

// Send "event goes live" notifications (runs at event start time)
export const sendEventGoesLiveNotifications = action({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.runQuery(internal.eventScheduler.getEventWithAttendees, {
      eventId: args.eventId
    })

    if (!event) {
      console.log("Event not found for goes-live notification")
      return
    }

    // Send notification to all attendees
    for (const attendee of event.attendees) {
      const user = await ctx.runQuery(internal.eventScheduler.getUser, {
        userId: attendee.userId
      })
      
      if (user?.email) {
        await ctx.runMutation(api.emailEngine.triggerEmailEvent, {
          eventType: "event_goes_live",
          userId: attendee.userId,
          data: {
            userName: user.name || user.username || "User",
            eventName: event.name,
            eventDate: event.startTime,
            eventLocation: event.location,
            eventUrl: `https://app.rlly.live/event/${args.eventId}`,
            isVirtual: event.isVirtual,
            virtualLink: event.virtualLink,
            email: user.email,
          }
        })
      }
    }

    console.log(`Sent ${event.attendees.length} "event goes live" notifications for: ${event.name}`)
  },
})

// Helper queries for the action
export const getEventWithAttendees = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) return null

    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    return { ...event, attendees }
  },
})

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})