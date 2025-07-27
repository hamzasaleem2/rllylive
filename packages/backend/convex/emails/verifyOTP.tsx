import React from "react";
import { Heading, Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail.js";

interface VerifyOTPProps {
  code: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function VerifyOTP({
  code,
  brandName = "rlly",
  brandTagline = "Create events that actually happen",
  brandLogoUrl,
}: VerifyOTPProps) {
  return (
    <BaseEmail
      previewText={`Your verification code: ${code}`}
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
      footerLinks={[
        { text: "Help", href: "https://rlly.live/help" },
        { text: "Contact", href: "mailto:support@rlly.live" },
      ]}
    >      
      <Text style={styles.textCenter}>
        Enter this verification code to sign in to your account:
      </Text>
      
      <div style={styles.codeContainer}>
        <div style={styles.code}>{code}</div>
      </div>
      
      <Text style={styles.textMuted}>
        This code expires in 5 minutes.
      </Text>
      
      <Text style={styles.textMuted}>
        If you didn't request this, you can safely ignore this email.
      </Text>
    </BaseEmail>
  );
}