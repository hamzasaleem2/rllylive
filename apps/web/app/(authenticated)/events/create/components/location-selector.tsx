"use client"

import { useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { ChevronDown, MapPin, Video, Info } from "lucide-react"

interface LocationSelectorProps {
  location: string
  onLocationChange: (location: string) => void
}

export function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleLocationSelect = (selectedLocation: string) => {
    onLocationChange(selectedLocation)
    setOpen(false)
  }

  // const createZoomMeeting = () => {
  //   // Placeholder for Zoom integration
  //   handleLocationSelect("Zoom Meeting (Link will be generated)")
  // }

  // const createGoogleMeet = () => {
  //   // Placeholder for Google Meet integration  
  //   handleLocationSelect("Google Meet (Link will be generated)")
  // }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal cursor-pointer text-sm">
          {location || "Enter location or virtual link"}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Location Input */}
          <div>
            <Input
              placeholder="Enter location or virtual link"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Recent Locations */}
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Locations</h4>
            <p className="text-sm text-muted-foreground">No recently used locations.</p>
          </div>

          {/* Virtual Options */}
          {/* <div>
            <h4 className="text-sm font-medium mb-2">Virtual Options</h4>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 cursor-pointer"
                onClick={createZoomMeeting}
              >
                <Video className="w-4 h-4 mr-3" />
                <span>Create Zoom meeting</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 cursor-pointer"
                onClick={createGoogleMeet}
              >
                <Video className="w-4 h-4 mr-3" />
                <span>Create Google Meet</span>
              </Button>
            </div>
          </div> */}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              If you have a virtual event link, you can enter or paste it above.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}