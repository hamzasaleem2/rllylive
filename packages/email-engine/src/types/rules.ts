import { EventType } from './events.js'

export interface EmailRule {
  _id?: string
  trigger: EventType
  conditions?: RuleConditions
  delayMinutes?: number
  template: string
  active: boolean
  priority?: number
  metadata?: Record<string, any>
  createdAt?: number
  updatedAt?: number
}

export interface RuleConditions {
  // User-based conditions
  userSegment?: string
  userJoinedAfter?: number
  userJoinedBefore?: number
  
  // Event-based conditions
  eventType?: string
  isPublicEvent?: boolean
  eventCapacity?: {
    min?: number
    max?: number
  }
  
  // Time-based conditions
  timeOfDay?: {
    start: string // "09:00"
    end: string   // "17:00"
  }
  dayOfWeek?: number[] // [1,2,3,4,5] for weekdays
  
  // Custom conditions (JSON path expressions)
  customConditions?: Array<{
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists'
    value: any
  }>
}

export interface ProcessingContext {
  event: any
  user: any
  rule: EmailRule
  template: any
  timestamp: number
}

export type RuleStatus = 'active' | 'paused' | 'draft'

export interface RuleMetrics {
  ruleId: string
  totalTriggers: number
  successfulSends: number
  failedSends: number
  avgProcessingTime: number
  lastTriggered?: number
  createdAt: number
}