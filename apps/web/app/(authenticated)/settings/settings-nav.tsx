"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

interface SettingsNavProps {
  activeTab?: string
}

export function SettingsNav({ activeTab }: SettingsNavProps) {
  const pathname = usePathname()
  
  const isAccountActive = pathname === "/settings/account"
  const isNotificationsActive = pathname === "/settings/notifications"

  return (
    <div className="flex w-full gap-2">
      <Link
        href="/settings/account"
        className={cn(
          "flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1",
          isAccountActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Account
      </Link>
      <Link
        href="/settings/notifications"
        className={cn(
          "flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1",
          isNotificationsActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Notifications
      </Link>
    </div>
  )
} 