// Email Engine Utility Library
// This package provides types, templates, and business logic
// Convex functions should be added to the main backend package

// Import types for internal use
import type { EventType, EventData } from './types/events.js'
import type { EmailRule, RuleConditions } from './types/rules.js'
import type { EmailTemplate, TemplateCategory } from './types/templates.js'

// Type exports
export type { 
  EmailEvent, 
  StoredEmailEvent, 
  EventType, 
  EventData 
} from './types/events.js'

export type {
  EmailRule,
  RuleConditions,
  ProcessingContext,
  RuleStatus,
  RuleMetrics
} from './types/rules.js'

export type {
  EmailTemplate,
  TemplateCategory,
  RenderedEmail,
  TemplateVariable,
  TemplatePreview,
  TemplateBuilder
} from './types/templates.js'

export type {
  ScheduledEmail,
  ScheduleStatus,
  SchedulingOptions,
  EmailBatch,
  BatchStatus,
  ProcessingStats
} from './types/scheduling.js'

// Email templates are React Email components in the backend package

// Schema definitions for Convex
export const emailEngineSchemaDefinitions = {
  // Event log - stores all triggerable events
  emailEvents: {
    userId: "string",
    type: "string", // EventType
    data: "any", // Event-specific data
    timestamp: "number",
    processed: "boolean",
    metadata: "any?",
    createdAt: "number",
  },

  // Email rules - define what triggers what
  emailRules: {
    trigger: "string", // EventType
    conditions: "any?", // RuleConditions
    delayMinutes: "number?", // 0 = immediate
    template: "string", // Template ID
    active: "boolean",
    priority: "number?", // Lower number = higher priority
    metadata: "any?",
    createdAt: "number",
    updatedAt: "number",
  },

  // Email templates - metadata about React Email components
  emailTemplates: {
    id: "string", // Unique template identifier
    name: "string",
    subject: "string", // Static subject line
    componentPath: "string", // Path to React Email component
    variables: "array", // Required props for the component
    category: "string", // TemplateCategory
    active: "boolean",
    version: "number",
    previewData: "any?", // Sample data for previews
    createdAt: "number",
    updatedAt: "number",
  },

  // Scheduled emails - for delays and batch processing
  scheduledEmails: {
    userId: "string",
    ruleId: "string",
    templateId: "string",
    eventData: "any", // Data for template rendering
    scheduledFor: "number", // timestamp
    status: "string", // ScheduleStatus
    attempts: "number",
    maxAttempts: "number",
    error: "string?",
    lastAttemptAt: "number?",
    createdAt: "number",
    updatedAt: "number",
  },

  // Email analytics and metrics
  emailMetrics: {
    emailId: "string", // Reference to sent email
    userId: "string",
    templateId: "string",
    ruleId: "string",
    eventType: "string",
    sentAt: "number",
    deliveredAt: "number?",
    openedAt: "number?",
    clickedAt: "number?",
    unsubscribedAt: "number?",
    bounced: "boolean?",
    error: "string?",
    metadata: "any?",
  },

  // Rule metrics for performance monitoring
  ruleMetrics: {
    ruleId: "string",
    totalTriggers: "number",
    successfulSends: "number",
    failedSends: "number",
    avgProcessingTime: "number",
    lastTriggered: "number?",
    createdAt: "number",
    updatedAt: "number",
  },
}

