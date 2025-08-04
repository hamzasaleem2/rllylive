"use client"

import './description-preview.css'
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { TiptapEditor } from "@/components/tiptap-editor"
import { 
  FileText,
  Plus
} from "lucide-react"

interface DescriptionEditorProps {
  description: string
  onDescriptionChange?: (description: string) => void
  readOnly?: boolean
}

export function DescriptionEditor({ description, onDescriptionChange, readOnly = false }: DescriptionEditorProps) {
  const [open, setOpen] = useState(false)
  const [localDescription, setLocalDescription] = useState(description)

  const handleDone = () => {
    if (onDescriptionChange) {
      onDescriptionChange(localDescription)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalDescription(description) // Reset to original
    setOpen(false)
  }

  const handleClick = () => {
    if (!readOnly) {
      setOpen(true)
    }
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')
  }

  // Decode HTML entities for backward compatibility with old events
  const decodeHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = html
      return textarea.value
    }
    return html
  }

  const displayDescription = readOnly ? decodeHtml(description) : description
  const hasDescription = description && stripHtml(description).trim() !== ''

  return (
    <>
      {hasDescription ? (
        <div 
          className={`border rounded-lg bg-muted/20 transition-colors ${
            readOnly ? '' : 'cursor-pointer hover:bg-muted/30'
          }`}
          onClick={handleClick}
        >
          {!readOnly && (
            <div className="flex items-center gap-2 p-4 pb-2">
              <FileText className="w-3 h-3" />
              <span className="text-xs font-medium">Event Description</span>
            </div>
          )}
          <div className={readOnly ? "p-0" : "px-4 pb-4"}>
            <div 
              className={`description-preview ${readOnly ? '' : 'max-h-32 overflow-y-auto'}`}
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />
          </div>
        </div>
      ) : !readOnly ? (
        <Button
          variant="outline"
          onClick={handleClick}
          className="w-full justify-start cursor-pointer text-sm"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Description
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (isOpen) {
          setLocalDescription(description) // Reset to current description when opening
        } else {
          handleCancel() // Reset changes when closing without save
        }
        setOpen(isOpen)
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle>Event Description</DialogTitle>
            <DialogDescription>
              Use rich text formatting to create an engaging description for your event
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-6">
            <TiptapEditor
              content={localDescription}
              onChange={setLocalDescription}
              placeholder=""
              className="h-full max-h-[50vh] overflow-hidden"
            />
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t bg-muted/20 flex-shrink-0">
            <Button onClick={handleDone} className="cursor-pointer">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}