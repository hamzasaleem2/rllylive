"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { UserDropdown } from "./user-dropdown"
import { Button } from "@workspace/ui/components/button"
import { useAuthState } from "@/hooks/use-auth-state"
import { Calendar, Users } from "lucide-react"

function MainNavigation() {
  const pathname = usePathname()
  
  const navItems = [
    { name: "Events", href: "/events", icon: Users },
    { name: "Calendars", href: "/calendars", icon: Calendar },
  ]

  return (
    <nav className="flex items-center space-x-2 sm:space-x-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center text-sm font-medium transition-colors p-1.5 sm:p-2 rounded-md ${
              isActive
                ? "text-foreground bg-muted/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
            title={item.name}
          >
            <item.icon className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function BaseHeader({ children }: { children: React.ReactNode }) {
  const [timeDisplay, setTimeDisplay] = useState("")
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuthState()

  useEffect(() => {
    setMounted(true)
    
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
    <header className="flex-shrink-0 py-6">
      <div className="w-full px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Left: Logo */}
          <Logo />
          
          {/* Center: Navigation - only when authenticated */}
          <div className="flex justify-center lg:justify-start">
            {isAuthenticated && (
              <div className="w-full max-w-4xl flex justify-start px-6">
                <MainNavigation />
              </div>
            )}
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {mounted && (
              <div className="hidden lg:flex items-center text-xs text-muted-foreground/60 font-mono tracking-wider">
                {timeDisplay}
              </div>
            )}
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
        <>
          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
            <Link href="/events/create">
              Create Event
            </Link>
          </Button>
          <UserDropdown />
        </>
      ) : (
        <Button variant="dark" size="xs" className="cursor-pointer" asChild>
          <Link href="/signin">Sign In</Link>
        </Button>
      )}
    </BaseHeader>
  )
}