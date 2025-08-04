import React from "react";
import { Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js";

interface EventRSVPProps {
  hostName: string;
  attendeeName: string;
  eventName: string;
  rsvpStatus: "going" | "not_going" | "maybe";
  eventUrl: string;
}

export default function EventRSVP({
  hostName,
  attendeeName,
  eventName,
  rsvpStatus,
  eventUrl,
}: EventRSVPProps) {
  const statusText = {
    going: "will be attending",
    not_going: "won't be attending", 
    maybe: "might be attending"
  }[rsvpStatus];

  const statusEmoji = {
    going: "✅",
    not_going: "❌",
    maybe: "❓"
  }[rsvpStatus];

  return (
    <BaseEmail
      previewText={`${attendeeName} RSVPed to ${eventName}`}
      footerLinks={[
        { text: "Help", href: "https://app.rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Hi {hostName}! Someone RSVPed to your event.
      </Text>
      
      <div style={styles.codeContainer}>
        <div style={{...styles.code, fontSize: '24px', letterSpacing: 'normal'}}>
          {statusEmoji}
        </div>
      </div>
      
      <Text style={styles.textCenter}>
        <strong>{attendeeName}</strong> {statusText}
      </Text>
      
      <Text style={styles.textCenter}>
        <strong>Event:</strong> {eventName}
      </Text>
      
      <Text style={styles.textMuted}>
        <a href={eventUrl} style={styles.link}>View Event & All RSVPs</a>
      </Text>
    </BaseEmail>
  );
}