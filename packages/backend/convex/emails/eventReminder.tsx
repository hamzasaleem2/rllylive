import React from "react";
import { Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js";

interface EventReminderProps {
  userName: string;
  eventName: string;
  eventDate: number;
  eventLocation?: string;
  eventUrl: string;
  hoursUntilEvent: number;
}

export default function EventReminder({
  userName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  hoursUntilEvent,
}: EventReminderProps) {
  const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const reminderText = hoursUntilEvent <= 1 
    ? "Your event is starting soon!"
    : `Your event is in ${hoursUntilEvent} hours`;

  return (
    <BaseEmail
      previewText={`Reminder: ${eventName} ${reminderText}`}
      footerLinks={[
        { text: "Help", href: "https://rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Hi {userName}! {reminderText}
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
      
      <Text style={styles.textMuted}>
        <a href={eventUrl} style={styles.link}>View Event Details</a>
      </Text>
    </BaseEmail>
  );
}