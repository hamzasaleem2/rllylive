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
import { Switch } from "@workspace/ui/components/switch"
import { 
  Users,
  Edit2
} from "lucide-react"

interface CapacitySelectorProps {
  hasLimit: boolean
  capacity?: number
  waitingList: boolean
  onCapacityChange: (data: {
    hasLimit: boolean
    capacity?: number
    waitingList: boolean
  }) => void
}

export function CapacitySelector({ 
  hasLimit, 
  capacity, 
  waitingList, 
  onCapacityChange 
}: CapacitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [localHasLimit, setLocalHasLimit] = useState(hasLimit)
  const [localCapacity, setLocalCapacity] = useState(capacity || 50)
  const [localWaitingList, setLocalWaitingList] = useState(waitingList)

  const handleSetLimit = () => {
    onCapacityChange({
      hasLimit: true,
      capacity: localCapacity,
      waitingList: localWaitingList
    })
    setOpen(false)
  }

  const handleRemoveLimit = () => {
    onCapacityChange({
      hasLimit: false,
      capacity: undefined,
      waitingList: false
    })
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalHasLimit(hasLimit)
    setLocalCapacity(capacity || 50)
    setLocalWaitingList(waitingList)
    setOpen(false)
  }

  return (
    <>
      <div 
        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {hasLimit ? `${capacity} people` : "Unlimited"}
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
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              Max Capacity
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Auto-close registration when the capacity is reached. Only approved guests count towards the cap.
            </p>

            {/* Capacity Input */}
            <div>
              <Label htmlFor="capacity" className="text-sm font-medium">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={localCapacity}
                onChange={(e) => setLocalCapacity(Number(e.target.value))}
                className="mt-2"
              />
            </div>

            {/* Waiting List Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Over-Capacity Waiting List</span>
              <Switch
                checked={localWaitingList}
                onCheckedChange={setLocalWaitingList}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button 
              onClick={handleSetLimit} 
              className="flex-1 cursor-pointer"
            >
              Set Limit
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRemoveLimit}
              className="flex-1 cursor-pointer"
            >
              Remove Limit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}