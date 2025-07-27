"use client"

import { IconScene } from "./icon-scene"

export function Hero() {
  return (
    <section className="flex-1 bg-background subtle-grid">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Side - Branding */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:pl-16 lg:pr-8 py-20 sm:py-24 lg:py-0">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-foreground mb-6 lg:mb-8 leading-[0.95]">
              Events that
              <br />
              <span className="font-medium bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">actually happen</span>
            </h1>
            
            <p className="font-sans text-xl sm:text-2xl lg:text-2xl text-muted-foreground leading-relaxed mb-6 lg:mb-8 font-normal">
              No more ghost RSVPs. No more confusion. 
              <br className="hidden sm:block" />
              Just real people, real events, <span className="font-medium text-foreground">really simple</span>.
            </p>

            <div className="flex items-center justify-center lg:justify-start space-x-3 text-sm text-muted-foreground font-sans font-medium">
              <div className="w-2 h-2 bg-live-green rounded-full pulse-green"></div>
              <span className="tracking-wide">Live updates • Real-time RSVPs • Actually works</span>
            </div>
          </div>
        </div>

        {/* Right Side - 3D Icon Scene */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:pr-16 lg:pl-8 py-8 lg:py-0">
          <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] relative">
            <IconScene />
          </div>
        </div>
      </div>
    </section>
  )
}