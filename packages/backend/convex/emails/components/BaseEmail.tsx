import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Text,
  Preview,
} from "@react-email/components";
import React from "react";

export interface BaseEmailProps {
  children: React.ReactNode;
  previewText: string;
  footerLinks?: Array<{ text: string; href: string }>;
  footerText?: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export const styles = {
  main: {
    backgroundColor: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    margin: "0 auto",
    padding: "20px",
    width: "580px",
    maxWidth: "100%",
  },
  box: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  header: {
    padding: "32px 32px 24px",
    textAlign: "center" as const,
    borderBottom: "1px solid #f9fafb",
  },
  brandName: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 4px",
  },
  brandTagline: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  content: {
    padding: "32px",
  },
  h1: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.4",
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  text: {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "16px 0",
  },
  textCenter: {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "16px 0",
    textAlign: "center" as const,
  },
  textMuted: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "16px 0",
    textAlign: "center" as const,
  },
  codeContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    margin: "24px 0",
    textAlign: "center" as const,
    border: "1px solid #e5e7eb",
  },
  code: {
    display: "inline-block",
    fontSize: "32px",
    fontWeight: "600",
    letterSpacing: "8px",
    color: "#1f2937",
    fontFamily: "Monaco, Consolas, 'Courier New', monospace",
  },
  footer: {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.4",
    margin: "0",
    textAlign: "center" as const,
    padding: "24px 32px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
  },
  link: {
    color: "#7c3aed",
    textDecoration: "none",
  },
};

export function BaseEmail({
  children,
  previewText,
  footerLinks = [],
  footerText,
  brandName = "rlly",
  brandTagline = "Create events that actually happen",
  brandLogoUrl,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Preview>{previewText}</Preview>
        <Container style={styles.container}>
          <div style={styles.box}>
            <div style={styles.header}>
              <div style={{ 
                textAlign: "center" as const,
                marginBottom: "16px"
              }}>
                <span style={{
                  fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "1.5px",
                  color: "#6b7280"
                }}>rlly</span>
              </div>
              <Text style={styles.brandTagline}>{brandTagline}</Text>
            </div>
            
            <div style={styles.content}>
              {children}
            </div>
            
            <div style={styles.footer}>
              {footerLinks.map((link, i) => (
                <React.Fragment key={link.href}>
                  <Link href={link.href} target="_blank" style={styles.link}>
                    {link.text}
                  </Link>
                  {i < footerLinks.length - 1 && " • "}
                </React.Fragment>
              ))}
              {footerLinks.length > 0 && <br />}
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                {footerText || `© ${brandName} • ${brandTagline.toLowerCase()}`}
              </span>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}