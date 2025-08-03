"use client"

import React from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Something went wrong</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            {this.state.error && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex space-x-2">
              <Button onClick={this.resetError} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} size="sm">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught:', error, errorInfo)
    throw error
  }
}