"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const NOTIFICATION_SECTIONS = [
  {
    title: "Events You Attend",
    icon: "/assets/calendar-dynamic-clay.png",
    items: [
      { key: "event_invitations", label: "Event Invitations" },
      { key: "event_reminders", label: "Event Reminders" },
      { key: "event_blasts", label: "Event Blasts" },
      { key: "event_updates", label: "Event Updates" },
      { key: "event_confirmations", label: "Event Confirmations" },
      { key: "feedback_requests", label: "Feedback Requests" },
    ],
  },
  {
    title: "Events You Host",
    icon: "/assets/chat-text-dynamic-clay.png",
    items: [
      { key: "guest_registrations", label: "Guest Registrations" },
      { key: "feedback_responses", label: "Feedback Responses" },
    ],
  },
  {
    title: "Calendars You Manage",
    icon: "/assets/clock-dynamic-clay.png",
    items: [
      { key: "new_members", label: "New Members" },
      { key: "event_submissions", label: "Event Submissions" },
    ],
  },
  {
    title: "Rlly",
    icon: "/assets/bell-dynamic-clay.png",
    items: [
      { key: "product_updates", label: "Product Updates" },
    ],
  },
];

export function NotificationsTab() {
  const preferences = useQuery(api.users.getNotificationPreferences)
  const updatePreference = useMutation(api.users.updateNotificationPreference)
  const initializePreferences = useMutation(api.users.initializeNotificationPreferences)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  // Initialize preferences if none exist
  useEffect(() => {
    if (preferences !== undefined && preferences !== null && Object.keys(preferences).length === 0) {
      initializePreferences().catch((error: any) => {
        console.error("Failed to initialize notification preferences:", error)
        // Don't show toast for auth errors, just log them
        if (!error.message?.includes("Unauthorized")) {
          toast.error("Failed to initialize notification preferences")
        }
      })
    }
  }, [preferences, initializePreferences])

  const handlePreferenceChange = async (category: string, channel: "email" | "off") => {
    try {
      await updatePreference({ category, channel })
      toast.success("Notification preference updated")
    } catch (error) {
      toast.error("Failed to update notification preference")
    }
  }

  const toggleDropdown = (category: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const getPreferenceValue = (category: string): "email" | "off" | undefined => {
    if (preferences === undefined || preferences === null) {
      return undefined // Still loading or error
    }
    return preferences[category] || "email"
  }

  const getDisplayText = (channel: "email" | "off") => {
    return channel === "email" ? "Email" : "Off"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {NOTIFICATION_SECTIONS.map(section => (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src={section.icon}
                  alt={section.title}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  quality={100}
                  unoptimized
                />
                <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
              </div>
              
              <div className="space-y-2">
                {section.items.map((item) => {
                  const currentValue = getPreferenceValue(item.key)
                  const isOpen = openDropdowns[item.key] || false
                  const isLoading = currentValue === undefined
                  
                  return (
                    <div 
                      key={item.key} 
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <DropdownMenu open={isOpen} onOpenChange={() => toggleDropdown(item.key)}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-sm flex items-center"
                            onClick={() => toggleDropdown(item.key)}
                            disabled={isLoading}
                          >
                            <span className="flex items-center">
                              {isLoading ? (
                                <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                              ) : (
                                getDisplayText(currentValue || "email")
                              )}
                              {!isLoading && (
                                isOpen ? (
                                  <ChevronUp className="ml-2 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-2 h-3 w-3" />
                                )
                              )}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuRadioGroup 
                            value={currentValue || "email"}
                            onValueChange={(value: string) => {
                              handlePreferenceChange(item.key, value as "email" | "off")
                              toggleDropdown(item.key)
                            }}
                          >
                            <DropdownMenuRadioItem value="email">Email</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 