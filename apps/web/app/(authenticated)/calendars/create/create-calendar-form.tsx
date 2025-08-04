"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { ArrowUpIcon, X } from "lucide-react"
import { LocationMap } from "@/components/location-map"

const DEFAULT_COLORS = [
  "#6b7280", // gray
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#f43f5e", // rose
]

export function CreateCalendarForm() {
  const router = useRouter()
  const createCalendar = useMutation(api.calendars.createCalendar)
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#10b981", // Default green
    publicUrl: "",
    location: "",
    isGlobal: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [profileImageId, setProfileImageId] = useState<string | null>(null)
  const [coverImageId, setCoverImageId] = useState<string | null>(null)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [nameError, setNameError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setNameError(true)
      return
    }
    
    setNameError(false)

    setIsSubmitting(true)
    
    try {
      await createCalendar({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        publicUrl: formData.publicUrl.trim() || undefined,
        location: formData.location.trim() || undefined,
        isGlobal: formData.isGlobal,
        profileImageStorageId: profileImageId as any || undefined,
        coverImageStorageId: coverImageId as any || undefined,
      })
      
      toast.success("Calendar created successfully!")
      router.push("/calendars")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create calendar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
  }

  const handleLocationToggle = (isGlobal: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isGlobal, 
      location: isGlobal ? "" : prev.location 
    }))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
    if (nameError && e.target.value.trim()) {
      setNameError(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, or GIF)")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    if (type === 'profile') {
      setIsUploadingProfile(true)
    } else {
      setIsUploadingCover(true)
    }

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl()
      
      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!result.ok) {
        throw new Error("Failed to upload image")
      }

      const { storageId } = await result.json()

      // Set the storage ID and preview image
      if (type === 'profile') {
        setProfileImageId(storageId)
        const reader = new FileReader()
        reader.onload = (e) => setProfileImage(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setCoverImageId(storageId)
        const reader = new FileReader()
        reader.onload = (e) => setCoverImage(e.target?.result as string)
        reader.readAsDataURL(file)
      }
      
      toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully!`)
    } catch (error) {
      toast.error("Failed to upload image. Please try again.")
      console.error("Upload error:", error)
    } finally {
      if (type === 'profile') {
        setIsUploadingProfile(false)
      } else {
        setIsUploadingCover(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Cover Image and Form Card */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
        {/* Cover Image */}
        <div className="relative">
          <div 
            className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-200/80 dark:to-gray-200/80 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
            onClick={() => !isUploadingCover && document.getElementById('cover-upload')?.click()}
          >
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCoverImage(null)
                    setCoverImageId(null)
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white dark:bg-gray-200/80 dark:hover:bg-gray-300/80 text-gray-700 dark:text-gray-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : isUploadingCover ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('cover-upload')?.click()
                  }}
                  className="px-3 py-1.5 bg-gray-200/80 hover:bg-gray-300/80 dark:bg-gray-200/80 dark:hover:bg-gray-300/80 text-gray-600 dark:text-gray-600 text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-300/50 dark:border-gray-300/50 cursor-pointer"
                >
                  Change Cover
                </button>
              </div>
            )}
          </div>
          
          {/* Profile Picture - Overlapping bottom-left */}
          <div className="absolute -bottom-6 left-6">
            <div 
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-300 bg-gray-50 dark:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-300 flex items-center justify-center relative cursor-pointer transition-all duration-200 group overflow-hidden"
              onClick={() => !isUploadingProfile && document.getElementById('profile-upload')?.click()}
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
              ) : isUploadingProfile ? (
                <Skeleton className="w-full h-full rounded-2xl" />
              ) : (
                <div className="flex items-center justify-center">
                  <ArrowUpIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-600 transition-colors" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Calendar Name and Description - Inside the same card */}
        <div className="pt-8 pb-6 px-6 space-y-4">
          <input
            type="text"
            placeholder="Calendar Name"
            value={formData.name}
            onChange={handleNameChange}
            className={`w-full px-0 py-2 text-base font-medium border-0 border-b-2 rounded-none bg-transparent focus:outline-none focus:ring-0 ${
              nameError 
                ? "border-red-400 bg-red-50/50 dark:bg-red-950/30 focus:border-red-500" 
                : "border-gray-300 dark:border-gray-600 focus:border-primary"
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

      {/* Customisation Section */}
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-8 space-y-8">
          <h3 className="text-xl font-semibold">Customisation</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tint Colour */}
            <div className="space-y-4">
              <label className="text-base font-medium text-foreground">
                Tint Color
              </label>
              <div className="flex flex-wrap gap-3">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
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

            {/* Location */}
            <div className="space-y-4">
              <label className="text-base font-medium text-foreground">
                Location
              </label>
              <LocationMap
                isGlobal={formData.isGlobal}
                location={formData.location}
                onLocationChange={(location) => setFormData(prev => ({ ...prev, location }))}
                onToggleChange={(isGlobal) => handleLocationToggle(isGlobal)}
              />
            </div>
          </div>

          {/* Public URL */}
          <div className="space-y-4">
            <label className="text-base font-medium text-foreground">
              Public URL
            </label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <span className="text-base text-muted-foreground font-mono">app.rlly.live/cal/</span>
              <Input
                placeholder=""
                value={formData.publicUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, publicUrl: e.target.value }))}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex justify-start pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90 px-12 py-3 text-base font-medium"
        >
          {isSubmitting ? "Creating..." : "Create Calendar"}
        </Button>
      </div>

      <input
        id="cover-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file, 'cover')
          }
        }}
      />
      <input
        id="profile-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file, 'profile')
          }
        }}
      />
    </form>
  )
}