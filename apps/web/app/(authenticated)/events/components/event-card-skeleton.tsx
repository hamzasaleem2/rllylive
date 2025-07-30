import { Skeleton } from "@workspace/ui/components/skeleton"

export function EventCardSkeleton() {
  return (
    <div className="w-full bg-card border rounded-lg">
      <div className="p-6 flex gap-6">
        {/* Event info */}
        <div className="flex-1">
          {/* Time */}
          <Skeleton className="h-4 w-12 mb-3" />

          {/* Title */}
          <Skeleton className="h-6 w-3/4 mb-4" />

          {/* Key Info - one per row */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        
        {/* Event image */}
        <div className="flex-shrink-0 self-start">
          <Skeleton className="w-20 h-20 md:w-40 md:h-40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}