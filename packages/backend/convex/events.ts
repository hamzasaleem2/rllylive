import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

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

    // Validate required fields
    if (!args.name.trim()) {
      throw new Error("Event name is required")
    }

    if (args.name.length > 200) {
      throw new Error("Event name must be less than 200 characters")
    }

    if (args.description && args.description.length > 1000) {
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

    // Create the event
    const eventId = await ctx.db.insert("events", {
      name: args.name.trim(),
      description: args.description?.trim(),
      calendarId: args.calendarId,
      startTime: args.startTime,
      endTime: args.endTime,
      timezone: args.timezone,
      location: args.location?.trim(),
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      theme: "Minimal", // Default theme
      ticketType: args.ticketType,
      ticketPrice: args.ticketType === "paid" ? args.ticketPrice : undefined,
      ticketName: args.ticketName?.trim(),
      ticketDescription: args.ticketDescription?.trim(),
      requiresApproval: args.requiresApproval || false,
      hasCapacityLimit: args.hasCapacityLimit || false,
      capacity: args.hasCapacityLimit ? args.capacity : undefined,
      waitingList: args.hasCapacityLimit ? (args.waitingList || false) : false,
      isPublic: args.isPublic ?? true,
      createdById: user.userId as any,
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

// Get event by ID
export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) {
      return null
    }

    // Get calendar info
    const calendar = await ctx.db.get(event.calendarId)
    
    return {
      ...event,
      calendar: calendar ? {
        _id: calendar._id,
        name: calendar.name,
        color: calendar.color,
      } : null,
    }
  },
})