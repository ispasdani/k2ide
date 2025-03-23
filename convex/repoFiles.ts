import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveFile = mutation({
  args: {
    projectId: v.id("project"),
    filePath: v.string(),
    content: v.string(),
    metadata: v.object({ source: v.string() }),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("repoFiles", args);
  },
});

export const getFilesByProject = query({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("repoFiles")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
