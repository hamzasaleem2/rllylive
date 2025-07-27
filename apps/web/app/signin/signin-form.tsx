"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { Header } from "@/components/header"
import { authClient } from "@/lib/auth-client"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [step, setStep] = useState<"email" | "otp">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [googleLoading, setGoogleLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [step, resendTimer])

  useEffect(() => {
    if (error && otp.some(digit => digit !== "")) {
      setError("")
    }
  }, [otp, error])
  
  useEffect(() => {
    if (error) setError("")
  }, [email])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, "").slice(0, 6).split("")
      const newOtp = [...otp]
      pastedCode.forEach((digit, i) => {
        if (i + index < 6) newOtp[i + index] = digit
      })
      setOtp(newOtp)
      
      const nextIndex = Math.min(index + pastedCode.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handlePasteInInput = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const digits = pastedText.replace(/\D/g, "").slice(0, 6).split("")
    
    if (digits.length > 0) {
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (i + index < 6) newOtp[i + index] = digit
      })
      setOtp(newOtp)
      
      const nextIndex = Math.min(index + digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, "").slice(0, 6).split("")
      if (digits.length === 6) {
        setOtp(digits)
        otpRefs.current[5]?.focus()
      }
    } catch (err) {
      // Clipboard access failed
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setError("")
    await authClient.emailOtp.sendVerificationOtp(
      {
        email: email,
        type: "sign-in",
      },
      {
        onRequest: () => {
          setIsLoading(true)
        },
        onSuccess: () => {
          setIsLoading(false)
          setStep("otp")
          setResendTimer(60)
          setCanResend(false)
          setTimeout(() => otpRefs.current[0]?.focus(), 100)
        },
        onError: (ctx) => {
          setIsLoading(false)
          setError(ctx.error?.message || "Failed to send verification code. Please try again.")
        },
      }
    )
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length !== 6) return
    
    setError("")
    
    try {
      await authClient.signIn.emailOtp(
        {
          email: email,
          otp: otpCode,
        },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: () => {
            setIsLoading(false)
          },
          onError: (ctx) => {
            setIsLoading(false)
            
            let errorMessage = "Invalid verification code. Please try again."
            
            if (ctx?.response) {
              try {
                const errorText = (ctx as any).responseText
                if (errorText) {
                  const parsed = JSON.parse(errorText)
                  if (parsed.message) {
                    errorMessage = parsed.message
                  }
                }
              } catch (e) {
                // Failed to parse, continue to other methods
              }
            }
            
            if (errorMessage === "Invalid verification code. Please try again." && ctx?.error?.message) {
              errorMessage = ctx.error.message
            } else if (errorMessage === "Invalid verification code. Please try again." && typeof ctx?.error === "string") {
              errorMessage = ctx.error
            }
            
            setError(errorMessage)
            setOtp(["", "", "", "", "", ""])
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
          },
        }
      )
    } catch (error) {
      setIsLoading(false)
      setError("Invalid verification code. Please try again.")
      setOtp(["", "", "", "", "", ""])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return
    
    setError("")
    setCanResend(false)
    setResendTimer(60)
    
    await authClient.emailOtp.sendVerificationOtp(
      {
        email: email,
        type: "sign-in",
      },
      {
        onRequest: () => {
          setIsLoading(true)
        },
        onSuccess: () => {
          setIsLoading(false)
        },
        onError: (ctx) => {
          setIsLoading(false)
          setError(ctx.error?.message || "Failed to resend verification code.")
          setCanResend(true)
          setResendTimer(0)
        },
      }
    )
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setGoogleLoading(true)
    
    try {
      await authClient.signIn.social({
        provider: "google"
      }, {
        onSuccess: () => {
          setGoogleLoading(false)
        },
        onError: (ctx) => {
          setGoogleLoading(false)
          setError(ctx.error?.message || "Failed to sign in with Google. Please try again.")
        }
      })
    } catch (error) {
      setGoogleLoading(false)
      setError("Failed to sign in with Google. Please try again.")
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <div className="flex-1 flex items-start justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-sm space-y-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg">
          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl font-medium text-foreground">
              {step === "email" ? "Welcome to Rlly" : "Check your email"}
            </h1>
            <p className="text-muted-foreground text-base">
              {step === "email" 
                ? (
                  <>
                    Sign in or Sign up to create events that{" "}
                    <span className="text-foreground font-medium">actually happen</span>
                  </>
                )
                : (
                  <>
                    We sent a verification code to{" "}
                    <span className="text-foreground font-medium">{email}</span>
                  </>
                )
              }
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit"
                className="w-full" 
                size="default"
                disabled={isLoading || !email}
              >
{isLoading ? (
                  <>
                    <Spinner size="sm" variant="light" />
                    Sending...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Verification code
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePaste}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Paste
                  </Button>
                </div>
                
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => handlePasteInInput(e, index)}
                      className="w-12 h-12 text-center text-lg font-medium"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full" 
                size="default"
                disabled={isLoading || otp.join("").length !== 6}
              >
{isLoading ? (
                  <>
                    <Spinner size="sm" variant="light" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button 
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setOtp(["", "", "", "", "", ""])
                    setError("")
                    setCanResend(false)
                    setResendTimer(60)
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Use different email
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? "Resend code" : `Resend in ${resendTimer}s`}
                </button>
              </div>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground/60">
                or
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <>
                <Spinner size="sm" variant="default" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}