// Utility functions
export const EmailEngineUtils = {
  /**
   * Validate email template variables
   */
  validateTemplateVariables: (template: EmailTemplate, data: Record<string, any>): string[] => {
    const missing: string[] = []
    
    for (const variable of template.variables) {
      if (!(variable in data) || data[variable] === undefined || data[variable] === null) {
        missing.push(variable)
      }
    }
    
    return missing
  },

  /**
   * Generate sample data for template testing
   */
  generateSampleData: (template: EmailTemplate): Record<string, any> => {
    const data: Record<string, any> = {}
    
    for (const variable of template.variables) {
      switch (variable) {
        case 'userName':
        case 'hostName':
        case 'guestName':
        case 'memberName':
          data[variable] = 'John Doe'
          break
        case 'email':
        case 'guestEmail':
        case 'memberEmail':
          data[variable] = 'john@example.com'
          break
        case 'eventName':
          data[variable] = 'Sample Event'
          break
        case 'eventDate':
          data[variable] = Date.now() + 86400000 // Tomorrow
          break
        case 'eventLocation':
          data[variable] = 'Sample Location'
          break
        case 'calendarName':
          data[variable] = 'Sample Calendar'
          break
        case 'unsubscribeUrl':
          data[variable] = 'https://rlly.live/settings/notifications'
          break
        default:
          data[variable] = `[${variable}]`
      }
    }
    
    return data
  },

  /**
   * Map event types to notification categories
   */
  getNotificationCategory: (eventType: EventType): string => {
    const mapping: Record<EventType, string> = {
      'user_signup': 'product_updates',
      'event_invitation': 'event_invitations',
      'event_reminder': 'event_reminders', 
      'event_blast': 'event_blasts',
      'event_update': 'event_updates',
      'feedback_request': 'feedback_requests',
      'guest_registration': 'guest_registrations',
      'feedback_response': 'feedback_responses',
      'new_member': 'new_members',
      'event_submission': 'event_submissions',
      'product_update': 'product_updates'
    }
    return mapping[eventType] || 'product_updates'
  },

  /**
   * Create a basic email rule
   */
  createBasicRule: (
    trigger: EventType,
    template: string,
    delayMinutes: number = 0,
    conditions?: RuleConditions
  ): Omit<EmailRule, '_id' | 'createdAt' | 'updatedAt'> => {
    return {
      trigger,
      template,
      delayMinutes,
      conditions,
      active: true,
      priority: 1
    }
  },

  /**
   * Create a basic email template structure
   */
  createBasicTemplate: (
    id: string,
    name: string,
    category: TemplateCategory,
    subject: string,
    componentPath: string,
    variables: string[]
  ): Omit<EmailTemplate, '_id'> => {
    return {
      id,
      name,
      subject,
      componentPath,
      variables,
      category,
      active: true,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
}

// Constants for common use
export const EMAIL_CATEGORIES = {
  USER: 'user' as const,
  EVENT_ATTENDEE: 'event_attendee' as const,
  EVENT_HOST: 'event_host' as const,
  CALENDAR_MANAGER: 'calendar_manager' as const,
  PRODUCT: 'product' as const,
  SYSTEM: 'system' as const,
}

export const EVENT_TYPES = {
  USER_SIGNUP: 'user_signup' as const,
  EVENT_INVITATION: 'event_invitation' as const,
  EVENT_REMINDER: 'event_reminder' as const,
  EVENT_BLAST: 'event_blast' as const,
  EVENT_UPDATE: 'event_update' as const,
  FEEDBACK_REQUEST: 'feedback_request' as const,
  GUEST_REGISTRATION: 'guest_registration' as const,
  FEEDBACK_RESPONSE: 'feedback_response' as const,
  NEW_MEMBER: 'new_member' as const,
  EVENT_SUBMISSION: 'event_submission' as const,
  PRODUCT_UPDATE: 'product_update' as const,
} as const

export const NOTIFICATION_CATEGORIES = {
  EVENT_INVITATIONS: 'event_invitations',
  EVENT_REMINDERS: 'event_reminders',
  EVENT_BLASTS: 'event_blasts',
  EVENT_UPDATES: 'event_updates',
  FEEDBACK_REQUESTS: 'feedback_requests',
  GUEST_REGISTRATIONS: 'guest_registrations',
  FEEDBACK_RESPONSES: 'feedback_responses',
  NEW_MEMBERS: 'new_members',
  EVENT_SUBMISSIONS: 'event_submissions',
  PRODUCT_UPDATES: 'product_updates',
} as const