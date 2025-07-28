"use client"

import { useQuery } from "convex-helpers/react/cache/hooks"
import { api } from "@workspace/backend/convex/_generated/api.js"

interface AuthState {
  isAuthenticated: boolean | null // null = loading
  user: any
}

export function useAuthState(): AuthState {
  const currentUser = useQuery(api.auth.getCurrentUser)
  
  return {
    isAuthenticated: currentUser !== undefined ? currentUser !== null : null,
    user: currentUser
  }
}