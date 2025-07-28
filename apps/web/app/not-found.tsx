"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Home, ArrowLeft, Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className="font-display text-8xl font-bold bg-gradient-to-r from-live-green to-primary bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Main message */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Oops
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Looks like you're looking for something that didn't happen yet... 
            or maybe it was too exclusive? 🤔
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-live-green/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-delayed-2" />
      </div>
    </div>
  )
}