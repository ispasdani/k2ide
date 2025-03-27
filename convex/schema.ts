// File: schema/convex.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
    name: v.string(),
    credits: v.number(),
    linkedInProfile: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
  }),
  payments: defineTable({
    userId: v.id("users"),
    stripeId: v.string(),
    status: v.string(),
    amount: v.number(),
    planId: v.id("plans"),
    createdAt: v.string(),
  }).index("stripeIdIndex", ["stripeId"]),
  plans: defineTable({
    name: v.string(),
    price: v.number(),
    credits: v.number(),
    imageGeneration: v.number(),
    description: v.string(),
    messageOne: v.string(),
    messageTwo: v.string(),
    messageThree: v.string(),
    messageFour: v.string(),
    messageFive: v.string(),
    messageSix: v.string(),
  }),
  project: defineTable({
    userId: v.id("users"),
    role: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    projectName: v.string(),
    githubUrl: v.string(),
    githubToken: v.string(),
    deletedAt: v.string(),
    // Keys are emails (v.string()) and values are roles (v.string())
    sharedWith: v.record(v.string(), v.string()),
  }),
  commits: defineTable({
    projectId: v.id("project"), // Links to the project table's _id
    commitHash: v.string(), // Unique identifier for the commit
    commitMessage: v.string(), // Commit message
    commitAuthorName: v.string(), // Author’s name
    commitAuthorAvatar: v.optional(v.string()), // Avatar URL (optional)
    commitDate: v.string(), // ISO date string
    diff: v.optional(v.string()), // Raw diff text (optional)
    files: v.optional(
      v.array(
        v.object({
          filename: v.string(), // Name of the changed file
          patch: v.optional(v.string()), // Diff patch for the file (optional)
        })
      )
    ), // Array of file changes (optional)
  }).index("by_projectId", ["projectId"]),
  repoFiles: defineTable({
    projectId: v.id("project"),
    filePath: v.string(), // Full file path (e.g., "src/index.ts")
    content: v.string(), // The text content of the file
    metadata: v.object({
      source: v.string(), // For example, "GitHub" or other details
    }),
  }).index("by_projectId", ["projectId"]),
});
