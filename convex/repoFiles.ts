// File: api/projects/saveRepoFiles.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveRepoFiles = mutation({
  args: {
    projectId: v.id("project"),
    files: v.array(
      v.object({
        filePath: v.string(),
        content: v.string(),
        metadata: v.object({
          source: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { projectId, files } = args;
    for (const file of files) {
      await ctx.db.insert("repoFiles", {
        projectId,
        filePath: file.filePath,
        content: file.content,
        metadata: file.metadata,
      });
    }
  },
});

export const getRepoFiles = query({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("repoFiles")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    return files;
  },
});

export const updateRepoFile = mutation({
  args: {
    projectId: v.id("project"),
    filePath: v.string(),
    content: v.string(),
  },
  async handler(ctx, args) {
    // Query for the existing file based on projectId and filePath.
    const file = await ctx.db
      .query("repoFiles")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .filter((q) => q.eq(q.field("filePath"), args.filePath))
      .unique();

    if (!file) {
      throw new ConvexError("File not found");
    }

    // Use patch to update only the content field.
    await ctx.db.patch(file._id, { content: args.content });

    return { updated: true, message: "File updated successfully" };
  },
});
