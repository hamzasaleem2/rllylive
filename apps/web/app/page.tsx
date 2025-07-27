"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { SignInForm } from "./signin/signin-form"
import { RedirectToProfile } from "@/components/redirect-to-profile"
import { Spinner } from "@workspace/ui/components/spinner"

export default function Page() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <RedirectToProfile />
      </Authenticated>
    </>
  )
}
