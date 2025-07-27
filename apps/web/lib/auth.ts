import { betterAuthComponent } from "@workspace/backend/convex/auth";
import { type GenericCtx } from "@workspace/backend/convex/_generated/server";
import { createAuth as createSharedAuth } from "@workspace/auth";

export const createAuth = (ctx: GenericCtx) => 
  createSharedAuth(ctx, betterAuthComponent);