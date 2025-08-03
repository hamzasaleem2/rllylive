"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { ArrowUpIcon, X } from "lucide-react"

const DEFAULT_COLORS = [
  "#6b7280", "#ec4899", "#8b5cf6", "#3b82f6", "#06b6d4", 
  "#10b981", "#f59e0b", "#f97316", "#ef4444", "#f43f5e"
]

interface QuickCalendarCreateProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCalendarCreated: (calendarId: string) => void
}

export function QuickCalendarCreate({ open, onOpenChange, onCalendarCreated }: QuickCalendarCreateProps) {
  const createCalendar = useMutation(api.calendars.createCalendar)
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#10b981"
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageId, setProfileImageId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [nameError, setNameError] = useState(false)

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#10b981" })
    setProfileImage(null)
    setProfileImageId(null)
    setNameError(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setNameError(true)
      return
    }
    
    setNameError(false)

    setIsSubmitting(true)
    
    try {
      const result = await createCalendar({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        profileImageStorageId: profileImageId as any || undefined,
      })
      
      toast.success("Calendar created successfully!")
      if (result) {
        onCalendarCreated(result.calendarId)
      }
      onOpenChange(false)
      
      // Form will be reset automatically when dialog closes
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create calendar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setIsUploading(true)

    try {
      const uploadUrl = await generateUploadUrl()
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!result.ok) {
        throw new Error("Failed to upload image")
      }

      const { storageId } = await result.json()
      setProfileImageId(storageId)
      
      const reader = new FileReader()
      reader.onload = (e) => setProfileImage(e.target?.result as string)
      reader.readAsDataURL(file)
      
      toast.success("Image uploaded successfully!")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Calendar</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image and Form Card - matches main form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="relative">
              {/* Profile Picture - top-left positioning */}
              <div className="absolute top-6 left-6">
                <div 
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-300 bg-gray-50 dark:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-300 flex items-center justify-center relative cursor-pointer transition-all duration-200 group overflow-hidden"
                  onClick={() => !isUploading && document.getElementById('profile-upload')?.click()}
                >
                  {profileImage ? (
                    <>
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-2xl" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProfileImage(null)
                          setProfileImageId(null)
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white dark:bg-gray-200/80 dark:hover:bg-gray-300/80 text-gray-700 dark:text-gray-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 backdrop-blur-sm border border-gray-200/50 dark:border-gray-300/50 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : isUploading ? (
                    <Skeleton className="w-full h-full rounded-2xl" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <ArrowUpIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-600 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calendar Name and Description - Inside the same card, exactly like main form */}
            <div className="pt-32 pb-6 px-6 space-y-4">
              <input
                type="text"
                placeholder="Calendar Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (nameError && e.target.value.trim()) {
                    setNameError(false)
                  }
                }}
                className={`w-full px-0 py-2 text-base font-medium border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 ${
                  nameError 
                    ? "border-red-400 bg-red-50/50 dark:bg-red-950/30 focus:border-red-500" 
                    : "bg-transparent border-gray-300 dark:border-gray-600 focus:border-primary"
                }`}
              />
              
              <textarea
                placeholder="Add a short description."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-0 py-2 text-base border-0 bg-transparent focus:outline-none focus:ring-0 resize-none overflow-hidden"
                rows={1}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-4">
            <label className="text-base font-medium">Tint Color</label>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                    formData.color === color
                      ? "ring-3 ring-offset-2 ring-primary scale-110" 
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Create Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground text-background hover:bg-foreground/90 px-12 py-3 text-base font-medium"
          >
            {isSubmitting ? "Creating..." : "Create Calendar"}
          </Button>
        </form>

        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}