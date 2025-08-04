import type { Metadata } from "next"
import {
  JetBrains_Mono,
  Instrument_Sans,
  Bricolage_Grotesque,
} from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { UnifiedHeader } from "@/components/unified-header"

export const metadata: Metadata = {
  title: {
    template: "%s | rlly.live",
    default: "app.rlly.live - Create events that actually happen"
  },
  description: "Create events that actually happen. Real-time RSVPs, live updates, and event management made simple.",
  keywords: ["events", "RSVP", "party planning", "event management", "social"],
  authors: [{ name: "rlly.live" }],
  creator: "rlly.live",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.rlly.live",
    siteName: "rlly.live",
    title: "rlly.live - Create events that actually happen",
    description: "Create events that actually happen. Real-time RSVPs, live updates, and event management made simple.",
  },
  twitter: {
    card: "summary_large_image",
    title: "rlly.live - Create events that actually happen",
    description: "Create events that actually happen. Real-time RSVPs, live updates, and event management made simple.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

// Monospace for logo and accents
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
})

// Clean sans-serif for body text
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
})

// Display font for headings - unique and elegant
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}
      >
        <Providers>
          <UnifiedHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
