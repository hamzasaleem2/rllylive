"use client"

import './tiptap-styles.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useRef } from 'react'
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered,
  ListTodo,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Undo,
  Redo,
  Type,
  ChevronDown,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator"
import UnderlineExtension from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { toast } from "sonner"

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = "Start typing...",
  className = ""
}: TiptapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const linkButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Convex mutations
  const generateUploadUrl = useMutation(api.users.generateUploadUrl)
  const getFileUrl = useMutation(api.users.getFileUrl)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        // Disable the default link extension from StarterKit
        link: false,
      }),
      // Add our custom configured extensions
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[120px] px-3 py-2 text-foreground h-full',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const openLinkDialog = () => {
    // Get the current selection's link URL if it exists
    const previousUrl = editor.getAttributes('link').href || ''
    setLinkUrl(previousUrl)
    setLinkDialogOpen(true)
  }

  const setLink = () => {
    if (linkUrl.trim() === '') {
      // If no URL provided, just close the dialog
      setLinkDialogOpen(false)
      setLinkUrl('')
      return
    }

    // Add http:// if no protocol is provided
    let finalUrl = linkUrl.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    // Apply the link to the current selection
    editor.chain().focus().setLink({ href: finalUrl }).run()
    
    setLinkDialogOpen(false)
    setLinkUrl('')
  }

  const cancelLink = () => {
    setLinkDialogOpen(false)
    setLinkUrl('')
  }

  const handleImageUpload = async (file: File) => {
    if (!file || !editor) return

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

      // Get the public URL for the uploaded image
      const { imageUrl } = await getFileUrl({ storageId })

      // Insert the image into the editor
      editor.chain().focus().setImage({ src: imageUrl }).run()
      
      toast.success("Image uploaded successfully!")
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

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`border rounded-lg flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-1 flex-wrap flex-shrink-0">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 px-2"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 px-2"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Heading Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <Type className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={editor.isActive('paragraph') ? 'bg-muted' : ''}
            >
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            >
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            >
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            >
              <Heading3 className="h-4 w-4 mr-2" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 px-2 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 px-2 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 px-2 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`h-8 px-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`h-8 px-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`h-8 px-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`h-8 px-2 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}`}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 px-2 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 px-2 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`h-8 px-2 ${editor.isActive('taskList') ? 'bg-muted' : ''}`}
        >
          <ListTodo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Quote and Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 px-2 ${editor.isActive('blockquote') ? 'bg-muted' : ''}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Popover open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={linkButtonRef}
              variant="ghost"
              size="sm"
              onClick={openLinkDialog}
              className={`h-8 px-2 ${editor.isActive('link') ? 'bg-muted' : ''}`}
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Add Link</h4>
                <Input
                  placeholder="Enter URL (e.g., example.com or https://example.com)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setLink()
                    } else if (e.key === 'Escape') {
                      cancelLink()
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={setLink}
                  className="flex-1"
                  disabled={!linkUrl.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelLink}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={triggerImageUpload}
          disabled={isUploading}
          className="h-8 px-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </Button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}