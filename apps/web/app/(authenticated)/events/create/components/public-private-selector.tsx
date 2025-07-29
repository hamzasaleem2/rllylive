"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"
import { Globe, Lock, ChevronDown, Check } from "lucide-react"

interface PublicPrivateSelectorProps {
  isPublic: boolean
  onVisibilityChange: (isPublic: boolean) => void
}

export function PublicPrivateSelector({ isPublic, onVisibilityChange }: PublicPrivateSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          {isPublic ? (
            <>
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </>
          )}
          <ChevronDown className="w-2 h-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuItem
          onClick={() => onVisibilityChange(true)}
          className="flex items-start gap-3 p-4 cursor-pointer"
        >
          <Globe className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">Public</span>
              {isPublic && <Check className="w-4 h-4" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Shown on your calendar and eligible to be featured.
            </p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onVisibilityChange(false)}
          className="flex items-start gap-3 p-4 cursor-pointer"
        >
          <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">Private</span>
              {!isPublic && <Check className="w-4 h-4" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Unlisted. Only people with the link can register.
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}