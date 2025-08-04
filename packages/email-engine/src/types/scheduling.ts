export interface ScheduledEmail {
  _id?: string
  userId: string
  ruleId: string
  templateId: string
  eventData: Record<string, any>
  scheduledFor: number // timestamp
  status: ScheduleStatus
  attempts: number
  maxAttempts: number
  error?: string
  lastAttemptAt?: number
  createdAt: number
  updatedAt: number
}

export type ScheduleStatus = 
  | "pending" 
  | "processing" 
  | "sent" 
  | "failed" 
  | "cancelled" 
  | "expired"

export interface SchedulingOptions {
  delayMinutes?: number
  maxAttempts?: number
  retryBackoffMinutes?: number
  expiresAfterHours?: number
}

export interface EmailBatch {
  _id?: string
  name: string
  templateId: string
  userIds: string[]
  scheduledFor: number
  status: BatchStatus
  totalEmails: number
  sentEmails: number
  failedEmails: number
  createdAt: number
  createdBy: string
}

export type BatchStatus = 
  | "draft" 
  | "scheduled" 
  | "processing" 
  | "completed" 
  | "cancelled"

export interface ProcessingStats {
  totalScheduled: number
  processing: number
  sent: number
  failed: number
  expired: number
  avgProcessingTime: number
}