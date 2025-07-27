import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: "noindex, nofollow", // Authenticated pages shouldn't be indexed
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* TODO: Add shared authenticated UI like navigation, sidebar, etc. */}
      {children}
    </>
  )
}