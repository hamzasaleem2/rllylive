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
      const tz = now.toLocaleDateString('en', {
        day: '2-digit',
        timeZoneName: 'short',
      }).split(', ')[1]
      const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace('_', ' ')
      setTimeDisplay(`${time} ${tz} ${city}`)
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
            <a
              href="https://github.com/hamzasaleem2/rllylive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the rlly.live source code on GitHub"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:border-border/60 text-sm sm:text-base text-muted-foreground/90 hover:text-foreground bg-transparent hover:bg-muted/30 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-90"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.082-.73.082-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.833 2.807 1.304 3.492.997.108-.776.417-1.305.76-1.605-2.665-.303-5.466-1.335-5.466-5.932 0-1.31.468-2.382 1.235-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.804 5.625-5.476 5.922.43.37.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.293 0 .32.218.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.627 0 12 0z"/>
              </svg>
              <span className="font-medium">Proudly open source</span>
            </a>
            <Button variant="dark" size="sm" className="font-medium">
              <a href="https://app.rlly.live" target="_blank" rel="noopener noreferrer">Sign In</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}