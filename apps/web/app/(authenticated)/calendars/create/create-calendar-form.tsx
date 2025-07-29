"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent } from "@workspace/ui/components/card"
import { toast } from "sonner"
import { Upload, Camera } from "lucide-react"
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Cover Image */}
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => document.getElementById('cover-upload')?.click()}
        >
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Cover Photo</span>
            </div>
          )}
        </div>
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => setCoverImage(e.target?.result as string)
              reader.readAsDataURL(file)
            }
          }}
        />
      </div>

      {/* Profile Icon and Name */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 flex items-center justify-center relative cursor-pointer transition-all duration-200 group"
            onClick={() => document.getElementById('profile-upload')?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors font-medium">
                  Upload
                </span>
              </div>
            )}
          </div>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => setProfileImage(e.target?.result as string)
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <Input
            placeholder="Calendar Name"
            value={formData.name}
            onChange={handleNameChange}
            className={`text-xl font-medium border-0 border-b-2 rounded-none px-0 py-3 transition-colors bg-transparent focus:outline-none focus:ring-0 ${
              nameError 
                ? "border-red-400 dark:bg-red-950/30 bg-red-50/50 focus:border-red-500 dark:focus:bg-red-950/40 focus:bg-red-50/70" 
                : "border-border/30 focus:border-primary"
            }`}
          />
          
          <Textarea
            placeholder="Add a short description."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="border-0 resize-none px-0 py-2 text-muted-foreground bg-transparent text-base focus:outline-none focus:ring-0"
            rows={3}
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
                    className={`w-10 h-10 rounded-full transition-all ${
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
              <span className="text-base text-muted-foreground font-mono">rlly.live/</span>
              <Input
                placeholder="custom-url"
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
    </form>
  )
}