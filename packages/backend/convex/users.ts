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