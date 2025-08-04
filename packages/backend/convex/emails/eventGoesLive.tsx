import React from "react";
import { Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js";

interface EventGoesLiveProps {
  userName: string;
  eventName: string;
  eventDate: number;
  eventLocation?: string;
  eventUrl: string;
  isVirtual?: boolean;
  virtualLink?: string;
}

export default function EventGoesLive({
  userName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  isVirtual,
  virtualLink,
}: EventGoesLiveProps) {
  const eventTimeFormatted = new Date(eventDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <BaseEmail
      previewText={`${eventName} is starting now!`}
      footerLinks={[
        { text: "Help", href: "https://app.rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Hi {userName}! Your event is starting now.
      </Text>
      
      <div style={styles.codeContainer}>
        <div style={{...styles.code, fontSize: '20px', letterSpacing: 'normal'}}>
          🎉 {eventName}
        </div>
      </div>
      
      <Text style={styles.textCenter}>
        <strong>Started at:</strong> {eventTimeFormatted}
      </Text>
      
      {isVirtual && virtualLink ? (
        <Text style={styles.textCenter}>
          <a href={virtualLink} style={{...styles.link, fontSize: '16px', fontWeight: 'bold'}}>
            Join Virtual Event
          </a>
        </Text>
      ) : eventLocation && (
        <Text style={styles.textCenter}>
          <strong>Location:</strong> {eventLocation}
        </Text>
      )}
      
      <Text style={styles.textMuted}>
        <a href={eventUrl} style={styles.link}>View Event Details</a>
      </Text>
    </BaseEmail>
  );
}