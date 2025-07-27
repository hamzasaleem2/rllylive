import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const spinnerVariants = cva(
  "relative inline-block",
  {
    variants: {
      size: {
        xs: "size-3",
        sm: "size-4", 
        default: "size-5",
        lg: "size-6",
        xl: "size-8",
      },
      variant: {
        default: "",
        light: "",
        primary: "",
        muted: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    default: "size-5", 
    lg: "size-6",
    xl: "size-8"
  }
  
  const colorClasses = {
    default: "border-gray-300 border-r-gray-700",
    light: "border-white/30 border-r-white",
    primary: "border-emerald-200 border-r-emerald-500", 
    muted: "border-gray-200 border-r-gray-400"
  }

  return (
    <div
      className={cn(spinnerVariants({ size, variant, className }))}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-solid border-transparent",
          sizeClasses[size || "default"],
          colorClasses[variant || "default"]
        )}
      />
    </div>
  )
}

export { Spinner, spinnerVariants }