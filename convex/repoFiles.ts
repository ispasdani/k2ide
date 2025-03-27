// File: api/projects/saveRepoFiles.ts
import { v } from "convex/values";
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
