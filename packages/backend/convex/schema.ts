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
    profileImage: v.optional(v.string()), // Storage ID for profile image
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

  events: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    calendarId: v.id("calendars"),
    startTime: v.number(), // Unix timestamp
    endTime: v.number(), // Unix timestamp
    timezone: v.string(), // Event timezone
    location: v.optional(v.string()),
    isVirtual: v.optional(v.boolean()),
    virtualLink: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Event image URL
    imageStorageId: v.optional(v.string()), // Convex storage ID for image
    theme: v.optional(v.string()), // Theme name (e.g., "Minimal")
    // Ticket options
    ticketType: v.union(v.literal("free"), v.literal("paid")), // Ticket type
    ticketPrice: v.optional(v.number()), // Price for paid tickets
    ticketName: v.optional(v.string()), // Custom ticket name
    ticketDescription: v.optional(v.string()), // Ticket description
    // Event options
    requiresApproval: v.optional(v.boolean()),
    hasCapacityLimit: v.optional(v.boolean()), // Whether capacity is limited
    capacity: v.optional(v.number()), // Max capacity
    waitingList: v.optional(v.boolean()), // Over-capacity waiting list
    // Privacy
    isPublic: v.optional(v.boolean()),
    createdById: v.id("users"),
  })
  .index("by_calendar", ["calendarId"])
  .index("by_creator", ["createdById"])
  .index("by_start_time", ["startTime"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    category: v.string(),
    channel: v.union(v.literal("email"), v.literal("off")),
  })
  .index("by_user", ["userId"])
  .index("by_user_category", ["userId", "category"]),

  eventInvitations: defineTable({
    eventId: v.id("events"),
    invitedUserId: v.id("users"),
    invitedBy: v.id("users"), // Who sent the invitation
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    invitedAt: v.number(), // Unix timestamp
    respondedAt: v.optional(v.number()), // Unix timestamp when user responded
    message: v.optional(v.string()), // Optional invitation message
  })
  .index("by_event", ["eventId"])
  .index("by_invited_user", ["invitedUserId"])
  .index("by_inviter", ["invitedBy"])
  .index("by_event_user", ["eventId", "invitedUserId"])
  .index("by_status", ["status"]),

  eventRSVPs: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going")),
    rsvpAt: v.number(), // Unix timestamp
    // Optional fields for additional info
    guestCount: v.optional(v.number()), // Number of additional guests
    dietaryRestrictions: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_event_user", ["eventId", "userId"])
  .index("by_status", ["status"])
  .index("by_event_status", ["eventId", "status"]),

  // Event approval requests for events that require approval
  eventApprovalRequests: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"), // User requesting to join
    status: v.union(
      v.literal("pending"), 
      v.literal("approved"), 
      v.literal("rejected")
    ),
    requestedAt: v.number(), // When the request was made
    reviewedAt: v.optional(v.number()), // When it was reviewed
    reviewedBy: v.optional(v.id("users")), // Who reviewed it (event creator/calendar owner)
    message: v.optional(v.string()), // Optional message from requester
    reviewNotes: v.optional(v.string()), // Optional notes from reviewer
    guestCount: v.optional(v.number()), // Number of additional guests requested
  })
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_event_user", ["eventId", "userId"])
  .index("by_status", ["status"])
  .index("by_event_status", ["eventId", "status"]),

  eventAttendees: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    // How they became an attendee
    attendeeType: v.union(
      v.literal("creator"), // Event creator
      v.literal("invited"), // Invited by someone
      v.literal("registered") // Self-registered (for public events)
    ),
    registeredAt: v.number(), // Unix timestamp
    checkedIn: v.optional(v.boolean()), // Whether they've checked into the event
    checkedInAt: v.optional(v.number()), // When they checked in
  })
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_event_user", ["eventId", "userId"])
  .index("by_attendee_type", ["attendeeType"])
  .index("by_event_type", ["eventId", "attendeeType"]),

  eventReports: defineTable({
    eventId: v.id("events"),
    reportedBy: v.id("users"), // User who reported the event
    reason: v.string(), // Reason for reporting
    reportedAt: v.number(), // Unix timestamp when reported
    status: v.union(
      v.literal("pending"), // Report submitted, awaiting review
      v.literal("under_review"), // Being reviewed by moderators
      v.literal("resolved"), // Issue resolved
      v.literal("dismissed") // Report dismissed as invalid
    ),
    reviewedBy: v.optional(v.id("users")), // Moderator who reviewed
    reviewedAt: v.optional(v.number()), // When it was reviewed
    reviewNotes: v.optional(v.string()), // Internal notes from moderators
  })
  .index("by_event", ["eventId"])
  .index("by_reporter", ["reportedBy"])
  .index("by_status", ["status"])
  .index("by_event_reporter", ["eventId", "reportedBy"]),

  // Rate limiting tracking
  rateLimitTracking: defineTable({
    key: v.string(), // Unique key for user:action:identifier
    userId: v.string(), // User ID being rate limited
    action: v.string(), // Action being performed
    timestamp: v.number(), // When this request was made
    ip: v.optional(v.string()), // IP address for additional tracking
  })
  .index("by_key_timestamp", ["key", "timestamp"])
  .index("by_user", ["userId"])
  .index("by_user_action", ["userId", "action"]),

  // Email Engine Tables
  emailEvents: defineTable({
    userId: v.string(),
    type: v.string(), // EventType
    data: v.any(), // Event-specific data
    timestamp: v.number(),
    processed: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_processed", ["processed"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_type", ["userId", "type"]),

  emailRules: defineTable({
    trigger: v.string(), // EventType
    conditions: v.optional(v.any()), // RuleConditions
    delayMinutes: v.optional(v.number()), // 0 = immediate
    template: v.string(), // Template ID
    active: v.boolean(),
    priority: v.optional(v.number()), // Lower number = higher priority
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_trigger", ["trigger"])
    .index("by_active", ["active"])
    .index("by_trigger_active", ["trigger", "active"])
    .index("by_priority", ["priority"]),

  emailTemplates: defineTable({
    id: v.string(), // Unique template identifier
    name: v.string(),
    subject: v.string(), // Static subject line
    componentPath: v.string(), // Path to React Email component
    variables: v.array(v.string()), // Required props for the component
    category: v.string(), // TemplateCategory
    active: v.boolean(),
    version: v.number(),
    previewData: v.optional(v.any()), // Sample data for previews
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_template_id", ["id"])
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_template_id_version", ["id", "version"]),

  scheduledEmails: defineTable({
    userId: v.string(),
    ruleId: v.string(),
    templateId: v.string(),
    eventData: v.any(), // Data for template rendering
    scheduledFor: v.number(), // timestamp
    status: v.string(), // ScheduleStatus
    attempts: v.number(),
    maxAttempts: v.number(),
    error: v.optional(v.string()),
    lastAttemptAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scheduled", ["scheduledFor"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_scheduled_status", ["scheduledFor", "status"])
    .index("by_status_scheduled", ["status", "scheduledFor"]),

  emailMetrics: defineTable({
    emailId: v.string(), // Reference to sent email
    userId: v.string(),
    templateId: v.string(),
    ruleId: v.string(),
    eventType: v.string(),
    sentAt: v.number(),
    deliveredAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
    bounced: v.optional(v.boolean()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_template", ["templateId"])
    .index("by_rule", ["ruleId"])
    .index("by_event_type", ["eventType"])
    .index("by_sent_at", ["sentAt"]),

  ruleMetrics: defineTable({
    ruleId: v.string(),
    totalTriggers: v.number(),
    successfulSends: v.number(),
    failedSends: v.number(),
    avgProcessingTime: v.number(),
    lastTriggered: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_rule", ["ruleId"])
    .index("by_last_triggered", ["lastTriggered"]),
});