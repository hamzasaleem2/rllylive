// Email Engine Types and Constants
// Consolidated from @workspace/email-engine for easier deployment

// Event Types
export interface EmailEvent {
  userId: string
  type: string
  data: Record<string, any>
  timestamp: number
  metadata?: Record<string, any>
}

export interface StoredEmailEvent extends EmailEvent {
  _id: string
  processed: boolean
  createdAt: number
}

// Predefined event types for type safety
export type EventType = 
  | "user_signup"
  | "event_invitation" 
  | "event_reminder"
  | "event_blast"
  | "event_update"
  | "feedback_request"
  | "guest_registration"
  | "feedback_response"
  | "new_member"
  | "event_submission"
  | "product_update"

export interface EventData {
  // User events
  user_signup: {
    email: string
    userName: string
    profileUrl: string
  }
  
  // Event attendee emails
  event_invitation: {
    email: string
    userName: string
    eventId: string
    eventName: string
    eventDate: string
    eventLocation?: string
    hostName: string
    rsvpYesUrl: string
    rsvpMaybeUrl: string
    rsvpNoUrl: string
    eventUrl: string
  }
  
  event_reminder: {
    email: string
    userName: string
    eventId: string
    eventName: string
    eventDate: string
    eventLocation?: string
    eventUrl: string
    hoursUntilEvent: number
  }
  
  event_blast: {
    email: string
    userName: string
    eventId: string
    eventName: string
    hostName: string
    message: string
    eventUrl: string
  }
  
  event_update: {
    email: string
    userName: string
    eventId: string
    eventName: string
    changeType: string
    changeDescription: string
    eventUrl: string
  }
  
  feedback_request: {
    email: string
    userName: string
    eventId: string
    eventName: string
    feedbackUrl: string
    hostName: string
  }
  
  // Host emails
  guest_registration: {
    email: string
    hostName: string
    eventId: string
    eventName: string
    guestName: string
    guestEmail: string
    rsvpStatus: "going" | "maybe" | "not_going"
    guestCount: number
    manageEventUrl: string
  }
  
  feedback_response: {
    email: string
    hostName: string
    eventId: string
    eventName: string
    rating: number
    comment?: string
    respondentName: string
    viewFeedbackUrl: string
  }
  
  // Calendar manager emails
  new_member: {
    email: string
    managerName: string
    calendarId: string
    calendarName: string
    memberName: string
    memberEmail: string
    manageCalendarUrl: string
  }
  
  event_submission: {
    email: string
    managerName: string
    calendarId: string
    calendarName: string
    eventName: string
    submitterName: string
    eventDate: string
    approveUrl: string
    rejectUrl: string
    reviewUrl: string
  }
  
  // Product emails
  product_update: {
    email: string
    userName: string
    updateTitle: string
    updateDescription: string
    featureHighlights: string[]
    learnMoreUrl: string
    unsubscribeUrl: string
  }
}

// Rule Types
export interface EmailRule {
  _id: string
  trigger: EventType
  conditions?: RuleConditions
  delayMinutes?: number
  template: string
  active: boolean
  priority?: number
  metadata?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface RuleConditions {
  userSegment?: string[]
  eventProperties?: Record<string, any>
  timeConstraints?: {
    startHour?: number
    endHour?: number
    daysOfWeek?: number[]
    timezone?: string
  }
  frequency?: {
    maxPerDay?: number
    maxPerWeek?: number
    cooldownMinutes?: number
  }
}

export type RuleStatus = "active" | "paused" | "draft" | "archived"

export interface RuleMetrics {
  _id: string
  ruleId: string
  totalTriggers: number
  successfulSends: number
  failedSends: number
  avgProcessingTime: number
  lastTriggered?: number
  createdAt: number
  updatedAt: number
}

export interface ProcessingContext {
  userId: string
  eventType: EventType
  eventData: Record<string, any>
  timestamp: number
}

// Template Types
export interface EmailTemplate {
  _id: string
  id: string
  name: string
  subject: string
  componentPath: string
  variables: string[]
  category: TemplateCategory
  active: boolean
  version: number
  previewData?: Record<string, any>
  createdAt: number
  updatedAt: number
}

export type TemplateCategory = 
  | "user"
  | "event_attendee" 
  | "event_host"
  | "calendar_manager"
  | "product"
  | "system"

export interface RenderedEmail {
  html: string
  text?: string
  subject: string
  metadata?: Record<string, any>
}

export interface TemplateVariable {
  name: string
  type: "string" | "number" | "boolean" | "date" | "url" | "email"
  required: boolean
  description?: string
  defaultValue?: any
}

export interface TemplatePreview {
  templateId: string
  sampleData: Record<string, any>
  renderedHtml: string
  generatedAt: number
}

export interface TemplateBuilder {
  id: string
  template: EmailTemplate
  sampleData: Record<string, any>
  validationErrors: string[]
}

// Scheduling Types
export interface ScheduledEmail {
  _id: string
  userId: string
  ruleId: string
  templateId: string
  eventData: Record<string, any>
  scheduledFor: number
  status: ScheduleStatus
  attempts: number
  maxAttempts: number
  error?: string
  lastAttemptAt?: number
  createdAt: number
  updatedAt: number
}

export type ScheduleStatus = "pending" | "processing" | "sent" | "failed" | "cancelled"

export interface SchedulingOptions {
  delayMinutes?: number
  retryPolicy?: {
    maxAttempts: number
    backoffMultiplier: number
    baseDelayMinutes: number
  }
  priority?: "low" | "normal" | "high"
  batchWith?: string[]
}

export interface EmailBatch {
  _id: string
  name: string
  emails: string[]
  status: BatchStatus
  scheduledFor: number
  totalEmails: number
  sentEmails: number
  failedEmails: number
  createdAt: number
  updatedAt: number
}

export type BatchStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export interface ProcessingStats {
  totalProcessed: number
  successfulSends: number
  failedSends: number
  avgProcessingTime: number
  lastProcessedAt: number
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