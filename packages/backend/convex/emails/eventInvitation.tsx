import React from "react";
import { Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js"; 

interface EventInvitationProps {
  invitedName: string;
  inviterName: string;
  eventName: string;
  eventDate: number;
  eventLocation?: string;
  message?: string;
  invitationUrl: string;
}

export default function EventInvitation({
  invitedName,
  inviterName,
  eventName,
  eventDate,
  eventLocation,
  message,
  invitationUrl,
}: EventInvitationProps) {
  const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <BaseEmail
      previewText={`${inviterName} invited you to ${eventName}`}
      footerLinks={[
        { text: "Help", href: "https://rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Hi {invitedName}! You've been invited to an event.
      </Text>
      
      <div style={styles.codeContainer}>
        <div style={{...styles.code, fontSize: '18px', letterSpacing: 'normal'}}>
          {eventName}
        </div>
      </div>
      
      <Text style={styles.textCenter}>
        <strong>When:</strong> {eventDateFormatted}
      </Text>
      
      {eventLocation && (
        <Text style={styles.textCenter}>
          <strong>Where:</strong> {eventLocation}
        </Text>
      )}
      
      <Text style={styles.textCenter}>
        <strong>Invited by:</strong> {inviterName}
      </Text>
      
      {message && (
        <Text style={styles.text}>
          "{message}"
        </Text>
      )}
      
      <Text style={styles.textMuted}>
        <a href={invitationUrl} style={styles.link}>View Event & RSVP</a>
      </Text>
    </BaseEmail>
  );
}