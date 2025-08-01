"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"
import { UserPlus, Mail, MessageSquare } from "lucide-react"

interface InviteFriendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventName?: string
}

export function InviteFriendDialog({ 
  open, 
  onOpenChange, 
  eventId,
  eventName = "Event"
}: InviteFriendDialogProps) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    
    try {
      // For now, we'll just copy the invite link and show a success message
      // In the future, this could send an actual email invitation
      const inviteLink = `${window.location.origin}/events/${eventId}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink)
      
      toast.success(`Invite link copied to clipboard! Share it with ${email}`)
      
      // Reset form and close dialog
      setEmail("")
      setMessage("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to copy invite link:", error)
      toast.error("Failed to create invite. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEmail("")
    setMessage("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite a Friend
          </DialogTitle>
          <DialogDescription>
            Invite someone to {eventName}. We'll copy the event link to your clipboard so you can share it with them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Friend's Email
            </label>
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Personal Message (Optional)
            </label>
            <Textarea
              placeholder="Hey! I thought you'd be interested in this event..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Invite..." : "Copy Invite Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}