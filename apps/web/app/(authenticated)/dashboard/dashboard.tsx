"use client"

import { useQuery } from "convex/react"
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@/lib/auth-client"
import { api } from "@workspace/backend/convex/_generated/api"

export function Dashboard() {
  const user = useQuery(api.auth.getCurrentUser)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg text-center">
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-medium text-foreground">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Hello {user?.name || user?.email || "there"}!
            </p>
            <p className="text-sm text-muted-foreground/80">
              You're successfully signed in to rlly.live
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={() => authClient.signOut()}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}