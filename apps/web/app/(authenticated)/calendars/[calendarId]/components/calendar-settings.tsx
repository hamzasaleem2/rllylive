"use client"

import { useState } from "react"
import React from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { 
  Settings, 
  Globe, 
  Lock, 
  Palette, 
  Info, 
  AlertTriangle,
  Trash2,
  Check,
  X,
  Loader2
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"

interface CalendarSettingsProps {
  calendarId: string
  calendar: any
}

const colorOptions = [
  { name: 'Gray', value: '#6b7280' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Rose', value: '#f43f5e' },
]

export function CalendarSettings({ calendarId, calendar }: CalendarSettingsProps) {
  const [activeSection, setActiveSection] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingUrl, setIsSavingUrl] = useState(false)
  const [isCheckingUrl, setIsCheckingUrl] = useState(false)
  const [urlStatus, setUrlStatus] = useState<{available: boolean, message: string} | null>(null)
  const [showUrlFeedback, setShowUrlFeedback] = useState(false)
  
  const [formData, setFormData] = useState({
    name: calendar?.name || '',
    description: calendar?.description || '',
    color: calendar?.color || '#3b82f6',
    publicUrl: calendar?.publicUrl || '',
    location: calendar?.location || '',
    isGlobal: calendar?.isGlobal || false,
  })

  // Update form data when calendar prop changes
  React.useEffect(() => {
    if (calendar) {
      setFormData(prev => ({
        name: calendar.name || '',
        description: calendar.description || '',
        color: calendar.color || '#3b82f6',
        publicUrl: calendar.publicUrl || '',
        location: calendar.location || '',
        isGlobal: calendar.isGlobal || false,
      }))
    }
  }, [calendar])


  const updateCalendar = useMutation(api.calendars.updateCalendar)
  const deleteCalendar = useMutation(api.calendars.deleteCalendar)
  const checkUrlAvailability = useQuery(api.calendars.checkPublicUrlAvailability, 
    formData.publicUrl && formData.publicUrl !== calendar.publicUrl && showUrlFeedback
      ? { publicUrl: formData.publicUrl }
      : "skip"
  )

  // Check URL availability when it changes
  React.useEffect(() => {
    if (checkUrlAvailability) {
      setUrlStatus(checkUrlAvailability)
      setIsCheckingUrl(false)
    }
  }, [checkUrlAvailability])

  const handleUrlChange = (value: string) => {
    setFormData({ ...formData, publicUrl: value })
    setShowUrlFeedback(true)
    if (value && value !== calendar.publicUrl) {
      setIsCheckingUrl(true)
      setUrlStatus(null)
    } else {
      setIsCheckingUrl(false)
      setUrlStatus(null)
    }
  }

  const handleSaveBasic = async () => {
    setIsSaving(true)
    try {
      await updateCalendar({
        calendarId: calendarId as any,
        name: formData.name,
        description: formData.description,
        location: formData.location,
      })
      toast.success("Basic info updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update basic info")
    } finally {
      setIsSaving(false)
    }
  }

  const handleColorChange = async (color: string) => {
    setFormData({ ...formData, color })
    try {
      await updateCalendar({
        calendarId: calendarId as any,
        color,
      })
      toast.success("Color updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update color")
    }
  }

  const handlePrivacyToggle = async (isGlobal: boolean) => {
    setFormData({ ...formData, isGlobal })
    try {
      await updateCalendar({
        calendarId: calendarId as any,
        isGlobal,
      })
      toast.success("Privacy updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update privacy")
    }
  }

  const handleUrlSave = async () => {
    setIsSavingUrl(true)
    try {
      await updateCalendar({
        calendarId: calendarId as any,
        publicUrl: formData.publicUrl || undefined,
      })
      toast.success("URL updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update URL")
    } finally {
      setIsSavingUrl(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCalendar({ calendarId: calendarId as any })
      toast.success("Calendar deleted")
      window.location.href = '/calendars'
    } catch (error: any) {
      toast.error(error.message || "Failed to delete calendar")
      setIsDeleting(false)
    }
  }

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "appearance", label: "Appearance" },
    { id: "privacy", label: "Privacy" },
    { id: "danger", label: "Danger Zone" },
  ]

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Calendar Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter calendar name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Default Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Default location for events"
        />
      </div>
      <Button variant="outline" size="sm" onClick={handleSaveBasic} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )

  const renderAppearance = () => (
    <div className="space-y-4">
      <Label>Tint Color</Label>
      <div className="flex flex-wrap gap-3">
        {colorOptions.map((color) => {
          const isSelected = formData.color === color.value
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorChange(color.value)}
              className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                isSelected
                  ? "ring-2 ring-live-green" 
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          )
        })}
      </div>
    </div>
  )

  const renderPrivacy = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="isGlobal">Public Calendar</Label>
          <p className="text-xs text-muted-foreground">
            {formData.isGlobal ? "Anyone can discover this calendar" : "Only people with link can access"}
          </p>
        </div>
        <Switch
          id="isGlobal"
          checked={formData.isGlobal}
          onCheckedChange={handlePrivacyToggle}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="publicUrl">Custom URL</Label>
        <div className="relative">
          <div className={`flex items-center gap-2 p-3 bg-muted/30 rounded-lg border ${
            urlStatus?.available && showUrlFeedback
              ? 'border-green-500' 
              : urlStatus && !urlStatus.available && showUrlFeedback
              ? 'border-red-500'
              : 'border-border'
          }`}>
            <span className="text-base text-muted-foreground font-mono">rlly.live/cal/</span>
            <Input
              id="publicUrl"
              placeholder=""
              value={formData.publicUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-base pr-16"
            />
            <div className="flex items-center space-x-2">
              {isCheckingUrl && showUrlFeedback && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {urlStatus && !isCheckingUrl && showUrlFeedback && (
                <>
                  {urlStatus.available ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </>
              )}
              {formData.publicUrl !== (calendar.publicUrl || '') && urlStatus?.available && (
                <button
                  onClick={handleUrlSave}
                  disabled={isSavingUrl}
                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  {isSavingUrl ? (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {urlStatus && showUrlFeedback && (
          <p className={`text-sm ${
            urlStatus.available ? 'text-green-600' : 'text-red-600'
          }`}>
            {urlStatus.message}
          </p>
        )}
      </div>
    </div>
  )

  const renderDangerZone = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-red-600">Delete Calendar</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Permanently delete this calendar and all events. This cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Calendar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{calendar.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the calendar and all its events. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Calendar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "basic": return renderBasicInfo()
      case "appearance": return renderAppearance()
      case "privacy": return renderPrivacy()
      case "danger": return renderDangerZone()
      default: return renderBasicInfo()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full px-3 py-2 text-sm rounded-lg transition-colors text-left
                ${activeSection === section.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}