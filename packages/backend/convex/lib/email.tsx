import "../polyfills.js";
import VerifyOTP from "../emails/verifyOTP";
import { render } from "@react-email/components";
import { components } from "../_generated/api.js";
import { Resend } from "@convex-dev/resend";
import { type RunMutationCtx } from "@convex-dev/better-auth";
import React from "react";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendOTPVerification = async (
  ctx: RunMutationCtx,
  {
    to,
    code,
  }: {
    to: string;
    code: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: "Rlly <onboarding@resend.dev>",
    to,
    subject: `${code} is your Rlly Sign-in code`,
    html: await render(<VerifyOTP code={code} />),
  });
};