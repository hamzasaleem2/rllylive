import { v } from "convex/values"
import { mutation, internalMutation, internalQuery, internalAction } from "./_generated/server"
import { resend } from "./lib/email"
import { 
  EVENT_TYPES, 
  EmailEngineUtils,
  type EventType
} from "./lib/emailEngineTypes"
import { render } from "@react-email/components"
import * as React from "react"
import { internal } from "./_generated/api"

// ===================
// EVENT TRIGGERS
// ===================

// Trigger an email event
export const triggerEmailEvent = mutation({
  args: {
    eventType: v.string(),
    userId: v.string(),
    data: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Store the event
    const eventId = await ctx.db.insert("emailEvents", {
      userId: args.userId,
      type: args.eventType,
      data: args.data,
      timestamp: Date.now(),
      processed: false,
      metadata: args.metadata,
      createdAt: Date.now(),
    })

    // Schedule processing immediately
    await ctx.scheduler.runAfter(0, internal.emailEngine.processEmailEvent, { eventId })
    return eventId
  },
})

// Process an email event (background action)
export const processEmailEvent = internalAction({
  args: { eventId: v.id("emailEvents") },
  handler: async (ctx, args): Promise<void> => {
    const event = await ctx.runQuery(internal.emailEngine.getEmailEvent, { eventId: args.eventId })
    if (!event) return

    // Find matching active rules
    const rules = await ctx.runQuery(internal.emailEngine.getActiveRulesByTrigger, { trigger: event.type })

    // Process each rule
    for (const rule of rules) {
      try {
        // Check user notification preferences
        const userWantsEmail = await ctx.runQuery(internal.emailEngine.checkUserWantsNotification, {
          userId: event.userId,
          eventType: event.type as EventType
        })

        if (!userWantsEmail) {
          console.log(`User ${event.userId} has disabled ${event.type} notifications`)
          continue
        }

        // Process the rule
        if (rule.delayMinutes && rule.delayMinutes > 0) {
          // Schedule for later
          await ctx.runMutation(internal.emailEngine.scheduleEmail, {
            userId: event.userId,
            ruleId: rule._id,
            templateId: rule.template,
            eventData: event.data,
            scheduledFor: Date.now() + (rule.delayMinutes * 60 * 1000),
          })
        } else {
          // Send immediately
          await ctx.runAction(internal.emailEngine.sendEmailNow, {
            userId: event.userId,
            templateId: rule.template,
            ruleId: rule._id,
            eventData: event.data,
            eventType: event.type,
          })
        }

        // Update rule metrics
        await ctx.runMutation(internal.emailEngine.updateRuleMetrics, {
          ruleId: rule._id,
          success: true,
        })

      } catch (error) {
        console.error(`Failed to process rule ${rule._id}:`, error)
        await ctx.runMutation(internal.emailEngine.updateRuleMetrics, {
          ruleId: rule._id,
          success: false,
        })
      }
    }

    // Mark event as processed
    await ctx.runMutation(internal.emailEngine.markEventProcessed, { eventId: args.eventId })
  },
})

// Send email immediately
export const sendEmailNow = internalAction({
  args: {
    userId: v.string(),
    templateId: v.string(),
    ruleId: v.string(),
    eventData: v.any(),
    eventType: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Get template
      const template: any = await ctx.runQuery(internal.emailEngine.getEmailTemplate, { id: args.templateId })
      if (!template || !template.active) {
        throw new Error("Template not found or inactive")
      }

      // Dynamically import the React Email component
      console.log("Loading component from:", template.componentPath)
      console.log("Event data:", args.eventData)
      const componentModule = await import(template.componentPath)
      const EmailComponent = componentModule.default
      
      // Render email using React Email
      const html = await render(React.createElement(EmailComponent, args.eventData))
      console.log("Rendered HTML length:", html.length)

      // Send via Resend
      console.log("Sending email to:", args.eventData.email)
      const result = await resend.sendEmail(ctx, {
        from: "Rlly <noreply@rlly.live>",
        to: args.eventData.email,
        subject: template.subject,
        html,
      })
      console.log("Resend result:", result)

      // Log metrics
      await ctx.runMutation(internal.emailEngine.logEmailSent, {
        emailId: (result as any).id || 'unknown',
        userId: args.userId,
        templateId: args.templateId,
        ruleId: args.ruleId,
        eventType: args.eventType,
        sentAt: Date.now(),
        metadata: { resendId: (result as any).id }
      })

      console.log(`Email sent successfully: ${(result as any).id}`)
      return result

    } catch (error) {
      console.error("Failed to send email:", error)
      
      // Log failed attempt
      await ctx.runMutation(internal.emailEngine.logEmailSent, {
        emailId: 'failed',
        userId: args.userId,
        templateId: args.templateId,
        ruleId: args.ruleId,
        eventType: args.eventType,
        sentAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { failed: true }
      })
      
      throw error
    }
  },
})

// ===================
// QUERIES
// ===================

