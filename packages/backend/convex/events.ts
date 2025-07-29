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
    location: v.optional(v.string()),
    isVirtual: v.optional(v.boolean()),
    virtualLink: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    theme: v.optional(v.string()),
    // Ticket options
    ticketsEnabled: v.optional(v.boolean()),
    ticketPrice: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
    // Event options
    requiresApproval: v.optional(v.boolean()),
    capacity: v.optional(v.number()),
    isUnlimited: v.optional(v.boolean()),
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

    // Create the event
    const eventId = await ctx.db.insert("events", {
      name: args.name.trim(),
      description: args.description?.trim(),
      calendarId: args.calendarId,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location?.trim(),
      isVirtual: args.isVirtual || false,
      virtualLink: args.virtualLink?.trim(),
      imageUrl: args.imageUrl,
      theme: args.theme || "Minimal",
      ticketsEnabled: args.ticketsEnabled || false,
      ticketPrice: args.ticketPrice,
      isFree: args.isFree ?? true,
      requiresApproval: args.requiresApproval || false,
      capacity: args.capacity,
      isUnlimited: args.isUnlimited ?? true,
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