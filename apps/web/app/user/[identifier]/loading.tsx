import { Skeleton } from "@workspace/ui/components/skeleton"

export default function ProfileLoading() {
  return (
    <div className="flex-1 flex justify-center px-6 pt-16 pb-12">
      <div className="w-full max-w-2xl">
        {/* Profile Section Skeleton */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-start gap-4">
            {/* Profile Avatar Skeleton */}
            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
            
            {/* User Info Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-16" />
              </div>
              
              <Skeleton className="h-4 w-32 mb-3" />
              
              <div className="flex gap-6">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider Skeleton */}
        <Skeleton className="h-px w-full mb-6" />

        {/* Events Section Skeleton */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="p-6">
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
} 