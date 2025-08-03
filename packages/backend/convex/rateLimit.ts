/**
 * Rate limiting functionality to prevent abuse
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Rate limit configurations
const RATE_LIMITS = {
  // Calendar operations
  createCalendar: { requests: 5, windowMs: 60000 }, // 5 calendars per minute
  updateCalendar: { requests: 10, windowMs: 60000 }, // 10 updates per minute
  deleteCalendar: { requests: 3, windowMs: 60000 }, // 3 deletes per minute
  
  // Event operations
  createEvent: { requests: 10, windowMs: 60000 }, // 10 events per minute
  updateEvent: { requests: 20, windowMs: 60000 }, // 20 updates per minute
  deleteEvent: { requests: 5, windowMs: 60000 }, // 5 deletes per minute
  
  // User operations
  updateProfile: { requests: 5, windowMs: 60000 }, // 5 profile updates per minute
  
  // Social operations
  sendMessage: { requests: 30, windowMs: 60000 }, // 30 messages per minute
  sendInvitation: { requests: 20, windowMs: 60000 }, // 20 invitations per minute
  reportContent: { requests: 5, windowMs: 300000 }, // 5 reports per 5 minutes
  
  // Authentication-related
  sendEmail: { requests: 3, windowMs: 300000 }, // 3 emails per 5 minutes
  
  // General API calls
  default: { requests: 100, windowMs: 60000 }, // 100 requests per minute
}

/**
 * Check if a user has exceeded rate limits for a specific action
 */
export async function checkRateLimit(
  ctx: any,
  userId: string,
  action: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<{ allowed: boolean; resetTime?: number }> {
  const config = RATE_LIMITS[action] || RATE_LIMITS.default
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Create a unique key for this user/action combination
  const key = identifier ? `${userId}:${action}:${identifier}` : `${userId}:${action}`
  
  // Get recent requests for this user/action
  const recentRequests = await ctx.db
    .query("rateLimitTracking")
    .withIndex("by_key_timestamp", (q: any) => 
      q.eq("key", key).gte("timestamp", windowStart)
    )
    .collect()
  
  // Clean up old entries (optional optimization)
  const oldRequests = await ctx.db
    .query("rateLimitTracking")
    .withIndex("by_key_timestamp", (q: any) => 
      q.eq("key", key).lt("timestamp", windowStart)
    )
    .collect()
  
  for (const oldRequest of oldRequests) {
    await ctx.db.delete(oldRequest._id)
  }
  
  // Check if limit exceeded
  if (recentRequests.length >= config.requests) {
    const oldestRequest = recentRequests.sort((a: any, b: any) => a.timestamp - b.timestamp)[0]
    const resetTime = oldestRequest.timestamp + config.windowMs
    
    return {
      allowed: false,
      resetTime
    }
  }
  
  // Record this request
  await ctx.db.insert("rateLimitTracking", {
    key,
    userId,
    action,
    timestamp: now,
    ip: ctx.ip || "unknown", // Store IP if available
  })
  
  return { allowed: true }
}

/**
 * Helper function to enforce rate limits in mutations
 */
export async function enforceRateLimit(
  ctx: any,
  userId: string,
  action: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<void> {
  const result = await checkRateLimit(ctx, userId, action, identifier)
  
  if (!result.allowed) {
    const resetTime = result.resetTime || Date.now() + RATE_LIMITS[action].windowMs
    const waitMinutes = Math.ceil((resetTime - Date.now()) / 60000)
    
    throw new Error(
      `Rate limit exceeded for ${action}. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`
    )
  }
}

/**
 * Get rate limit status for a user/action (for frontend display)
 */
export const getRateLimitStatus = query({
  args: { 
    action: v.string(),
    identifier: v.optional(v.string())
  },
  handler: async (ctx, { action, identifier }) => {
    // This would require authentication context
    // Implementation depends on your auth setup
    return {
      remaining: 0,
      resetTime: Date.now() + 60000,
      limit: RATE_LIMITS[action as keyof typeof RATE_LIMITS]?.requests || 100
    }
  },
})

/**
 * Admin function to reset rate limits for a user (emergency use)
 */
export const resetUserRateLimit = mutation({
  args: {
    userId: v.string(),
    action: v.optional(v.string())
  },
  handler: async (ctx, { userId, action }) => {
    // Only allow admin users to call this
    // Implementation depends on your admin checking logic
    
    let query = ctx.db.query("rateLimitTracking").withIndex("by_user", (q) => q.eq("userId", userId))
    
    if (action) {
      query = query.filter((q) => q.eq(q.field("action"), action))
    }
    
    const records = await query.collect()
    
    for (const record of records) {
      await ctx.db.delete(record._id)
    }
    
    return { cleared: records.length }
  },
})