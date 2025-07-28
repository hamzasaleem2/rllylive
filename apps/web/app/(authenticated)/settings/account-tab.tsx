"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Upload, Save, Loader2, Instagram, Twitter, Youtube, Linkedin, Globe, Check, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useDebounce } from "use-debounce"

export function AccountTab() {
  const currentUser : any = useQuery(api.auth.getCurrentUser)
  const updateProfile = useMutation(api.users.updateProfile)
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  const updateProfileImage = useMutation(api.users.updateProfileImage)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean
    message: string
  } | null>(null)
  const [showUsernameFeedback, setShowUsernameFeedback] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    website: currentUser?.website || "",
    twitter: currentUser?.twitter || "",
    instagram: currentUser?.instagram || "",
  })

  // Debounce the username for API calls
  const [debouncedUsername] = useDebounce(formData.username, 500)

  // Debounced username availability check
  const checkUsernameAvailability = useQuery(api.users.checkUsernameAvailability, 
    debouncedUsername && debouncedUsername !== currentUser?.username ? { username: debouncedUsername } : "skip"
  )

  // Update form data when user data loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        website: currentUser.website || "",
        twitter: currentUser.twitter || "",
        instagram: currentUser.instagram || "",
      })
    }
  }, [currentUser])

  // Update username status when availability check completes
  useEffect(() => {
    if (checkUsernameAvailability && debouncedUsername) {
      setUsernameStatus(checkUsernameAvailability)
      setIsCheckingUsername(false)
      setShowUsernameFeedback(true)
    }
  }, [checkUsernameAvailability, debouncedUsername])

  // Handle debounced username changes
  useEffect(() => {
    if (debouncedUsername && debouncedUsername !== currentUser?.username) {
      setIsCheckingUsername(true)
      setUsernameStatus(null)
      setShowUsernameFeedback(true)
    } else {
      setIsCheckingUsername(false)
      setUsernameStatus(null)
      setShowUsernameFeedback(false)
    }
  }, [debouncedUsername, currentUser?.username])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Show feedback when user starts typing username
    if (field === 'username') {
      setShowUsernameFeedback(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)

    try {
      // Validate form data
      const cleanData = {
        ...formData,
        username: formData.username.replace(/^@/, "").trim(),
        website: formData.website.trim(),
        twitter: formData.twitter.replace(/^@/, "").trim(),
        instagram: formData.instagram.replace(/^@/, "").trim(),
      }

      await updateProfile(cleanData)
      toast.success("Profile updated successfully!")
    } catch (error) {
      // Simplify error messages for better user experience
      let errorMessage = "Failed to update profile"
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        
        if (message.includes("username")) {
          if (message.includes("already taken")) {
            errorMessage = "Username is already taken"
          } else if (message.includes("3 characters")) {
            errorMessage = "Username must be at least 3 characters"
          } else if (message.includes("20 characters")) {
            errorMessage = "Username must be less than 20 characters"
          } else if (message.includes("letters, numbers")) {
            errorMessage = "Username can only contain letters, numbers, underscores, and hyphens"
          }
        } else if (message.includes("name")) {
          if (message.includes("50 characters")) {
            errorMessage = "Name must be less than 50 characters"
          }
        } else if (message.includes("bio")) {
          if (message.includes("500 characters")) {
            errorMessage = "Bio must be less than 500 characters"
          }
        } else if (message.includes("website")) {
          if (message.includes("200 characters")) {
            errorMessage = "Website URL must be less than 200 characters"
          } else if (message.includes("valid url")) {
            errorMessage = "Please enter a valid website URL"
          }
        } else if (message.includes("social handle")) {
          if (message.includes("30 characters")) {
            errorMessage = "Social handle must be less than 30 characters"
          } else if (message.includes("letters, numbers, dots")) {
            errorMessage = "Social handle can only contain letters, numbers, dots, and underscores"
          }
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if form has changes
  const isFormValid = () => {
    // Check if any fields have changed from the original user data
    const hasChanges = 
      formData.name !== (currentUser?.name || "") ||
      formData.username !== (currentUser?.username || "") ||
      formData.bio !== (currentUser?.bio || "") ||
      formData.website !== (currentUser?.website || "") ||
      formData.twitter !== (currentUser?.twitter || "") ||
      formData.instagram !== (currentUser?.instagram || "")

    return hasChanges
  }

  const handleImageUpload = async (file: File) => {
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

    setIsUploading(true)

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

      // Update user profile with new image
      await updateProfileImage({ storageId })
      
      toast.success("Profile image updated successfully!")
    } catch (error) {
      toast.error("Failed to upload image. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!currentUser) {
    return (
      <div className="space-y-8">
        {/* Profile Information Section Skeleton */}
        <div>
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Left Column - Form Fields Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-80" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-80" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>

            {/* Right Column - Profile Picture Skeleton */}
            <div className="flex flex-col items-center lg:items-start space-y-4 lg:w-48">
              <div className="text-center lg:text-left">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="relative">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <Skeleton className="absolute bottom-0 right-0 w-10 h-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Section Skeleton */}
        <div>
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="flex justify-start">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Emails Section Skeleton */}
        <div>
          <Skeleton className="h-6 w-16 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-64 mt-2" />
        </div>
      </div>
    )
  }

  const initials = currentUser.name 
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : currentUser.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="space-y-8">
      {/* Profile Information Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Your Profile</h2>
          <p className="text-muted-foreground">
            Choose how you are displayed as a host or guest.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          {/* Left Column - Form Fields */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your display name"
                  className="h-10 max-w-md"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative max-w-md">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-10">@</span>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value.replace(/^@/, ""))}
                    placeholder="username"
                    className={`pl-7 pr-10 h-10 w-full ${
                      usernameStatus?.available && showUsernameFeedback
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : usernameStatus && !usernameStatus.available && showUsernameFeedback
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    maxLength={20}
                  />
                  {isCheckingUsername && showUsernameFeedback && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {usernameStatus && !isCheckingUsername && showUsernameFeedback && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      {usernameStatus.available ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {usernameStatus && showUsernameFeedback && (
                  <p className={`text-sm ${
                    usernameStatus.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Share a little about your background and interests."
                  rows={3}
                  className="max-w-md"
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Profile Picture */}
          <div className="flex flex-col items-center lg:items-start space-y-4 lg:w-48">
            <div className="text-center lg:text-left">
              <Label className="text-sm font-medium text-foreground mb-3 block">Profile Picture</Label>
              <div className="relative group">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={currentUser.image || undefined}
                    alt={currentUser.name || currentUser.username || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-live-green/20 to-primary/20 text-xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-background transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Image
                      src="/assets/file-front-clay.png"
                      alt="Upload"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                      quality={100}
                      unoptimized
                      style={{ imageRendering: 'auto' }}
                    />
                  )}
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="pl-7 h-10"
                maxLength={30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-sm font-medium">X (Twitter)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="pl-7 h-10"
                maxLength={30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="Your website"
              className="h-10"
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start">
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid()} 
          className="h-10 px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Emails Section */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Emails</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{currentUser.email}</span>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            Primary
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This email is used for account notifications and sign-in.
        </p>
      </div>
    </div>
  )
}