// convex/repoDocuments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const saveDocument = mutation({
  args: {
    projectId: v.id("project"),
    filePath: v.string(),
    pageContent: v.string(),
    metadata: v.object({
      source: v.string(),
      chunk: v.optional(v.string()), // Match schema
    }),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("repoDocuments", {
      projectId: args.projectId,
      filePath: args.filePath,
      pageContent: args.pageContent,
      metadata: args.metadata,
    });
    await ctx.db.insert("embeddings", {
      documentId,
      embedding: args.embedding,
    });
    return documentId;
  },
});

// No change needed for getDocumentsByProject or deleteDocument
export const getDocumentsByProject = query({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("repoDocuments")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    return Promise.all(
      documents.map(async (doc) => {
        const embedding = await ctx.db
          .query("embeddings")
          .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
          .first();
        return { ...doc, embedding: embedding?.embedding };
      })
    );
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("repoDocuments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
    const embedding = await ctx.db
      .query("embeddings")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .first();
    if (embedding) await ctx.db.delete(embedding._id);
  },
});
