"use client"

import Image from "next/image"

export function IconScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main Calendar - Responsive sizing and positioning */}
      <div className="relative z-10 translate-x-0 sm:-translate-x-4 lg:-translate-x-8 translate-y-2 lg:translate-y-4">
        <div className="animate-float">
          <Image
            src="/assets/calendar-dynamic-clay.png"
            alt="Calendar"
            width={100}
            height={100}
            className="sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

      {/* Mobile-spaced icon arrangement */}
      
      {/* Top right - conversation theme */}
      <div className="absolute top-6 sm:top-8 lg:top-12 right-4 sm:right-8 lg:right-16 z-8">
        <div className="animate-float-delayed-1">
          <Image
            src="/assets/girl-dynamic-clay.png"
            alt="Person"
            width={45}
            height={45}
            className="opacity-90 sm:w-[65px] sm:h-[65px] lg:w-[75px] lg:h-[75px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

      <div className="absolute top-20 sm:top-14 lg:top-20 right-16 sm:right-20 lg:right-32 z-7">
        <div className="animate-float-delayed-2">
          <Image
            src="/assets/chat-text-dynamic-clay.png"
            alt="Chat"
            width={40}
            height={40}
            className="opacity-85 sm:w-[55px] sm:h-[55px] lg:w-[65px] lg:h-[65px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

      {/* Left side - planning theme with more space */}
      <div className="absolute left-2 sm:left-6 lg:left-12 top-1/4 sm:top-1/3 z-6">
        <div className="animate-float-delayed-3">
          <Image
            src="/assets/clock-dynamic-clay.png"
            alt="Time"
            width={42}
            height={42}
            className="opacity-80 sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

      <div className="absolute left-8 sm:left-3 lg:left-6 top-2/3 sm:top-1/2 sm:translate-y-4 lg:translate-y-8 z-5">
        <div className="animate-float-delayed-4">
          <Image
            src="/assets/location-dynamic-clay.png"
            alt="Location"
            width={38}
            height={38}
            className="opacity-75 sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

      {/* Bottom right - Boy with umbrella, more spread out */}
      <div className="absolute bottom-8 sm:bottom-12 lg:bottom-20 right-8 sm:right-6 lg:right-12 z-8">
        {/* Boy */}
        <div className="animate-float-delayed-5">
          <Image
            src="/assets/boy-dynamic-clay.png"
            alt="Person"
            width={48}
            height={48}
            className="opacity-90 sm:w-[70px] sm:h-[70px] lg:w-[80px] lg:h-[80px]"
            quality={100}
            unoptimized
          />
        </div>
        {/* Umbrella positioned clearly above boy with gap */}
        <div className="absolute -top-12 sm:-top-12 lg:-top-16 left-1 sm:left-1.5 lg:left-2 z-9">
          <div className="animate-float-delayed-5">
            <Image
              src="/assets/umbrella-dynamic-clay.png"
              alt="Weather"
              width={44}
              height={44}
              className="opacity-85 sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px]"
              quality={100}
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Notification bell - better spacing */}
      <div className="absolute top-4 sm:top-8 lg:top-16 left-1/3 sm:left-1/4 z-6">
        <div className="animate-float-delayed-7">
          <Image
            src="/assets/bell-dynamic-clay.png"
            alt="Notifications"
            width={32}
            height={32}
            className="opacity-75 sm:w-[42px] sm:h-[42px] lg:w-[50px] lg:h-[50px]"
            quality={100}
            unoptimized
          />
        </div>
      </div>

    </div>
  )
}