import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

// Validation helper functions
function validateName(name: string | undefined): { valid: boolean; error?: string } {
  if (!name) return { valid: true } // Name is optional
  if (name.length > 50) return { valid: false, error: "Name must be less than 50 characters" }
  if (name.trim().length === 0) return { valid: false, error: "Name cannot be empty" }
  return { valid: true }
}

function validateUsername(username: string | undefined): { valid: boolean; error?: string } {
  if (!username) return { valid: true } // Username is optional
  if (username.length < 3) return { valid: false, error: "Username must be at least 3 characters" }
  if (username.length > 20) return { valid: false, error: "Username must be less than 20 characters" }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, underscores, and hyphens" }
  }
  return { valid: true }
}

function validateBio(bio: string | undefined): { valid: boolean; error?: string } {
  if (!bio) return { valid: true } // Bio is optional
  if (bio.length > 500) return { valid: false, error: "Bio must be less than 500 characters" }
  return { valid: true }
}

function validateWebsite(website: string | undefined): { valid: boolean; error?: string } {
  if (!website) return { valid: true } // Website is optional
  if (website.length > 200) return { valid: false, error: "Website URL must be less than 200 characters" }
  // Basic URL validation
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: "Website must be a valid HTTP or HTTPS URL" }
    }
  } catch {
    return { valid: false, error: "Website must be a valid URL" }
  }
  return { valid: true }
}

function validateSocialHandle(handle: string | undefined): { valid: boolean; error?: string } {
  if (!handle) return { valid: true } // Social handles are optional
  if (handle.length > 30) return { valid: false, error: "Social handle must be less than 30 characters" }
  if (!/^[a-zA-Z0-9_.]+$/.test(handle)) {
    return { valid: false, error: "Social handle can only contain letters, numbers, dots, and underscores" }
  }
  return { valid: true }
}

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

    // Validate all fields
    const nameValidation = validateName(args.name)
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error!)
    }

    const usernameValidation = validateUsername(args.username)
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.error!)
    }

    const bioValidation = validateBio(args.bio)
    if (!bioValidation.valid) {
      throw new Error(bioValidation.error!)
    }

    const websiteValidation = validateWebsite(args.website)
    if (!websiteValidation.valid) {
      throw new Error(websiteValidation.error!)
    }

    const twitterValidation = validateSocialHandle(args.twitter)
    if (!twitterValidation.valid) {
      throw new Error(twitterValidation.error!)
    }

    const instagramValidation = validateSocialHandle(args.instagram)
    if (!instagramValidation.valid) {
      throw new Error(instagramValidation.error!)
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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    return await ctx.storage.generateUploadUrl()
  },
})

export const updateProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId)
    
    if (!fileUrl) {
      throw new Error("Failed to get file URL")
    }

    // Update the user's image field
    await ctx.db.patch(user.userId as any, {
      image: fileUrl,
    })

    return { success: true, imageUrl: fileUrl }
  },
})

export const getNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      return null // Return null instead of throwing error
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

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    // Don't check if username is empty
    if (!username.trim()) {
      return { available: false, message: "Username cannot be empty" }
    }

    // Check if username meets requirements
    if (username.length < 3) {
      return { available: false, message: "Username must be at least 3 characters" }
    }

    if (username.length > 20) {
      return { available: false, message: "Username must be less than 20 characters" }
    }

    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { available: false, message: "Username can only contain letters, numbers, underscores, and hyphens" }
    }

    // Check if username is already taken
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first()
    
    if (existingUser) {
      return { available: false, message: "Username is already taken" }
    }

    return { available: true, message: "Username is available" }
  },
})