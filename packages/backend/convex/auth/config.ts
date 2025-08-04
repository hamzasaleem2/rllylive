import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import { sendOTPVerification } from "../lib/email";

export const createAuth = (ctx: any, betterAuthComponent: any) => {
  const siteUrl = process.env.CONVEX_FRONTEND_URL;
  return betterAuth({
    // All auth requests will be proxied through your next.js server
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    socialProviders: {
      google: {
        prompt: "select_account", 
        accessType: "offline", 
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      emailOTP({
        expiresIn: 60 * 5, // 5 minutes (in seconds)
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireMutationCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
      convex(),
    ],
  });
};