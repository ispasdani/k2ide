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
  },
  async handler(ctx, args) {
    const { projectId, files } = args;
    // Optional: check if files already exist for this project
    const existing = await ctx.db
      .query("repoFiles")
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
    if (existing.length > 0) {
      return { imported: false, message: "Repository already imported" };
    }

    // Insert files into the repoFiles table.
    for (const file of files) {
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
