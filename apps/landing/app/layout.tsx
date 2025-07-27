import type { Metadata } from "next"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import {
  JetBrains_Mono,
  Instrument_Sans,
  Bricolage_Grotesque,
} from "next/font/google"

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

export const metadata: Metadata = {
  title: "rlly.live - Real-time events, really simple",
  description: "Create beautiful event pages, send smart invitations, and watch your guest list update in real-time. The modern event platform that actually works.",
  keywords: ["events", "real-time", "event management", "invitations", "RSVP"],
  authors: [{ name: "rlly.live" }],
  openGraph: {
    title: "rlly.live - Real-time events, really simple",
    description: "The modern event platform that actually works.",
    type: "website",
    url: "https://rlly.live",
  },
  twitter: {
    card: "summary_large_image",
    title: "rlly.live - Real-time events, really simple",
    description: "The modern event platform that actually works.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}