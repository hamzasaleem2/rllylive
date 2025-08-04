export interface EmailTemplate {
  _id?: string
  id: string
  name: string
  subject: string
  componentPath: string // Path to React Email component
  variables: string[]
  category: TemplateCategory
  active: boolean
  version: number
  previewData?: Record<string, any> // Sample data for previews
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
  subject: string
  html: string
  plainText?: string
  metadata?: Record<string, any>
}

export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email'
  required: boolean
  description?: string
  defaultValue?: any
  validation?: {
    pattern?: string
    min?: number
    max?: number
  }
}

export interface TemplatePreview {
  templateId: string
  subject: string
  htmlPreview: string
  plainTextPreview?: string
  sampleData: Record<string, any>
  generatedAt: number
}

// Template builder interface for admin
export interface TemplateBuilder {
  id?: string
  name: string
  subject: string
  componentPath: string
  category: TemplateCategory
  variables: TemplateVariable[]
  previewData: Record<string, any>
  isActive: boolean
}