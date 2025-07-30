import { Skeleton } from "@workspace/ui/components/skeleton"

export function EventCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 sm:w-96 bg-card border rounded-lg">
      <div className="p-4">
        {/* Top section with image and info */}
        <div className="flex gap-3 mb-4">
          {/* Event image */}
          <div className="flex-shrink-0">
            <Skeleton className="w-16 h-16 rounded-lg" />
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            {/* Time */}
            <Skeleton className="h-4 w-12 mb-2" />

            {/* Title */}
            <Skeleton className="h-6 w-3/4 mb-3" />

            {/* Attributes */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  )
}