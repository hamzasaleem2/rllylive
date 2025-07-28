import {
    BetterAuth,
    type AuthFunctions,
    type PublicAuthFunctions,
  } from "@convex-dev/better-auth";
  import { api, components, internal } from "./_generated/api";
  import { query } from "./_generated/server";
  import { v } from "convex/values";
  import type { Id, DataModel } from "./_generated/dataModel";
  
  // Typesafe way to pass Convex functions defined in this file
  const authFunctions: AuthFunctions = internal.auth;
  const publicAuthFunctions: PublicAuthFunctions = api.auth;
  
  // Initialize the component
  export const betterAuthComponent = new BetterAuth(
    components.betterAuth,
    {
      authFunctions,
      publicAuthFunctions,
    }
  );
  
  // These are required named exports
  export const {
    createUser,
    updateUser,
    deleteUser,
    createSession,
    isAuthenticated,
  } =
    betterAuthComponent.createAuthFunctions<DataModel>({
      // Must create a user and return the user id
      onCreateUser: async (ctx, user) => {
        // Create the user record with Better Auth metadata
        const userId = await ctx.db.insert("users", {
          name: user.name,
          image: user.image, 
          email: user.email,
        });
        
        // Generate rllyId by appending "rlly" to the _id
        const rllyId = `rlly${userId}`;
        
        // Update the user record with the generated rllyId
        await ctx.db.patch(userId, { rllyId });
        
        // Create default notification preferences
        const defaultNotificationCategories = [
          "event_invitations",
          "event_reminders", 
          "event_blasts",
          "event_updates",
          "feedback_requests",
          "guest_registrations",
          "feedback_responses",
          "new_members",
          "event_submissions",
          "product_updates"
        ];
        
        // Insert all default notification preferences
        for (const category of defaultNotificationCategories) {
          await ctx.db.insert("notificationPreferences", {
            userId: userId as any,
            category,
            channel: "email",
          });
        }
        
        return userId;
      },

      // Update user when Better Auth user data changes
      // onUpdateUser: async (ctx: any, userId: any, user: any) => {
      //   await ctx.db.patch(userId as Id<"users">, {
      //     name: user.name,
      //     image: user.image,
      //     email: user.email,
      //   });
      // },
  
      // Delete the user when they are deleted from Better Auth
      onDeleteUser: async (ctx, userId) => {
        // Delete all notification preferences for this user
        const preferences = await ctx.db
          .query("notificationPreferences")
          .withIndex("by_user", (q) => q.eq("userId", userId as any))
          .collect();
        
        for (const preference of preferences) {
          await ctx.db.delete(preference._id);
        }
        
        // Delete the user record
        await ctx.db.delete(userId as Id<"users">);
      },
    });
  
  // Example function for getting the current user
  // Feel free to edit, omit, etc.
  export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
      // Get user data from Better Auth - email, name, image, etc.
      const userMetadata = await betterAuthComponent.getAuthUser(ctx);
      if (!userMetadata) {
        return null;
      }
      // Get user data from your application's database
      // (skip this if you have no fields in your users table schema)
      const user = await ctx.db.get(userMetadata.userId as Id<"users">);
      return {
        ...user,
        ...userMetadata,
      };
    },
  });

  // Get user by rllyId for public profiles
  export const getUserByRllyId = query({
    args: { rllyId: v.string() },
    handler: async (ctx, { rllyId }) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_rllyId", (q) => q.eq("rllyId", rllyId))
        .first();
      
      if (!user) {
        return null;
      }

      // Return public profile data including stored auth metadata
      return {
        _id: user._id,
        username: user.username,
        rllyId: user.rllyId,
        _creationTime: user._creationTime,
        name: user.name,
        image: user.image,
        email: user.email, // Consider if this should be public
      };
    },
  });