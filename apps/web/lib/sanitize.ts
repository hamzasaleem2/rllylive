/**
 * Input sanitization utilities to prevent XSS attacks
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags while removing dangerous scripts
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'a', 'img', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'iframe', 'form', 'input', 'textarea'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  })
}

/**
 * Sanitize plain text input by removing HTML tags and escaping special characters
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
}

/**
 * Sanitize URL to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  const trimmedUrl = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:') ||
    trimmedUrl.startsWith('file:')
  ) {
    return ''
  }
  
  // Ensure proper protocol for external URLs
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return url.trim()
  }
  
  // For relative URLs, just return as is
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return url.trim()
  }
  
  // For URLs without protocol, assume https
  if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
    return `https://${url.trim()}`
  }
  
  return url.trim()
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize username/identifier to allow only safe characters
 */
export function sanitizeUsername(username: string): string {
  if (!username) return ''
  
  return username
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 50) // Limit length
}

/**
 * Sanitize public URL for calendars/events
 */
export function sanitizePublicUrl(url: string): string {
  if (!url) return ''
  
  return url
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 50) // Limit length
}

/**
 * Comprehensive input sanitization for form data
 */
export function sanitizeFormInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeText(input)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        // Special handling for specific fields
        if (key === 'email') {
          sanitized[key] = sanitizeEmail(value)
        } else if (key === 'username' || key === 'publicUrl') {
          sanitized[key] = sanitizePublicUrl(value)
        } else if (key === 'description' && value.includes('<')) {
          sanitized[key] = sanitizeHtml(value)
        } else if (key.includes('url') || key.includes('link') || key.includes('website')) {
          sanitized[key] = sanitizeUrl(value)
        } else {
          sanitized[key] = sanitizeText(value)
        }
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
  
  return input
}