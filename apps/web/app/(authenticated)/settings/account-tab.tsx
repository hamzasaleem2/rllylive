"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Camera, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@workspace/ui/components/separator"

export function AccountTab() {
  const currentUser : any = useQuery(api.auth.getCurrentUser)
  const updateProfile = useMutation(api.users.updateProfile)
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    website: currentUser?.website || "",
    twitter: currentUser?.twitter || "",
    instagram: currentUser?.instagram || "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      const cleanData = {
        ...formData,
        username: formData.username.replace(/^@/, "").trim(),
        website: formData.website ? (formData.website.startsWith('http') ? formData.website : `https://${formData.website}`) : "",
        twitter: formData.twitter.replace(/^@/, "").trim(),
        instagram: formData.instagram.replace(/^@/, "").trim(),
      }

      await updateProfile(cleanData)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!currentUser) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              {/* Skeleton for description */}
              <Skeleton className="h-4 w-40 mt-2" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
              {/* Left column skeleton */}
              <div className="w-full md:max-w-[420px] space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-16 w-1/2" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
                <div className="pt-3">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
              {/* Profile Picture Skeleton */}
              <div className="flex flex-col items-center md:items-start space-y-3 w-full md:w-[160px] md:flex-none md:ml-0 mt-6 md:mt-0">
                <div className="text-center md:text-left">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="w-20 h-20 rounded-full" />
                </div>
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            {/* Emails section skeleton */}
        <div className="mt-10 md:pl-6">
          <Skeleton className="h-5 w-20 mb-2" />
          <div className="mt-4 max-w-md">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-56 mt-1" />
          </div>
        </div>
          </CardContent>
        </Card>
      </>
    )
  }

  const initials = currentUser.name 
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : currentUser.username?.[0]?.toUpperCase() || '?'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            {/* Left column: fields, bio, social links, save button */}
            <div className="w-full md:flex-1 space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your display name"
                    className="h-9 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      className="pl-7 h-9 w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="w-full md:w-1/2">
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Share a little about your hobbies and activities."
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-xs">Website</Label>
                    <div className="relative w-full">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">https://</span>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value.replace(/^https?:\/\//, ""))}
                        placeholder="rlly.live"
                        className="pl-16 text-sm h-8 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                    <div className="relative w-full">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">@</span>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange("twitter", e.target.value.replace(/^@/, ""))}
                        placeholder="username"
                        className="pl-5 text-sm h-8 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                    <div className="relative w-full">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">@</span>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value.replace(/^@/, ""))}
                        placeholder="username"
                        className="pl-5 text-sm h-8 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" disabled={isLoading} size="sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
            {/* Right column: profile picture */}
            <div className="flex flex-col items-center md:items-start space-y-3 w-full md:w-[160px] md:flex-none md:ml-0 mt-6 md:mt-0">
              <div className="text-center md:text-left">
                <Label className="text-xs text-muted-foreground mb-2 block">Profile Picture</Label>
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={currentUser.image || undefined} 
                    alt={currentUser.name || currentUser.username || "User"} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-live-green/20 to-primary/20 text-lg font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button variant="outline" size="sm" type="button" className="cursor-pointer text-xs" disabled>
                <Camera className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      {/* Emails Section - elegant, minimal, integrated */}
      <div className="mt-10 md:pl-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Emails</h2>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="font-medium text-base">{currentUser?.email}</span>
          <span className="bg-muted text-xs px-2 py-0.5 rounded-full">Primary</span>
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          This email will be shared with hosts when you register for their events.
        </div>
      </div>
    </Card>
  )
}