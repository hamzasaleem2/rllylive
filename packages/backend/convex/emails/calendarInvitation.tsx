import * as React from "react"
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components"
import { BaseEmail } from "./components/BaseEmail"

interface CalendarInvitationProps {
  inviterName: string
  calendarName: string
  joinUrl: string
}

export default function CalendarInvitation({
  inviterName = "Someone",
  calendarName = "Sample Calendar",
  joinUrl = "https://app.rlly.live/join/calendar/123",
}: CalendarInvitationProps) {
  return (
    <BaseEmail previewText={`${inviterName} invited you to join ${calendarName}`}>
      <Container style={container}>
        <Section>
          <Text style={title}>
            You're invited to join a calendar! 📅
          </Text>
          
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join the calendar <strong>"{calendarName}"</strong>.
          </Text>
          
          <Text style={text}>
            By joining this calendar, you'll get notified about new events and be able to RSVP to events that interest you.
          </Text>
          
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={joinUrl}
            >
              Join Calendar
            </Button>
          </Section>
          
          <Text style={text}>
            Don't have a Rlly account yet? No problem! Clicking the button above will let you create an account and join the calendar at the same time.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            If you didn't expect this invitation, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </BaseEmail>
  )
}

const container = {
  padding: "20px",
  maxWidth: "600px",
  margin: "0 auto",
}

const title = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
  textAlign: "center" as const,
}

const text = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333",
  marginBottom: "16px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#000",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const hr = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
}

const footer = {
  fontSize: "14px",
  color: "#666",
  textAlign: "center" as const,
}