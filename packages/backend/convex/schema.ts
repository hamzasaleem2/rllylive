import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.optional(v.string()),
    rllyId: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    instagram: v.optional(v.string()),
  })
  .index("by_username", ["username"])
  .index("by_rllyId", ["rllyId"]),

  calendars: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(), // Hex color code
    publicUrl: v.optional(v.string()), // Custom URL slug
    location: v.optional(v.string()),
    isGlobal: v.optional(v.boolean()), // true for global, false for city-specific
    ownerId: v.id("users"),
    coverImage: v.optional(v.string()), // Storage ID for cover image
  })
  .index("by_owner", ["ownerId"])
  .index("by_public_url", ["publicUrl"]),

  calendarSubscriptions: defineTable({
    calendarId: v.id("calendars"),
    userId: v.id("users"),
  })
  .index("by_calendar", ["calendarId"])
  .index("by_user", ["userId"])
  .index("by_calendar_user", ["calendarId", "userId"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    category: v.string(),
    channel: v.union(v.literal("email"), v.literal("off")),
  })
  .index("by_user", ["userId"])
  .index("by_user_category", ["userId", "category"]),
});