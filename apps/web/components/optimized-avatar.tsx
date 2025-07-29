"use client"

import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

interface OptimizedAvatarProps {
  src?: string | null
  alt: string
  fallback: React.ReactNode
  className?: string
  size?: number
}

export function OptimizedAvatar({ 
  src, 
  alt, 
  fallback, 
  className,
  size = 32
}: OptimizedAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!src || imageError) {
    return (
      <Avatar className={className}>
        <AvatarFallback>
          {fallback}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={className}>
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className={cn(
            "object-cover rounded-full transition-opacity duration-200",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
          priority={size > 64} // Prioritize larger avatars
        />
        {imageLoading && (
          <AvatarFallback className="absolute inset-0">
            {fallback}
          </AvatarFallback>
        )}
      </div>
    </Avatar>
  )
}