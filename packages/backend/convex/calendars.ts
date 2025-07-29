import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

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
      throw new Error("Unauthorized")
    }

    // Validate required fields
    if (!args.name.trim()) {
      throw new Error("Calendar name is required")
    }

    if (args.name.length > 100) {
      throw new Error("Calendar name must be less than 100 characters")
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description must be less than 500 characters")
    }

    // Validate public URL if provided
    if (args.publicUrl) {
      if (!/^[a-zA-Z0-9-_]+$/.test(args.publicUrl)) {
        throw new Error("Public URL can only contain letters, numbers, hyphens, and underscores")
      }

      // Check if public URL is already taken
      const existingCalendar = await ctx.db
        .query("calendars")
        .withIndex("by_public_url", (q) => q.eq("publicUrl", args.publicUrl))
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

    // Create the calendar
    const calendarId = await ctx.db.insert("calendars", {
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color,
      publicUrl: args.publicUrl?.trim(),
      location: args.location?.trim(),
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
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
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
      throw new Error("Unauthorized")
    }

    const calendar = await ctx.db.get(args.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only edit your own calendars")
    }

    // Validate fields
    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Calendar name is required")
      }
      if (args.name.length > 100) {
        throw new Error("Calendar name must be less than 100 characters")
      }
    }

    if (args.description !== undefined && args.description.length > 500) {
      throw new Error("Description must be less than 500 characters")
    }

    // Validate public URL if provided
    if (args.publicUrl !== undefined && args.publicUrl !== calendar.publicUrl) {
      if (args.publicUrl && !/^[a-zA-Z0-9-_]+$/.test(args.publicUrl)) {
        throw new Error("Public URL can only contain letters, numbers, hyphens, and underscores")
      }

      if (args.publicUrl) {
        const existingCalendar = await ctx.db
          .query("calendars")
          .withIndex("by_public_url", (q) => q.eq("publicUrl", args.publicUrl))
          .first()

        if (existingCalendar && existingCalendar._id !== args.calendarId) {
          throw new Error("This public URL is already taken")
        }
      }
    }

    // Update the calendar
    await ctx.db.patch(args.calendarId, {
      ...(args.name !== undefined && { name: args.name.trim() }),
      ...(args.description !== undefined && { description: args.description?.trim() }),
      ...(args.color !== undefined && { color: args.color }),
      ...(args.publicUrl !== undefined && { publicUrl: args.publicUrl?.trim() }),
      ...(args.location !== undefined && { location: args.location?.trim() }),
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
      throw new Error("Unauthorized")
    }

    const calendar = await ctx.db.get(calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    if (calendar.ownerId !== user.userId) {
      throw new Error("You can only delete your own calendars")
    }

    // Delete all subscriptions first
    const subscriptions = await ctx.db
      .query("calendarSubscriptions")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendarId))
      .collect()

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id)
    }

    // Delete the calendar
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
      throw new Error("Unauthorized")
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
      throw new Error("Unauthorized")
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