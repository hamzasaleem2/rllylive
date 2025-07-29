"use client"

import { Switch } from "@workspace/ui/components/switch"
import { UserCheck } from "lucide-react"

interface ApprovalToggleProps {
  requireApproval: boolean
  onToggle: (enabled: boolean) => void
}

export function ApprovalToggle({ requireApproval, onToggle }: ApprovalToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <UserCheck className="w-5 h-5 text-muted-foreground" />
        <span className="font-medium">Require Approval</span>
      </div>
      <Switch
        checked={requireApproval}
        onCheckedChange={onToggle}
        className="cursor-pointer"
      />
    </div>
  )
}