"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
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
      setTimeDisplay(`${time} UTC${sign}${offset} ${tz}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-background flex-shrink-0 py-6">
      <div className="w-full px-6">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-xs text-muted-foreground/60 font-mono tracking-wider">
              {timeDisplay}
            </div>
            <ThemeToggle />
            <Button variant="dark" size="xs" className="cursor-pointer">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}