export const getEmailEvent = internalQuery({
  args: { eventId: v.id("emailEvents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId)
  },
})

export const getActiveRulesByTrigger = internalQuery({
  args: { trigger: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailRules")
      .withIndex("by_trigger_active", (q) => 
        q.eq("trigger", args.trigger).eq("active", true)
      )
      .order("asc") // Process by priority
      .collect()
  },
})

export const getEmailTemplate = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailTemplates")
      .filter((q) => q.and(
        q.eq(q.field("id"), args.id),
        q.eq(q.field("active"), true)
      ))
      .order("desc") // Get latest version
      .first()
  },
})

export const checkUserWantsNotification = internalQuery({
  args: { 
    userId: v.string(),
    eventType: v.string()
  },
  handler: async (ctx, args) => {
    const category = EmailEngineUtils.getNotificationCategory(args.eventType as EventType)
    
    // Try to find user first to get proper ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first()
    
    if (!user) {
      return false // User not found, don't send email
    }
    
    const preference = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id).eq("category", category)
      )
      .first()

    // Default to email if no preference set
    return preference?.channel === "email" || !preference
  },
})

// ===================
// MUTATIONS
// ===================


export const markEventProcessed = internalMutation({
  args: { eventId: v.id("emailEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { processed: true })
  },
})

export const scheduleEmail = internalMutation({
  args: {
    userId: v.string(),
    ruleId: v.string(),
    templateId: v.string(),
    eventData: v.any(),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledEmails", {
      ...args,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const updateRuleMetrics = internalMutation({
  args: {
    ruleId: v.string(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ruleMetrics")
      .withIndex("by_rule", (q) => q.eq("ruleId", args.ruleId))
      .first()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalTriggers: existing.totalTriggers + 1,
        successfulSends: existing.successfulSends + (args.success ? 1 : 0),
        failedSends: existing.failedSends + (args.success ? 0 : 1),
        lastTriggered: now,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("ruleMetrics", {
        ruleId: args.ruleId,
        totalTriggers: 1,
        successfulSends: args.success ? 1 : 0,
        failedSends: args.success ? 0 : 1,
        avgProcessingTime: 0,
        lastTriggered: now,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

export const logEmailSent = internalMutation({
  args: {
    emailId: v.string(),
    userId: v.string(),
    templateId: v.string(),
    ruleId: v.string(),
    eventType: v.string(),
    sentAt: v.number(),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailMetrics", args)
  },
})

// ===================
// CONVENIENCE FUNCTIONS
// ===================

// Setup production email templates and rules
export const setupEmailTemplatesAndRules = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = [
      {
        id: "event_invitation",
        name: "Event Invitation",
        subject: "You're invited to an event!",
        componentPath: "./emails/eventInvitation",
        variables: ["invitedName", "inviterName", "eventName", "eventDate", "eventLocation", "message", "invitationUrl", "email"],
        category: "event_attendee",
      },
      {
        id: "event_rsvp",
        name: "Event RSVP Notification",
        subject: "Someone RSVPed to your event",
        componentPath: "./emails/eventRSVP",
        variables: ["hostName", "attendeeName", "eventName", "rsvpStatus", "eventUrl", "email"],
        category: "event_host",
      },
      {
        id: "event_reminder",
        name: "Event Reminder",
        subject: "Your event is coming up!",
        componentPath: "./emails/eventReminder",
        variables: ["userName", "eventName", "eventDate", "eventLocation", "eventUrl", "hoursUntilEvent", "email"],
        category: "event_attendee",
      },
      {
        id: "new_event_notification",
        name: "New Event Notification", 
        subject: "New event in a calendar you follow",
        componentPath: "./emails/newEventNotification",
        variables: ["subscriberName", "hostName", "eventName", "eventDate", "calendarName", "eventUrl", "email"],
        category: "calendar_manager",
      },
      {
        id: "calendar_invitation",
        name: "Calendar Invitation",
        subject: "You're invited to join a calendar!",
        componentPath: "./emails/calendarInvitation",
        variables: ["inviterName", "calendarName", "joinUrl", "email"],
        category: "calendar",
      },
      {
        id: "event_goes_live",
        name: "Event Goes Live",
        subject: "Your event is starting now!",
        componentPath: "./emails/eventGoesLive",
        variables: ["userName", "eventName", "eventDate", "eventLocation", "eventUrl", "isVirtual", "virtualLink", "email"],
        category: "event_attendee",
      }
    ]

    const rules = [
      {
        trigger: "event_invitation",
        template: "event_invitation",
        delayMinutes: 0, // Send immediately
        active: true,
        priority: 1
      },
      {
        trigger: "event_rsvp", 
        template: "event_rsvp",
        delayMinutes: 0, // Send immediately
        active: true,
        priority: 1
      },
      {
        trigger: "event_reminder_24h",
        template: "event_reminder",
        delayMinutes: 0, // Already scheduled 24h before
        active: true,
        priority: 1
      },
      {
        trigger: "new_event_notification",
        template: "new_event_notification", 
        delayMinutes: 0, // Send immediately
        active: true,
        priority: 1
      },
      {
        trigger: "calendar_invitation",
        template: "calendar_invitation",
        delayMinutes: 0, // Send immediately
        active: true,
        priority: 1
      },
      {
        trigger: "event_goes_live",
        template: "event_goes_live",
        delayMinutes: 0, // Sent at exact event start time
        active: true,
        priority: 1
      }
    ]

    let created = 0

    // Create templates
    for (const template of templates) {
      const existing = await ctx.db
        .query("emailTemplates")
        .filter((q) => q.eq(q.field("id"), template.id))
        .first()

      if (!existing) {
        await ctx.db.insert("emailTemplates", {
          ...template,
          active: true,
          version: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        created++
      }
    }

    // Create rules
    for (const rule of rules) {
      const existing = await ctx.db
        .query("emailRules")
        .filter((q) => q.eq(q.field("trigger"), rule.trigger))
        .first()

      if (!existing) {
        await ctx.db.insert("emailRules", {
          ...rule,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        created++
      }
    }

    return { message: `Email system setup complete. Created ${created} new templates/rules.` }
  },
})


export const sendEventInvitation = mutation({
  args: {
    userId: v.string(),
    eventId: v.string(),
    eventName: v.string(),
    eventDate: v.number(),
    eventLocation: v.optional(v.string()),
    hostName: v.string(),
    email: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rlly.live'
    
    return await ctx.db.insert("emailEvents", {
      userId: args.userId,
      type: EVENT_TYPES.EVENT_INVITATION,
      data: {
        email: args.email,
        userName: args.userName,
        eventId: args.eventId,
        eventName: args.eventName,
        eventDate: args.eventDate,
        eventLocation: args.eventLocation,
        hostName: args.hostName,
        eventUrl: `${baseUrl}/events/${args.eventId}`,
        rsvpYesUrl: `${baseUrl}/events/${args.eventId}?rsvp=going`,
        rsvpMaybeUrl: `${baseUrl}/events/${args.eventId}?rsvp=maybe`,
        rsvpNoUrl: `${baseUrl}/events/${args.eventId}?rsvp=not_going`,
      },
      timestamp: Date.now(),
      processed: false,
      createdAt: Date.now(),
    })
  },
})

export const sendGuestRegistration = mutation({
  args: {
    hostUserId: v.string(),
    eventId: v.string(),
    eventName: v.string(),
    guestName: v.string(),
    guestEmail: v.string(),
    rsvpStatus: v.string(),
    guestCount: v.optional(v.number()),
    hostEmail: v.string(),
    hostName: v.string(),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rlly.live'
    
    return await ctx.db.insert("emailEvents", {
      userId: args.hostUserId,
      type: EVENT_TYPES.GUEST_REGISTRATION,
      data: {
        email: args.hostEmail,
        hostName: args.hostName,
        eventId: args.eventId,
        eventName: args.eventName,
        guestName: args.guestName,
        guestEmail: args.guestEmail,
        rsvpStatus: args.rsvpStatus,
        guestCount: args.guestCount || 0,
        manageEventUrl: `${baseUrl}/events/${args.eventId}/manage`,
      },
      timestamp: Date.now(),
      processed: false,
      createdAt: Date.now(),
    })
  },
})

export const sendEventReminder = mutation({
  args: {
    userId: v.string(),
    eventId: v.string(),
    eventName: v.string(),
    eventDate: v.number(),
    eventLocation: v.optional(v.string()),
    email: v.string(),
    userName: v.string(),
    hoursUntilEvent: v.number(),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rlly.live'
    
    return await ctx.db.insert("emailEvents", {
      userId: args.userId,
      type: EVENT_TYPES.EVENT_REMINDER,
      data: {
        email: args.email,
        userName: args.userName,
        eventId: args.eventId,
        eventName: args.eventName,
        eventDate: args.eventDate,
        eventLocation: args.eventLocation,
        eventUrl: `${baseUrl}/events/${args.eventId}`,
        hoursUntilEvent: args.hoursUntilEvent,
      },
      timestamp: Date.now(),
      processed: false,
      createdAt: Date.now(),
    })
  },
})

// ===================
// TEMPLATE MANAGEMENT
// ===================

export const createEmailTemplate = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    subject: v.string(),
    componentPath: v.string(),
    variables: v.array(v.string()),
    category: v.string(),
    previewData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if template ID already exists
    const existing = await ctx.db
      .query("emailTemplates")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first()

    if (existing) {
      throw new Error(`Template with ID "${args.id}" already exists`)
    }

    const now = Date.now()
    
    return await ctx.db.insert("emailTemplates", {
      ...args,
      active: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const createEmailRule = mutation({
  args: {
    trigger: v.string(),
    template: v.string(),
    delayMinutes: v.optional(v.number()),
    conditions: v.optional(v.any()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    return await ctx.db.insert("emailRules", {
      ...args,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
  },
})