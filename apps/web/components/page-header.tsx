"use client"

import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className = "" }: PageHeaderProps) {
  return (
    <div className={`top-0 z-10 ${className}`}>
      <div className="pt-2 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 