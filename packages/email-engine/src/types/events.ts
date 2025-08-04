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