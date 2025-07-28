import type { Metadata } from "next"
import { SignInForm } from "./signin-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to rlly.live and create events that actually happen. Real-time RSVPs, live updates, and event management made simple.",
  robots: "noindex, nofollow",
}

export default function SignInPage() {
  return <SignInForm />
}