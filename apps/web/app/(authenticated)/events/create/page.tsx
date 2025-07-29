"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { ImageUploader } from "./components/image-uploader"
import { CalendarSelector } from "./components/calendar-selector"
import { DateTimeSelector } from "./components/date-time-selector"
import { LocationSelector } from "./components/location-selector"
import { DescriptionEditor } from "./components/description-editor"
import { TicketsSelector } from "./components/tickets-selector"
import { ApprovalToggle } from "./components/approval-toggle"
import { CapacitySelector } from "./components/capacity-selector"
import { Button } from "@workspace/ui/components/button"
import { type ITimezoneOption } from "react-timezone-select"

export default function CreateEventPage() {
  // Form state
  const [selectedCalendarId, setSelectedCalendarId] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [eventImageStorageId, setEventImageStorageId] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [timezone, setTimezone] = useState<string | ITimezoneOption>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  
  // Event options state
  const [ticketType, setTicketType] = useState<"free" | "paid">("free")
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(undefined)
  const [ticketName, setTicketName] = useState<string | undefined>(undefined)
  const [ticketDescription, setTicketDescription] = useState<string | undefined>(undefined)
  const [requireApproval, setRequireApproval] = useState(false)
  const [hasCapacityLimit, setHasCapacityLimit] = useState(false)
  const [capacity, setCapacity] = useState<number | undefined>(undefined)
  const [waitingList, setWaitingList] = useState(false)

  const handleImageUpload = (imageUrl: string, storageId: string) => {
    setEventImage(imageUrl)
    setEventImageStorageId(storageId)
  }

  const handleImageRemove = () => {
    setEventImage(null)
    setEventImageStorageId(null)
  }

  const handleTicketChange = (data: {
    type: "free" | "paid"
    price?: number
    name?: string
    description?: string
  }) => {
    setTicketType(data.type)
    setTicketPrice(data.price)
    setTicketName(data.name)
    setTicketDescription(data.description)
  }

  const handleCapacityChange = (data: {
    hasLimit: boolean
    capacity?: number
    waitingList: boolean
  }) => {
    setHasCapacityLimit(data.hasLimit)
    setCapacity(data.capacity)
    setWaitingList(data.waitingList)
  }
  return (
    <PageLayout title="Create Event">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              currentImage={eventImage}
            />
          </div>

          <div className="space-y-6">
              <CalendarSelector
                selectedCalendarId={selectedCalendarId}
                onCalendarChange={setSelectedCalendarId}
              />

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-0 py-3 text-xl font-medium border-0 border-b-2 border-gray-300 dark:border-gray-600 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-primary placeholder-muted-foreground"
              />
            </div>

            <DateTimeSelector
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              timezone={timezone}
              onStartDateChange={setStartDate}
              onStartTimeChange={setStartTime}
              onEndDateChange={setEndDate}
              onEndTimeChange={setEndTime}
              onTimezoneChange={setTimezone}
            />

            <LocationSelector
              location={location}
              onLocationChange={setLocation}
            />

            <DescriptionEditor
              description={description}
              onDescriptionChange={setDescription}
            />

            {/* Event Options Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Options</h3>
              
              <TicketsSelector
                ticketType={ticketType}
                ticketPrice={ticketPrice}
                ticketName={ticketName}
                ticketDescription={ticketDescription}
                onTicketChange={handleTicketChange}
              />

              <ApprovalToggle
                requireApproval={requireApproval}
                onToggle={setRequireApproval}
              />

              <CapacitySelector
                hasLimit={hasCapacityLimit}
                capacity={capacity}
                waitingList={waitingList}
                onCapacityChange={handleCapacityChange}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={() => {}}
                disabled={false}
                className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 text-base font-medium cursor-pointer"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>
    </PageLayout>
  )
} 