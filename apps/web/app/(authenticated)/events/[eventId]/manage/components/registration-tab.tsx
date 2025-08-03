"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { ApprovalRequestsDialog } from "../../components/approval-requests-dialog"
import { Clock, AlertCircle, CheckCircle } from "lucide-react"

interface RegistrationTabProps {
  event: any
}

export function RegistrationTab({ event }: RegistrationTabProps) {
  const approvalStats = useQuery(api.eventApprovals.getEventApprovalStats, { eventId: event._id })
  const rsvpSummary = useQuery(api.eventRSVPs.getEventRSVPSummary, { eventId: event._id })

  const totalRegistered = (rsvpSummary?.going || 0) + (rsvpSummary?.maybe || 0)
  const capacityUsed = event.hasCapacityLimit ? (totalRegistered / event.capacity) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Registration Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Event Visibility</span>
              <Badge variant={event.isPublic ? "default" : "secondary"}>
                {event.isPublic ? "Public" : "Private"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Requires Approval</span>
              <Badge variant={event.requiresApproval ? "destructive" : "secondary"}>
                {event.requiresApproval ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Capacity Limit</span>
              <Badge variant={event.hasCapacityLimit ? "outline" : "secondary"}>
                {event.hasCapacityLimit ? `${event.capacity} max` : "Unlimited"}
              </Badge>
            </div>

            {event.hasCapacityLimit && event.waitingList && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Waiting List</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Registered Guests</span>
                <span>{totalRegistered}</span>
              </div>
              {event.hasCapacityLimit && (
                <>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(capacityUsed, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{capacityUsed.toFixed(0)}% full</span>
                    <span>{event.capacity - totalRegistered} spots left</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {rsvpSummary?.going || 0}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Going</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                  {rsvpSummary?.maybe || 0}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Maybe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Management */}
      {event.requiresApproval && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {approvalStats.pending}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {approvalStats.approved}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {approvalStats.rejected}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">
                    {approvalStats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-4 rounded-lg bg-muted animate-pulse">
                    <div className="h-8 bg-muted-foreground/20 rounded mb-2"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Pending Approval Requests</h3>
                <p className="text-sm text-muted-foreground">
                  {approvalStats?.pending || 0} requests waiting for your review
                </p>
              </div>
              <ApprovalRequestsDialog
                eventId={event._id}
                trigger={
                  <Button className="cursor-pointer">
                    Review Requests
                    {approvalStats?.pending && approvalStats.pending > 0 && (
                      <Badge className="ml-2 bg-yellow-500">{approvalStats.pending}</Badge>
                    )}
                  </Button>
                }
              />
            </div>

            {approvalStats?.pending === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>All caught up! No pending approval requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Capacity Management */}
      {event.hasCapacityLimit && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="font-medium">Event Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  {totalRegistered} of {event.capacity} spots filled
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {event.capacity - totalRegistered}
                </div>
                <div className="text-sm text-muted-foreground">spots left</div>
              </div>
            </div>

            {capacityUsed > 80 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Almost full!</strong> Only {event.capacity - totalRegistered} spots remaining.
                </div>
              </div>
            )}

            {event.waitingList && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Waiting List</h3>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  When capacity is reached, new registrations will be added to a waiting list.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}