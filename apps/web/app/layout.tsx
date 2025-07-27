import {
  JetBrains_Mono,
  Instrument_Sans,
  Bricolage_Grotesque,
} from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
