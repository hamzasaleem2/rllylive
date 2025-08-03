"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { ArrowLeft, Upload, X } from "lucide-react"
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize"

interface EditEventFormProps {
  event: any
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    startTime: "",
    endTime: "",
    timezone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: event.location || "",
    ticketType: event.ticketType || "free",
    ticketPrice: event.ticketPrice || 0,
    ticketName: event.ticketName || "",
    ticketDescription: event.ticketDescription || "",
    requiresApproval: event.requiresApproval || false,
    hasCapacityLimit: event.hasCapacityLimit || false,
    capacity: event.capacity || 50,
    waitingList: event.waitingList || false,
    isPublic: event.isPublic ?? true,
  })

  // Convert timestamps to datetime-local format on mount
  useEffect(() => {
    if (event.startTime && event.endTime) {
      const startDate = new Date(event.startTime)
      const endDate = new Date(event.endTime)
      
      setFormData(prev => ({
        ...prev,
        startTime: startDate.toISOString().slice(0, 16),
        endTime: endDate.toISOString().slice(0, 16),
      }))
    }
  }, [event.startTime, event.endTime])

  const updateEvent = useMutation(api.events.updateEvent)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Event name is required")
      return
    }
    
    if (!formData.startTime || !formData.endTime) {
      toast.error("Start and end times are required")
      return
    }
    
    const startTime = new Date(formData.startTime).getTime()
    const endTime = new Date(formData.endTime).getTime()
    
    if (startTime >= endTime) {
      toast.error("End time must be after start time")
      return
    }

    setIsSubmitting(true)
    try {
      // Sanitize inputs before sending to backend
      const sanitizedData = {
        name: sanitizeText(formData.name),
        description: formData.description ? sanitizeText(formData.description) : undefined,
        location: formData.location ? sanitizeText(formData.location) : undefined,
        ticketName: formData.ticketName ? sanitizeText(formData.ticketName) : undefined,
        ticketDescription: formData.ticketDescription ? sanitizeText(formData.ticketDescription) : undefined,
      }
      
      await updateEvent({
        eventId: event._id,
        name: sanitizedData.name,
        description: sanitizedData.description,
        startTime,
        endTime,
        timezone: formData.timezone,
        location: sanitizedData.location,
        ticketType: formData.ticketType as "free" | "paid",
        ticketPrice: formData.ticketType === "paid" ? formData.ticketPrice : undefined,
        ticketName: sanitizedData.ticketName,
        ticketDescription: sanitizedData.ticketDescription,
        requiresApproval: formData.requiresApproval,
        hasCapacityLimit: formData.hasCapacityLimit,
        capacity: formData.hasCapacityLimit ? formData.capacity : undefined,
        waitingList: formData.hasCapacityLimit ? formData.waitingList : undefined,
        isPublic: formData.isPublic,
      })
      
      toast.success("Event updated successfully")
      router.push(`/events/${event._id}`)
    } catch (error) {
      console.error("Failed to update event:", error)
      toast.error("Failed to update event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Event</h1>
          <p className="text-muted-foreground">Make changes to your event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter event name"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your event..."
                  rows={4}
                  maxLength={1000}
                />
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Time</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Karachi">Pakistan (PKT)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter event location or virtual link"
              />
            </div>

            <Separator />

            {/* Ticket Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ticket Settings</h3>
              
              <div>
                <Label>Ticket Type</Label>
                <Select value={formData.ticketType} onValueChange={(value) => handleInputChange("ticketType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.ticketType === "paid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketPrice">Price ($)</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange("ticketPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ticketName">Ticket Name</Label>
                    <Input
                      id="ticketName"
                      value={formData.ticketName}
                      onChange={(e) => handleInputChange("ticketName", e.target.value)}
                      placeholder="e.g., General Admission"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Capacity Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Capacity Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasCapacityLimit"
                  checked={formData.hasCapacityLimit}
                  onCheckedChange={(checked) => handleInputChange("hasCapacityLimit", checked)}
                />
                <Label htmlFor="hasCapacityLimit">Limit number of attendees</Label>
              </div>

              {formData.hasCapacityLimit && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="capacity">Maximum Attendees</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 50)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="waitingList"
                      checked={formData.waitingList}
                      onCheckedChange={(checked) => handleInputChange("waitingList", checked)}
                    />
                    <Label htmlFor="waitingList">Enable waiting list when full</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Privacy Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => handleInputChange("requiresApproval", checked)}
                />
                <Label htmlFor="requiresApproval">Require approval for registration</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Make event publicly visible</Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}