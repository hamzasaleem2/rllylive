"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  FileText,
  Plus
} from "lucide-react"

interface DescriptionEditorProps {
  description: string
  onDescriptionChange: (description: string) => void
}

export function DescriptionEditor({ description, onDescriptionChange }: DescriptionEditorProps) {
  const [open, setOpen] = useState(false)
  const [localDescription, setLocalDescription] = useState(description)

  const handleDone = () => {
    onDescriptionChange(localDescription)
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalDescription(description) // Reset to original
    setOpen(false)
  }

  const hasDescription = description && description.trim() !== ''

  return (
    <>
      {hasDescription ? (
        <div 
          className="border rounded-lg p-4 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Event Description</span>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {description.replace(/\n/g, ' ')}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full justify-start cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Description
        </Button>
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (isOpen) {
          setLocalDescription(description) // Reset to current description when opening
        } else {
          handleCancel() // Reset changes when closing without save
        }
        setOpen(isOpen)
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Event Description</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="p-6">
              <Textarea
                placeholder="Who should come? What's the event about?"
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                className="h-[200px] resize-none focus:outline-none focus:ring-0 focus:border-primary overflow-y-auto"
              />
            </div>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t bg-muted/20">
            <Button onClick={handleDone} className="cursor-pointer">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}