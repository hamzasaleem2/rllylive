import { Skeleton } from "@workspace/ui/components/skeleton"

export function EventPreviewSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
        
        {/* Left Sidebar Skeleton */}
        <div className="lg:w-96 flex-shrink-0 space-y-6">
          
          {/* Event Image Skeleton */}
          <div className="aspect-square rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Calendar Info Card Skeleton */}
          <div className="bg-card/30 border border-muted-foreground/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Attendees Section Skeleton */}
          <div className="bg-muted/20 rounded-xl p-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
              ))}
            </div>
          </div>

          {/* Hosted By Section Skeleton */}
          <div className="bg-muted/20 rounded-xl p-4">
            <Skeleton className="h-3 w-16 mb-3" />
            
            {/* Event Creator Skeleton */}
            <div className="flex items-center gap-3 mb-3 p-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Action Links Skeleton */}
            <div className="pt-3 border-t border-border/20 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

        </div>

        {/* Right Content Skeleton */}
        <div className="flex-1 space-y-6">
          
          {/* Event Header Skeleton */}
          <div>
            <Skeleton className="h-8 w-3/4 mb-6" />
          </div>

          {/* Event Meta Info Skeleton */}
          <div className="space-y-4">
            
            {/* Date and Time Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            {/* Location Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-36" />
              </div>
            </div>

          </div>

          {/* RSVP/Registration Card Skeleton */}
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="flex-1 h-10 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>

          {/* About Event Card Skeleton */}
          <div className="bg-card border rounded-lg p-6">
            <Skeleton className="h-4 w-20 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}