import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for Better Auth session cookies (optimistic check for performance)
  const sessionCookie = request.cookies.get('better-auth.session_token') || 
                        request.cookies.get('session') ||
                        request.cookies.get('better-auth.session')
  const isAuthenticated = !!sessionCookie
  
  // Home page logic
  if (pathname === "/") {
    if (isAuthenticated) {
      // Let the page component handle profile redirect
      return NextResponse.next()
    } else {
      // Redirect to signin
      return NextResponse.redirect(new URL("/signin", request.url))
    }
  }
  
  // Signin page logic
  if (pathname === "/signin") {
    if (isAuthenticated) {
      // Redirect authenticated users away from signin
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ["/signin"]
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith("/api") ||
                       pathname.startsWith("/user/") // Make all user profile pages public
  
  // Protected routes (anything not public)
  if (!isPublicRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}