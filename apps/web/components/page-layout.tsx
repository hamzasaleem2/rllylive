import { ReactNode } from "react"

interface PageLayoutProps {
  title?: string
  description?: string
  rightElement?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, description, rightElement, children }: PageLayoutProps) {
  return (
    <div className="flex-1 flex justify-center px-6 pt-6 pb-12">
      <div className="w-full max-w-4xl">
        {/* Page Header - Only render if title or rightElement exists */}
        {(title || description || rightElement) && (
          <div className="top-0 z-10">
            <div className="pt-2 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  {title && (
                    <h1 className="font-display text-3xl font-medium text-foreground mb-2">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {rightElement && (
                  <div className="flex items-center gap-2">
                    {rightElement}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <div className={title || description || rightElement ? "mt-6" : ""}>
          {children}
        </div>
      </div>
    </div>
  )
}