import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    instagram: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if username is already taken (if provided and different from current)
    if (args.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first()
      
      if (existingUser && existingUser._id !== user.userId) {
        throw new Error("Username already taken")
      }
    }

    await ctx.db.patch(user.userId as any, {
      name: args.name,
      username: args.username,
      bio: args.bio,
      website: args.website,
      twitter: args.twitter,
      instagram: args.instagram,
    })

    return { success: true }
  },
})

export const getNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .collect()

    // Convert to a map for easy lookup
    const preferencesMap: Record<string, "email" | "off"> = {}
    preferences.forEach(pref => {
      preferencesMap[pref.category] = pref.channel
    })

    return preferencesMap
  },
})

export const initializeNotificationPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user already has any preferences
    const existingPreferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .collect()

    // If no preferences exist, create default ones
    if (existingPreferences.length === 0) {
      const defaultNotificationCategories = [
        "event_invitations",
        "event_reminders", 
        "event_blasts",
        "event_updates",
        "feedback_requests",
        "guest_registrations",
        "feedback_responses",
        "new_members",
        "event_submissions",
        "product_updates"
      ]
      
      // Insert all default notification preferences
      for (const category of defaultNotificationCategories) {
        await ctx.db.insert("notificationPreferences", {
          userId: user.userId as any,
          category,
          channel: "email",
        })
      }
    }

    return { success: true }
  },
})

export const updateNotificationPreference = mutation({
  args: {
    category: v.string(),
    channel: v.union(v.literal("email"), v.literal("off")),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if preference already exists
    const existingPreference = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user.userId).eq("category", args.category)
      )
      .first()

    if (existingPreference) {
      // Update existing preference
      await ctx.db.patch(existingPreference._id, {
        channel: args.channel,
      })
    } else {
      // Create new preference
      await ctx.db.insert("notificationPreferences", {
        userId: user.userId as any,
        category: args.category,
        channel: args.channel,
      })
    }

    return { success: true }
  },
})