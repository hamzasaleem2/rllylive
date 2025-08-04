"use client"

import { Authenticated, Unauthenticated } from "convex/react"
import { SignInForm } from "./signin/signin-form"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useMutation } from "convex/react"

function AuthenticatedHome() {
  const router = useRouter()
  const currentUser = useQuery(api.auth.getCurrentUser)
  const profileIdentifier = useQuery(api.auth.getProfileIdentifier, 
    currentUser?._id ? { userId: currentUser._id as any } : "skip"
  )

  useEffect(() => {
    if (profileIdentifier) {
      router.replace(`/user/${profileIdentifier}`)
    } else if (currentUser) {
      // If user is authenticated but profile identifier is slow to load, 
      // redirect to events after a shorter delay
      const timeout = setTimeout(() => {
        router.replace("/events")
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [profileIdentifier, currentUser, router])

  // Show minimal loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedHome />
      </Authenticated>
    </>
  )
}
