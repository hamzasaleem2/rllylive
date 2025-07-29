"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { Toaster } from "@workspace/ui/components";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          <ConvexQueryCacheProvider>
            {children}
            <Toaster/>
          </ConvexQueryCacheProvider>
      </ConvexBetterAuthProvider>
    </NextThemesProvider>
  )
}
