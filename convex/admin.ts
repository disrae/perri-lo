import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize admin credentials if they don't exist
export const initializeAdmin = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const existingCredentials = await ctx.db
            .query("adminCredentials")
            .first();

        if (!existingCredentials) {
            // Create default admin credentials
            await ctx.db.insert("adminCredentials", {
                activationPassword: "secretadmin", // Password to trigger admin mode popup
                adminPassword: "perriloAdmin123",  // Password for actual admin access
            });
        }

        return null;
    },
});

// Verify activation password (first password)
export const verifyActivationPassword = query({
    args: {
        password: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const credentials = await ctx.db
            .query("adminCredentials")
            .first();

        if (!credentials) {
            return false;
        }

        return credentials.activationPassword === args.password;
    },
});

// Verify admin password (second password)
export const verifyAdminPassword = query({
    args: {
        password: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const credentials = await ctx.db
            .query("adminCredentials")
            .first();

        if (!credentials) {
            return false;
        }

        return credentials.adminPassword === args.password;
    },
});

// Update site content
export const updateSiteContent = mutation({
    args: {
        section: v.string(),
        content: v.string(),
        type: v.string(),
        imageUrl: v.optional(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Check if content already exists for this section
        const existingContent = await ctx.db
            .query("siteContent")
            .withIndex("by_section", q => q.eq("section", args.section))
            .first();

        if (existingContent) {
            // Update existing content
            await ctx.db.patch(existingContent._id, {
                content: args.content,
                type: args.type,
                imageUrl: args.imageUrl,
            });
        } else {
            // Create new content
            await ctx.db.insert("siteContent", {
                section: args.section,
                content: args.content,
                type: args.type,
                imageUrl: args.imageUrl,
            });
        }

        return null;
    },
});

// Get site content
export const getSiteContent = query({
    args: {
        section: v.string(),
    },
    returns: v.union(
        v.object({
            _id: v.id("siteContent"),
            section: v.string(),
            content: v.string(),
            type: v.string(),
            imageUrl: v.optional(v.string()),
        }),
        v.null()
    ),
    handler: async (ctx, args) => {
        const content = await ctx.db
            .query("siteContent")
            .withIndex("by_section", q => q.eq("section", args.section))
            .first();

        return content;
    },
});

// Get all site content
export const getAllSiteContent = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("siteContent"),
            section: v.string(),
            content: v.string(),
            type: v.string(),
            imageUrl: v.optional(v.string()),
        })
    ),
    handler: async (ctx) => {
        const content = await ctx.db
            .query("siteContent")
            .collect();

        return content;
    },
}); 