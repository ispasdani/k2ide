// File: api/projects/importRepository.ts

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const importRepository = mutation({
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
    update: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const { projectId, files, update } = args;

    if (!update) {
      // Check if repository files already exist.
      const existing = await ctx.db
        .query("repoFiles")
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .collect();
      if (existing.length > 0) {
        return { imported: false, message: "Repository already imported" };
      }
    } else {
      // For an update, delete all existing records.
      const filesToDelete = await ctx.db
        .query("repoFiles")
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .collect();
      for (const file of filesToDelete) {
        await ctx.db.delete(file._id); // or await ctx.db.delete("repoFiles", file._id) depending on your API version
      }
    }

    // Insert the new set of files.
    for (const file of files) {
      // Note: We now pass a single object with keys `table` and `record`
      await ctx.db.insert("repoFiles", {
        projectId,
        filePath: file.filePath,
        content: file.content,
        metadata: file.metadata,
      });
    }
    return { imported: true, message: "Repository imported successfully" };
  },
});
