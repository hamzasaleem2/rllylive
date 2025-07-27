"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Logo } from "./logo"
import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "./theme-toggle"
import { authClient } from "@/lib/auth-client"

export function AuthenticatedHeader() {
  const [timeDisplay, setTimeDisplay] = useState("")
  useQuery(api.auth.getCurrentUser)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      const offset = -now.getTimezoneOffset() / 60
      const sign = offset >= 0 ? '+' : ''
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace('_', ' ')
      setTimeDisplay(`${time} GMT${sign}${offset} ${tz}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      // Redirect after successful sign out
      window.location.href = '/signin'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <header className="flex-shrink-0 py-6">
      <div className="w-full px-6">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-xs text-muted-foreground/60 font-mono tracking-wider">
              {timeDisplay}
            </div>
            <ThemeToggle />
            <Button 
              variant="dark" 
              size="xs" 
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}