"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@workspace/backend/convex/_generated/api.js"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "sonner"
import { 
  Users, 
  MessageCircle, 
  UserCheck, 
  UserX, 
  User, 
  Calendar, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail
} from "lucide-react"

interface CalendarPeopleProps {
  calendarId: string
}

export function CalendarPeople({ calendarId }: CalendarPeopleProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<any>(null)
  const [isRemovingMember, setIsRemovingMember] = useState(false)
  
  const participants = useQuery(api.calendars.getCalendarParticipants, { 
    calendarId: calendarId as any 
  })

  const addCalendarMember = useMutation(api.calendars.addCalendarMember)
  const removeCalendarMember = useMutation(api.calendars.removeCalendarMember)

  if (!participants) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="flex items-center justify-start space-x-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getInitials = (name?: string | null, username?: string | null) => {
    const displayName = name || username || 'User'
    return displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatLastActivity = (timestamp: number) => {
    if (timestamp === 0) return 'Never'
    
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (days === 0 && hours < 24) {
      return 'Today'
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  const handleUserClick = (participant: any) => {
    const identifier = participant.username || participant.rllyId
    if (identifier) {
      router.push(`/user/${identifier}`)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setIsAddingMember(true)
    try {
      const result = await addCalendarMember({ 
        calendarId: calendarId as any, 
        email: newMemberEmail.trim() 
      })
      
      if (result.type === "existing_user") {
        toast.success("Member added successfully!")
      } else if (result.type === "invitation_sent") {
        toast.success("Invitation sent! They'll be added when they create an account.")
      } else {
        toast.success("Member added successfully!")
      }
      setNewMemberEmail("")
      setAddMemberOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to add member")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    setIsRemovingMember(true)
    try {
      const result = await removeCalendarMember({ 
        calendarId: calendarId as any, 
        userId: memberToRemove._id as any
      })
      
      toast.success(result.message || "Member removed successfully")
      setRemoveMemberOpen(false)
      setMemberToRemove(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    } finally {
      setIsRemovingMember(false)
    }
  }

  // Filter and search participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = !searchQuery || 
      participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterBy === "all" ||
      (filterBy === "active" && participant.eventCounts.going > 0) ||
      (filterBy === "recent" && participant.lastActivity > Date.now() - 7 * 24 * 60 * 60 * 1000)

    return matchesSearch && matchesFilter
  })

  // Sort by most recent activity
  const sortedParticipants = filteredParticipants.sort((a, b) => b.lastActivity - a.lastActivity)

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          People ({participants.length})
        </h2>
        
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add People
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Calendar Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="member@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  disabled={isAddingMember}
                />
                <p className="text-xs text-muted-foreground">
                  They'll receive an invitation to join this calendar as a member
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setAddMemberOpen(false)}
                  disabled={isAddingMember}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMember}
                  disabled={isAddingMember}
                >
                  {isAddingMember ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-start space-x-4">
        <div className="w-2/3">
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-1/3 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="active">Active Members</SelectItem>
            <SelectItem value="recent">Recently Joined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members List */}
      {sortedParticipants.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <div>
                <h3 className="font-medium text-sm">No members found</h3>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || filterBy !== "all" 
                    ? "Try adjusting your search or filter"
                    : "Add your first member to get started"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {/* Recently Joined Header */}
          {filterBy === "all" && (
            <div className="text-xs font-medium text-muted-foreground mb-3 px-3">
              Recently Joined
            </div>
          )}
          
          <div className="border border-border rounded-lg divide-y divide-border">
            {sortedParticipants.map((participant) => (
              <div key={participant._id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <Avatar 
                    className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleUserClick(participant)}
                  >
                    <AvatarImage src={participant.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(participant.name, participant.username)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex flex-col">
                    <h3 
                      className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleUserClick(participant)}
                    >
                      {participant.name || participant.username || 'Anonymous User'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {participant.email}
                    </p>
                  </div>
                </div>

                {/* Activity and Actions */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {formatLastActivity(participant.lastActivity)}
                    </div>
                    {participant.eventCounts.total > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {participant.eventCounts.going} events
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserClick(participant)}>
                        <User className="w-3 h-3 mr-2" />
                        <span className="text-xs">View Profile</span>
                      </DropdownMenuItem>
                      {participant.email && (
                        <DropdownMenuItem 
                          onClick={() => window.open(`mailto:${participant.email}`, '_blank')}
                        >
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="text-xs">Send Email</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          setMemberToRemove(participant)
                          setRemoveMemberOpen(true)
                        }}
                      >
                        <UserX className="w-3 h-3 mr-2" />
                        <span className="text-xs">Remove Member</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove{' '}
              <span className="font-medium text-foreground">
                {memberToRemove?.name || memberToRemove?.username || 'this member'}
              </span>{' '}
              from the calendar? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setRemoveMemberOpen(false)
                  setMemberToRemove(null)
                }}
                disabled={isRemovingMember}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleRemoveMember}
                disabled={isRemovingMember}
              >
                {isRemovingMember ? "Removing..." : "Remove Member"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}