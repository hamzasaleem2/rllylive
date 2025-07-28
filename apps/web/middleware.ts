import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for session cookie (optimistic check for performance)
  const sessionCookie = request.cookies.get('better-auth.session_token')
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
  
  // Protected routes (anything not signin or api)
  if (!pathname.startsWith("/api") && pathname !== "/signin") {
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