"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  Ticket,
  Edit2
} from "lucide-react"

interface TicketsSelectorProps {
  ticketType: "free" | "paid"
  ticketPrice?: number
  ticketName?: string
  ticketDescription?: string
  onTicketChange: (data: {
    type: "free" | "paid"
    price?: number
    name?: string
    description?: string
  }) => void
}

export function TicketsSelector({ 
  ticketType, 
  ticketPrice, 
  ticketName, 
  ticketDescription, 
  onTicketChange 
}: TicketsSelectorProps) {
  const [open, setOpen] = useState(false)
  const [localType, setLocalType] = useState(ticketType)
  const [localPrice, setLocalPrice] = useState(ticketPrice || 0)
  const [localName, setLocalName] = useState(ticketName || "")
  const [localDescription, setLocalDescription] = useState(ticketDescription || "")

  const handleSave = () => {
    onTicketChange({
      type: localType,
      price: localType === "paid" ? localPrice : undefined,
      name: localName || undefined,
      description: localDescription || undefined
    })
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalType(ticketType)
    setLocalPrice(ticketPrice || 0)
    setLocalName(ticketName || "")
    setLocalDescription(ticketDescription || "")
    setOpen(false)
  }

  return (
    <>
      <div 
        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Tickets</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {ticketType === "free" ? "Free" : `$${ticketPrice || 0}`}
          </span>
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel()
        }
        setOpen(isOpen)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Ticket Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ticket Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={localType === "free" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalType("free")}
                  className="flex-1 cursor-pointer"
                >
                  Free
                </Button>
                <Button
                  variant={localType === "paid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalType("paid")}
                  className="flex-1 cursor-pointer"
                >
                  Paid
                </Button>
              </div>
            </div>

            {/* Price Input (only for paid tickets) */}
            {localType === "paid" && (
              <div>
                <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localPrice}
                  onChange={(e) => setLocalPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            )}

            {/* Optional Ticket Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Ticket Name (Optional)</Label>
              <Input
                id="name"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="e.g., General Admission, VIP, Early Bird"
                className="mt-1"
              />
            </div>

            {/* Optional Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="Describe what's included with this ticket"
                className="mt-1 h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSave} className="cursor-pointer">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}