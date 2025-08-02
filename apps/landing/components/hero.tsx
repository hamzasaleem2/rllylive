"use client"

import { Button } from "@workspace/ui/components/button"
import { IconScene } from "./icon-scene"

export function Hero() {
  return (
    <section className="flex-1 bg-background subtle-grid">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Side - Branding */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:pl-16 lg:pr-8 py-20 sm:py-24 lg:py-0">
          <div className="max-w-xl text-center lg:text-left">
            <div className="mb-4 lg:mb-6">
              <a 
                href="https://www.convex.dev/hackathons/resend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 text-muted-foreground/80 hover:text-foreground transition-all duration-300 group bg-muted/30 hover:bg-muted/50 rounded-full px-4 py-2 border border-border/30 hover:border-border/60 relative overflow-hidden"
              >
                <div className="flex items-center space-x-2">
                  {/* Convex Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 184 188" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M108.092 130.021C126.258 128.003 143.385 118.323 152.815 102.167C148.349 142.128 104.653 167.385 68.9858 151.878C65.6992 150.453 62.8702 148.082 60.9288 145.034C52.9134 132.448 50.2786 116.433 54.0644 101.899C64.881 120.567 86.8748 132.01 108.092 130.021Z" fill="#F3B01C"/>
                      <path d="M53.4012 90.1735C46.0375 107.191 45.7186 127.114 54.7463 143.51C22.9759 119.608 23.3226 68.4578 54.358 44.7949C57.2286 42.6078 60.64 41.3097 64.2178 41.1121C78.9312 40.336 93.8804 46.0225 104.364 56.6193C83.0637 56.831 62.318 70.4756 53.4012 90.1735Z" fill="#8D2676"/>
                      <path d="M114.637 61.8552C103.89 46.8701 87.0686 36.6684 68.6387 36.358C104.264 20.1876 148.085 46.4045 152.856 85.1654C153.3 88.7635 152.717 92.4322 151.122 95.6775C144.466 109.195 132.124 119.679 117.702 123.559C128.269 103.96 126.965 80.0151 114.637 61.8552Z" fill="#EE342F"/>
                    </svg>
                  </div>
                  
                  {/* Resend Icon */}
                  <div className="w-12 h-6 flex items-center justify-center">
                    <svg width="48" height="10" viewBox="0 0 1978 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:hidden">
                      <path d="M543.803 118.321C633.178 118.321 698.215 180.419 693.6 293.286H475.948C484.076 324.654 505.791 351.608 549.257 351.608C573.594 351.608 595.833 344.895 612.617 323.916H687.726L686.467 330.629C673.459 388.112 608.001 420 549.257 420C456.106 420 393.585 357.062 393.585 269.37C393.585 181.678 456.106 118.321 543.803 118.321ZM1173.62 118.321C1263.42 118.321 1328.04 180.419 1323.84 293.286H1106.13C1114.16 324.654 1135.72 351.608 1179.5 351.608C1203.84 351.608 1226.07 344.895 1242.44 323.916H1317.97L1316.71 330.629C1303.7 388.111 1238.24 420 1179.5 420C1086.35 420 1023.83 357.063 1023.83 269.37C1023.83 181.678 1086.35 118.321 1173.62 118.321ZM1978 411.609H1896.6L1900.79 370.91C1889.46 395.246 1852.96 419.162 1807.22 419.162C1731.69 419.162 1670.43 361.26 1670.43 269.791C1670.43 178.322 1730.85 120.42 1807.22 120.42C1848.76 120.42 1874.36 133.847 1897.02 156.924V0H1978V411.609ZM853.47 116.644C919.767 116.644 978.091 140.559 994.875 199.301L996.554 205.595H913.892C896.268 183.777 872.771 180.839 853.47 180.839C835.427 180.839 806.894 185.455 806.894 203.077C806.894 219.441 825.776 224.895 842.141 226.993L889.975 232.028C965.922 238.742 999.491 268.532 999.491 326.854C999.491 393.986 932.774 419.161 866.896 419.161C801.019 419.161 732.624 389.79 719.616 330.21L718.357 323.916H803.117C814.866 357.483 868.994 354.965 866.896 354.965C898.786 354.965 918.508 345.315 918.508 329.79C918.508 319.72 915.15 307.972 882.422 303.776L832.489 298.741C766.612 294.126 726.75 259.3 726.75 207.272C726.75 143.496 787.173 116.644 853.47 116.644ZM251.761 0C331.485 0 378.9 47.4126 378.9 110.35C378.9 173.287 331.485 220.7 251.761 220.7H211.479L411.629 411.609H270.224L117.908 266.854C106.999 256.784 101.963 245.036 101.963 234.966C101.963 220.7 112.034 208.113 131.335 202.658L209.801 181.679C239.592 173.707 260.153 150.63 260.153 120.42C260.153 83.4968 229.941 62.0977 192.597 62.0977H0V0H251.761ZM1520.63 118.74C1591.97 118.74 1641.9 170.768 1641.9 245.034V411.608H1560.5V258.88C1560.5 216.922 1538.26 191.747 1498.81 191.747C1459.37 191.747 1433.78 217.761 1433.78 258.88V411.608H1354.05V124.614H1435.04L1431.26 170.349C1443.01 147.272 1479.51 118.74 1520.63 118.74ZM1826.52 191.749C1777.43 191.749 1751.42 228.252 1751.42 269.791C1751.42 314.266 1780.79 348.252 1826.52 348.252C1870.58 348.252 1899.11 313.847 1899.11 269.791C1899.11 225.735 1871.42 191.749 1826.52 191.749ZM543.803 183.355C504.138 183.355 481.475 207.041 474.442 238.74H611.728C610.893 235.09 609.818 231.188 608.421 226.992C598.35 198.461 574.853 183.356 543.803 183.355ZM1173.62 183.355C1134.3 183.356 1111.7 207.041 1104.68 238.74H1241.97C1241.13 235.09 1240.06 231.188 1238.66 226.992C1228.59 198.461 1205.09 183.355 1173.62 183.355Z" fill="black"/>
                    </svg>
                    <svg width="48" height="10" viewBox="0 0 1978 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden dark:block">
                      <path d="M543.803 118.321C633.178 118.321 698.215 180.419 693.6 293.286H475.948C484.076 324.654 505.791 351.608 549.257 351.608C573.594 351.608 595.833 344.895 612.617 323.916H687.726L686.467 330.629C673.459 388.112 608.001 420 549.257 420C456.106 420 393.585 357.062 393.585 269.37C393.585 181.678 456.106 118.321 543.803 118.321ZM1173.62 118.321C1263.42 118.321 1328.04 180.419 1323.84 293.286H1106.13C1114.16 324.654 1135.72 351.608 1179.5 351.608C1203.84 351.608 1226.07 344.895 1242.44 323.916H1317.97L1316.71 330.629C1303.7 388.111 1238.24 420 1179.5 420C1086.35 420 1023.83 357.063 1023.83 269.37C1023.83 181.678 1086.35 118.321 1173.62 118.321ZM1978 411.609H1896.6L1900.79 370.91C1889.46 395.246 1852.96 419.162 1807.22 419.162C1731.69 419.162 1670.43 361.26 1670.43 269.791C1670.43 178.322 1730.85 120.42 1807.22 120.42C1848.76 120.42 1874.36 133.847 1897.02 156.924V0H1978V411.609ZM853.47 116.644C919.767 116.644 978.091 140.559 994.875 199.301L996.554 205.595H913.892C896.268 183.777 872.771 180.839 853.47 180.839C835.427 180.839 806.894 185.455 806.894 203.077C806.894 219.441 825.776 224.895 842.141 226.993L889.975 232.028C965.922 238.742 999.491 268.532 999.491 326.854C999.491 393.986 932.774 419.161 866.896 419.161C801.019 419.161 732.624 389.79 719.616 330.21L718.357 323.916H803.117C814.866 357.483 868.994 354.965 866.896 354.965C898.786 354.965 918.508 345.315 918.508 329.79C918.508 319.72 915.15 307.972 882.422 303.776L832.489 298.741C766.612 294.126 726.75 259.3 726.75 207.272C726.75 143.496 787.173 116.644 853.47 116.644ZM251.761 0C331.485 0 378.9 47.4126 378.9 110.35C378.9 173.287 331.485 220.7 251.761 220.7H211.479L411.629 411.609H270.224L117.908 266.854C106.999 256.784 101.963 245.036 101.963 234.966C101.963 220.7 112.034 208.113 131.335 202.658L209.801 181.679C239.592 173.707 260.153 150.63 260.153 120.42C260.153 83.4968 229.941 62.0977 192.597 62.0977H0V0H251.761ZM1520.63 118.74C1591.97 118.74 1641.9 170.768 1641.9 245.034V411.608H1560.5V258.88C1560.5 216.922 1538.26 191.747 1498.81 191.747C1459.37 191.747 1433.78 217.761 1433.78 258.88V411.608H1354.05V124.614H1435.04L1431.26 170.349C1443.01 147.272 1479.51 118.74 1520.63 118.74ZM1826.52 191.749C1777.43 191.749 1751.42 228.252 1751.42 269.791C1751.42 314.266 1780.79 348.252 1826.52 348.252C1870.58 348.252 1899.11 313.847 1899.11 269.791C1899.11 225.735 1871.42 191.749 1826.52 191.749ZM543.803 183.355C504.138 183.355 481.475 207.041 474.442 238.74H611.728C610.893 235.09 609.818 231.188 608.421 226.992C598.35 198.461 574.853 183.356 543.803 183.355ZM1173.62 183.355C1134.3 183.356 1111.7 207.041 1104.68 238.74H1241.97C1241.13 235.09 1240.06 231.188 1238.66 226.992C1228.59 198.461 1205.09 183.355 1173.62 183.355Z" fill="#FDFDFD"/>
                    </svg>
                  </div>
                </div>
                
                <span className="font-serif text-sm italic tracking-wide">
                  Powered by Convex & Resend
                </span>
                
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-live-green rounded-full animate-pulse"></div>
                </div>
                
                {/* Resend light effect - diffused blast traveling to arrow */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/6 to-transparent blur-sm transform -translate-x-20 group-hover:translate-x-[calc(100%-1rem)] transition-transform duration-500 ease-out"></div>
                </div>
              </a>
            </div>
            
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

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-3 mb-8">
              <Button size="lg" className="font-medium">
                Start Planning Events
              </Button>
              <Button variant="outline" size="lg" className="font-medium">
                See How It Works
              </Button>
            </div>

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