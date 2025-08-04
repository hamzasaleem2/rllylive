"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { ImageUploader } from "./components/image-uploader"
import { CalendarSelector } from "./components/calendar-selector"
import { DateTimeSelector } from "./components/date-time-selector"
import { LocationSelector } from "./components/location-selector"
import { DescriptionEditor } from "./components/description-editor"
import { TicketsSelector } from "./components/tickets-selector"
import { ApprovalToggle } from "./components/approval-toggle"
import { CapacitySelector } from "./components/capacity-selector"
import { PublicPrivateSelector } from "./components/public-private-selector"
import { Button } from "@workspace/ui/components/button"
import { type ITimezoneOption } from "react-timezone-select"
import { sanitizeText, sanitizeUrl, sanitizeHtml } from "@/lib/sanitize"

export default function CreateEventPage() {
  const router = useRouter()
  const createEvent = useMutation(api.events.createEvent)
  const userCalendars = useQuery(api.calendars.getUserCalendars)
  // Form state
  const [selectedCalendarId, setSelectedCalendarId] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [eventImageStorageId, setEventImageStorageId] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  
  // Set default dates and times
  const getDefaultStartDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0] || ""
  }
  
  const getDefaultEndDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0] || ""
  }
  
  const getDefaultStartTime = (): string => {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
    return `${nextHour.getHours().toString().padStart(2, '0')}:00`
  }
  
  const getDefaultEndTime = (): string => {
    const now = new Date()
    const nextTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    return `${nextTwoHours.getHours().toString().padStart(2, '0')}:00`
  }
  
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [startTime, setStartTime] = useState(getDefaultStartTime())
  const [endDate, setEndDate] = useState(getDefaultEndDate())
  const [endTime, setEndTime] = useState(getDefaultEndTime())
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
  const [isPublic, setIsPublic] = useState(true)
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameError, setNameError] = useState("")

  // Auto-select first calendar when calendars load
  useEffect(() => {
    if (userCalendars && userCalendars.length > 0 && !selectedCalendarId) {
      setSelectedCalendarId(userCalendars[0]?._id || "")
    }
  }, [userCalendars, selectedCalendarId])

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

  const handleSubmit = async () => {
    if (isSubmitting) return

    // Reset errors
    setNameError("")

    // Validation
    if (!selectedCalendarId) {
      toast.error("Please select a calendar")
      return
    }
    
    if (!eventName.trim()) {
      setNameError("Event name is required")
      return
    }

    if (!startDate || !startTime) {
      toast.error("Please set a start date and time")
      return
    }

    if (!endDate || !endTime) {
      toast.error("Please set an end date and time")
      return
    }

    try {
      setIsSubmitting(true)

      // Convert date/time to timestamps
      const timezoneString = typeof timezone === 'string' ? timezone : timezone.value
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${endDate}T${endTime}`)

      const startTimestamp = startDateTime.getTime()
      const endTimestamp = endDateTime.getTime()

      // Sanitize inputs before sending to backend
      const sanitizedData = {
        name: sanitizeText(eventName),
        description: description ? sanitizeHtml(description) : undefined,
        location: location ? sanitizeText(location) : undefined,
        imageUrl: eventImage ? sanitizeUrl(eventImage) : undefined,
        ticketName: ticketName ? sanitizeText(ticketName) : undefined,
        ticketDescription: ticketDescription ? sanitizeText(ticketDescription) : undefined,
      }

      // Create the event
      await createEvent({
        name: sanitizedData.name,
        description: sanitizedData.description,
        calendarId: selectedCalendarId as any,
        startTime: startTimestamp,
        endTime: endTimestamp,
        timezone: timezoneString,
        location: sanitizedData.location,
        imageUrl: sanitizedData.imageUrl,
        imageStorageId: eventImageStorageId || undefined,
        ticketType: ticketType,
        ticketPrice: ticketType === "paid" ? ticketPrice : undefined,
        ticketName: sanitizedData.ticketName,
        ticketDescription: sanitizedData.ticketDescription,
        requiresApproval: requireApproval,
        hasCapacityLimit: hasCapacityLimit,
        capacity: hasCapacityLimit ? capacity : undefined,
        waitingList: hasCapacityLimit ? waitingList : false,
        isPublic: isPublic
      })

      toast.success("Event created successfully!")
      router.push("/events")
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              currentImage={eventImage}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <CalendarSelector
                selectedCalendarId={selectedCalendarId}
                onCalendarChange={setSelectedCalendarId}
              />
              <PublicPrivateSelector
                isPublic={isPublic}
                onVisibilityChange={setIsPublic}
              />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value)
                  if (nameError) setNameError("") // Clear error when user types
                }}
                className={`w-full px-0 py-3 text-lg font-medium border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 placeholder-muted-foreground ${
                  nameError 
                    ? 'bg-red-100 border-red-500 focus:border-red-500' 
                    : 'bg-transparent border-gray-300 dark:border-gray-600 focus:border-primary'
                }`}
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
              <h3 className="text-xs font-medium text-muted-foreground">Event Options</h3>
              
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Event..." : "Create Event"}
              </Button>
            </div>
          </div>
        </div>
    </PageLayout>
  )
} 