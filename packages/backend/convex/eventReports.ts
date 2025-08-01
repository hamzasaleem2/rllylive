import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

// Submit a report for an event
export const reportEvent = mutation({
  args: {
    eventId: v.id("events"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate reason
    if (!args.reason.trim()) {
      throw new Error("Report reason is required")
    }

    if (args.reason.length > 1000) {
      throw new Error("Report reason must be less than 1000 characters")
    }

    // Check if event exists
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if user has RSVP'd to this event (only attendees can report)
    const userRSVP = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_user", (q) => 
        q.eq("eventId", args.eventId).eq("userId", user.userId)
      )
      .first()

    if (!userRSVP || userRSVP.status !== "going") {
      throw new Error("You can only report events you are attending")
    }

    // Check if user has already reported this event
    const existingReport = await ctx.db
      .query("eventReports")
      .withIndex("by_event_reporter", (q) => 
        q.eq("eventId", args.eventId).eq("reportedBy", user.userId)
      )
      .first()

    if (existingReport) {
      throw new Error("You have already reported this event")
    }

    // Create the report
    const reportId = await ctx.db.insert("eventReports", {
      eventId: args.eventId,
      reportedBy: user.userId as any,
      reason: args.reason.trim(),
      reportedAt: Date.now(),
      status: "pending",
    })

    return { reportId, success: true }
  },
})

// Get reports for an event (for event organizers/moderators)
export const getEventReports = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Check if user has permission to view reports for this event
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const calendar = await ctx.db.get(event.calendarId)
    if (!calendar) {
      throw new Error("Calendar not found")
    }

    // Only event creator or calendar owner can view reports
    if (event.createdById !== user.userId && calendar.ownerId !== user.userId) {
      throw new Error("You don't have permission to view reports for this event")
    }

    const reports = await ctx.db
      .query("eventReports")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()

    // Enrich with reporter info
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reportedBy)
        const reviewer = report.reviewedBy ? await ctx.db.get(report.reviewedBy) : null

        return {
          ...report,
          reporter: reporter ? {
            _id: reporter._id,
            name: reporter.name,
            username: reporter.username,
            image: reporter.image,
          } : null,
          reviewer: reviewer ? {
            _id: reviewer._id,
            name: reviewer.name,
            username: reviewer.username,
          } : null,
        }
      })
    )

    return enrichedReports.sort((a, b) => b.reportedAt - a.reportedAt)
  },
})

// Get all pending reports (for moderators/admins)
export const getPendingReports = query({
  args: {},
  handler: async (ctx) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // TODO: Add role-based authorization for moderators/admins
    // For now, this is commented out - implement when you have user roles
    /*
    if (!user.isModerator && !user.isAdmin) {
      throw new Error("You don't have permission to view reports")
    }
    */

    const reports = await ctx.db
      .query("eventReports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect()

    // Enrich with event and reporter info
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const event = await ctx.db.get(report.eventId)
        const reporter = await ctx.db.get(report.reportedBy)

        return {
          ...report,
          event: event ? {
            _id: event._id,
            name: event.name,
            startTime: event.startTime,
          } : null,
          reporter: reporter ? {
            _id: reporter._id,
            name: reporter.name,
            username: reporter.username,
            image: reporter.image,
          } : null,
        }
      })
    )

    return enrichedReports.sort((a, b) => b.reportedAt - a.reportedAt)
  },
})

// Update report status (for moderators/admins)
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("eventReports"),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    // TODO: Add role-based authorization for moderators/admins
    /*
    if (!user.isModerator && !user.isAdmin) {
      throw new Error("You don't have permission to update reports")
    }
    */

    const report = await ctx.db.get(args.reportId)
    if (!report) {
      throw new Error("Report not found")
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
      reviewedBy: user.userId as any,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes?.trim(),
    })

    return { success: true }
  },
})