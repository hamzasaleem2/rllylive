"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "sonner"
import { Check, X, Clock, Users, MessageSquare } from "lucide-react"

interface ApprovalRequestsDialogProps {
  eventId: string
  trigger: React.ReactNode
}

export function ApprovalRequestsDialog({ eventId, trigger }: ApprovalRequestsDialogProps) {
  const [open, setOpen] = useState(false)
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  
  const pendingRequests = useQuery(api.eventApprovals.getPendingApprovalRequests, { 
    eventId: eventId as any 
  })
  const approvalStats = useQuery(api.eventApprovals.getEventApprovalStats, { 
    eventId: eventId as any 
  })
  const reviewRequest = useMutation(api.eventApprovals.reviewApprovalRequest)

  const handleReview = async (requestId: string, action: "approve" | "reject") => {
    setReviewingRequest(requestId)
    try {
      await reviewRequest({
        requestId: requestId as any,
        action,
        reviewNotes: reviewNotes || undefined,
      })
      
      toast.success(`Request ${action}d successfully`)
      setReviewNotes("")
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} request`)
    } finally {
      setReviewingRequest(null)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approval Requests
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        {approvalStats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{approvalStats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvalStats.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{approvalStats.rejected}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{approvalStats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        <div className="space-y-4">
          {pendingRequests === undefined ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading requests...</div>
            </div>
          ) : pendingRequests?.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approval requests</p>
            </div>
          ) : (
            pendingRequests?.map((request) => (
              <Card key={request._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.user?.image} />
                      <AvatarFallback>
                        {getInitials(request.user?.name || request.user?.username || 'User')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {request.user?.name || request.user?.username || 'Unknown User'}
                        </h4>
                        <Badge variant="secondary">
                          {formatTimeAgo(request.requestedAt)}
                        </Badge>
                        {request.guestCount && request.guestCount > 0 && (
                          <Badge variant="outline">
                            +{request.guestCount} guest{request.guestCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {request.message && (
                        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Message:</span>
                          </div>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}

                      {/* Review Notes Input */}
                      <div className="mb-3">
                        <Textarea
                          placeholder="Optional review notes..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleReview(request._id, "approve")}
                          disabled={reviewingRequest === request._id}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {reviewingRequest === request._id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(request._id, "reject")}
                          disabled={reviewingRequest === request._id}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {reviewingRequest === request._id ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}