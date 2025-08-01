"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"

interface CancelRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName?: string
  onCancelled?: () => void
}

export function CancelRegistrationDialog({ 
  open, 
  onOpenChange, 
  eventId,
  eventName = "Event",
  onCancelled
}: CancelRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const removeRSVP = useMutation(api.eventRSVPs.removeRSVP)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    
    try {
      await removeRSVP({ eventId: eventId as any })
      
      toast.success("Registration cancelled. The host has been notified.")
      onCancelled?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to cancel registration:", error)
      toast.error("Failed to cancel registration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismiss = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Registration</DialogTitle>
          <DialogDescription>
            Click on the confirm button below to cancel your registration. We'll let the host know that you can't make it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            Dismiss
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}