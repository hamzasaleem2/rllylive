"use client"

import { useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { UserX, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Profile error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Error Icon */}
        <div className="relative">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <UserX className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-medium text-foreground">
            Profile unavailable
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            We couldn't load this profile. It might be temporarily unavailable or there's a connection issue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}