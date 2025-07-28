"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { UserDropdown } from "./user-dropdown"
import { Button } from "@workspace/ui/components/button"
import { useAuthState } from "@/hooks/use-auth-state"

function BaseHeader({ children }: { children: React.ReactNode }) {
  const [timeDisplay, setTimeDisplay] = useState("")

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
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}

export function UnifiedHeader() {
  const { isAuthenticated } = useAuthState()
  
  // Don't render anything until we have an auth state (prevents flash)
  if (isAuthenticated === null) {
    return (
      <BaseHeader>
        <div className="w-[72px] h-[28px]" /> {/* Placeholder to prevent layout shift */}
      </BaseHeader>
    )
  }
  
  return (
    <BaseHeader>
      {isAuthenticated ? (
        <UserDropdown />
      ) : (
        <Button variant="dark" size="xs" className="cursor-pointer" asChild>
          <Link href="/signin">Sign In</Link>
        </Button>
      )}
    </BaseHeader>
  )
}