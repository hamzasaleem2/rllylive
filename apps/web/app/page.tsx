"use client"

import { Authenticated, Unauthenticated } from "convex/react"
import { SignInForm } from "./signin/signin-form"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function AuthenticatedHome() {
  const router = useRouter()
  const currentUser = useQuery(api.auth.getCurrentUser)
  const profileIdentifier = useQuery(api.auth.getProfileIdentifier, { 
    userId: currentUser?._id as any 
  })

  useEffect(() => {
    if (profileIdentifier) {
      router.replace(`/user/${profileIdentifier}`)
    }
  }, [profileIdentifier, router])

  return null
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
