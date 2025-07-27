"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInForm } from "./signin/signin-form"
import { Dashboard } from "./(authenticated)/dashboard/dashboard"

export default function Page() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="w-6 h-6 border-2 border-live-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  )
}
