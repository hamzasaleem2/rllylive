"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"

interface ReportEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName?: string
}

export function ReportEventDialog({ 
  open, 
  onOpenChange, 
  eventId,
  eventName = "Event" 
}: ReportEventDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const reportEvent = useMutation(api.eventReports.reportEvent)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting")
      return
    }

    setIsSubmitting(true)
    
    try {
      await reportEvent({
        eventId: eventId as any,
        reason: reason.trim(),
      })
      
      toast.success("Report submitted. Thank you for helping keep our platform safe.")
      setReason("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit report:", error)
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Event</DialogTitle>
          <DialogDescription>
            Please share more information about why you are reporting this event.
            <br /><br />
            Any information you can share will be very helpful.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Please describe the issue with this event..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              variant="destructive"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}