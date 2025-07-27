"use client"

import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Spinner } from "@workspace/ui/components/spinner"

export function RedirectToProfile() {
  const router = useRouter()
  const currentUser = useQuery(api.auth.getCurrentUser)

  useEffect(() => {
    if (currentUser?.rllyId) {
      router.push(`/user/${currentUser.rllyId}`)
    }
  }, [currentUser, router])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Redirecting to your profile...</p>
      </div>
    </div>
  )
}