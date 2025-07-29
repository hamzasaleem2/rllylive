"use client"

import { useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { X, Image } from "lucide-react"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, storageId: string) => void
  onImageRemove: () => void
  currentImage?: string | null
  className?: string
}

export function ImageUploader({ 
  onImageUpload, 
  onImageRemove, 
  currentImage,
  className = "" 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  const getFileUrl = useMutation(api.users.getFileUrl)

  const handleFileSelect = async (file: File) => {
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

      // Get the public URL from Convex
      const { imageUrl } = await getFileUrl({ storageId })
      
      // Call the callback with public URL and storage ID
      onImageUpload(imageUrl, storageId)
      
      toast.success("Image uploaded successfully!")
    } catch (error) {
      toast.error("Failed to upload image. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onImageRemove()
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`aspect-square w-full border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
        } ${isUploading ? 'pointer-events-none' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImage ? (
          <div className="relative w-full h-full group">
            <img 
              src={currentImage} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                1:1 aspect ratio recommended
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}