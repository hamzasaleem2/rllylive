"use client"

import Link from "next/link"
import { useQuery } from "convex-helpers/react/cache/hooks"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { authClient } from "@/lib/auth-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Separator } from "@workspace/ui/components/separator"
import { User, Settings, LogOut } from "lucide-react"

export function UserDropdown() {
  const currentUser = useQuery(api.auth.getCurrentUser)
  const profileIdentifier = useQuery(api.auth.getProfileIdentifier, { 
    userId: currentUser?._id as any 
  })

  if (!currentUser) return null

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      window.location.href = '/signin'
    } catch {
      // Fallback: still redirect even if signOut fails
      window.location.href = '/signin'
    }
  }

  const initials = currentUser.name 
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : currentUser.username?.[0]?.toUpperCase() || '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group cursor-pointer">
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-live-green/30 transition-all duration-200 group-hover:scale-105">
              <AvatarImage 
                src={currentUser.image || undefined} 
                alt={currentUser.name || currentUser.username || "User"} 
              />
              <AvatarFallback className="bg-gradient-to-br from-live-green/20 to-primary/20 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-live-green/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
            
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
        sideOffset={8}
      >
        {/* User Info Section */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={currentUser.image || undefined} 
                alt={currentUser.name || currentUser.username || "User"} 
              />
              <AvatarFallback className="bg-gradient-to-br from-live-green/20 to-primary/20 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground truncate">
                  {currentUser.name || currentUser.username || "User"}
                </p>
              </div>
              {currentUser.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link 
              href={`/user/${profileIdentifier || currentUser.rllyId}`}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">View Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link 
              href="/settings/account"
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <Separator className="bg-border/50" />

        {/* Sign Out */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}