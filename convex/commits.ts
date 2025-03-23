import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveCommits = mutation({
  args: {
    projectId: v.id("project"),
    commits: v.array(
      v.object({
        commitHash: v.string(),
        commitMessage: v.string(),
        commitAuthorName: v.string(),
        commitAuthorAvatar: v.optional(v.string()),
        commitDate: v.string(),
        diff: v.optional(v.string()),
        files: v.optional(
          v.array(
            v.object({
              filename: v.string(),
              patch: v.optional(v.string()),
            })
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { projectId, commits } = args;
    for (const commit of commits) {
      await ctx.db.insert("commits", {
        projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        diff: commit.diff,
        files: commit.files,
      });
    }
  },
});

export const getCommitsByProject = query({
  args: { projectId: v.id("project") },

  handler: async (ctx, args) => {
    const commits = await ctx.db
      .query("commits")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc") // Sort by _creationTime (or add a commitDate index if needed)
      .collect();

    return commits;
  },
});
