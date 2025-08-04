import React from "react";
import { Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js";

interface NewEventNotificationProps {
  subscriberName: string;
  hostName: string;
  eventName: string;
  eventDate: number;
  calendarName: string;
  eventUrl: string;
}

export default function NewEventNotification({
  subscriberName,
  hostName,
  eventName,
  eventDate,
  calendarName,
  eventUrl,
}: NewEventNotificationProps) {
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
      previewText={`New event in ${calendarName}: ${eventName}`}
      footerLinks={[
        { text: "Help", href: "https://rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Hi {subscriberName}! A new event was added to a calendar you follow.
      </Text>
      
      <div style={styles.codeContainer}>
        <div style={{...styles.code, fontSize: '18px', letterSpacing: 'normal'}}>
          {eventName}
        </div>
      </div>
      
      <Text style={styles.textCenter}>
        <strong>When:</strong> {eventDateFormatted}
      </Text>
      
      <Text style={styles.textCenter}>
        <strong>Calendar:</strong> {calendarName}
      </Text>
      
      <Text style={styles.textCenter}>
        <strong>Host:</strong> {hostName}
      </Text>
      
      <Text style={styles.textMuted}>
        <a href={eventUrl} style={styles.link}>View Event Details</a>
      </Text>
    </BaseEmail>
  );
}