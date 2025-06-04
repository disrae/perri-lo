import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  // Admin credentials for authentication
  adminCredentials: defineTable({
    activationPassword: v.string(), // Password to trigger admin mode popup
    adminPassword: v.string(),      // Password to verify admin access
  }),

  // Site content that can be edited
  siteContent: defineTable({
    section: v.string(),  // Identifies which section of the site (e.g., "hero", "about", "bio")
    content: v.string(),  // The actual text content
    type: v.string(),     // Type of content: "text", "image", etc.
    imageUrl: v.optional(v.string()), // URL for images if applicable
  }).index("by_section", ["section"]),
});
