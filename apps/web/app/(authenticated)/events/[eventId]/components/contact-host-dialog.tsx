"use client"

import { useState } from "react"
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

interface ContactHostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hostName?: string
  userEmail?: string
}

export function ContactHostDialog({ 
  open, 
  onOpenChange, 
  hostName = "Event Host",
  userEmail = "hamzasaleembusiness@gmail.com" 
}: ContactHostDialogProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual email sending logic
      console.log("Contact host message:", {
        hostName,
        userEmail,
        message: message.trim()
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Message sent to host!")
      setMessage("")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setMessage("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact the Host</DialogTitle>
          <DialogDescription>
            Have a question about the event? You can send a message to the host.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What's your question for the host?
            </label>
            <Textarea
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            The host will send replies to {userEmail}.
          </div>

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
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}