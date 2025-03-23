// convex/analyzeRepo.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

export const analyzeRepo: any = action({
  args: {
    githubUrl: v.string(),
    projectId: v.id("project"),
    maxEntries: v.optional(v.number()), // Optional argument to adjust limit
  },
  handler: async (ctx, args) => {
    const existingDocs = await ctx.runQuery(
      api.repoDocuments.getDocumentsByProject,
      {
        projectId: args.projectId,
      }
    );
    if (existingDocs.length > 0)
      return {
        savedEntries: existingDocs.length,
        totalFiles: existingDocs.length,
      };

    const loader = new GithubRepoLoader(args.githubUrl, {
      branch: "main",
      recursive: true,
      accessToken: process.env.GITHUB_TOKEN,
      ignoreFiles: [
        "package.json",
        "package-lock.json",
        "node_modules/**",
        "postcss.config.mjs",
        "tailwind.config.ts",
        "*.md",
        "*.lock",
        "*.config.js",
        "*.config.ts",
      ],
    });

    const docs = await loader.load();
    const relevantDocs = docs.filter((doc) =>
      /\/(components|src|app|hooks|convex|lib|utils|pages|_app|_document)\//i.test(
        doc.metadata.source
      )
    );

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GEMINI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const MAX_BYTES = 30000;
    const MAX_ENTRIES = args.maxEntries ?? 100; // Default to 100 if not provided
    let savedEntries = 0;

    for (const doc of relevantDocs) {
      if (savedEntries >= MAX_ENTRIES) {
        console.log(
          `Reached maximum of ${MAX_ENTRIES} entries. Stopping analysis.`
        );
        break; // Exit loop but continue to return
      }

      const encoder = new TextEncoder();
      const contentBytes = encoder.encode(doc.pageContent);

      if (contentBytes.length <= MAX_BYTES) {
        const embeddingResult = await model.embedContent(doc.pageContent);
        const embedding = embeddingResult.embedding.values;
        await ctx.runMutation(api.repoDocuments.saveDocument, {
          projectId: args.projectId,
          filePath: doc.metadata.source,
          pageContent: doc.pageContent,
          metadata: { source: args.githubUrl },
          embedding,
        });
        savedEntries += 1;
      } else {
        const chunks = [];
        let start = 0;
        while (start < contentBytes.length) {
          const end = Math.min(start + MAX_BYTES, contentBytes.length);
          const chunkBytes = contentBytes.slice(start, end);
          const chunkContent = new TextDecoder().decode(chunkBytes);
          chunks.push(chunkContent);
          start = end;
        }

        for (let i = 0; i < chunks.length; i++) {
          if (savedEntries >= MAX_ENTRIES) {
            console.log(
              `Reached maximum of ${MAX_ENTRIES} entries. Stopping analysis.`
            );
            break; // Exit chunk loop
          }
          const chunk = chunks[i];
          const embeddingResult = await model.embedContent(chunk);
          const embedding = embeddingResult.embedding.values;
          await ctx.runMutation(api.repoDocuments.saveDocument, {
            projectId: args.projectId,
            filePath: `${doc.metadata.source}_chunk_${i + 1}`,
            pageContent: chunk,
            metadata: {
              source: args.githubUrl,
              chunk: `${i + 1}/${chunks.length}`,
            },
            embedding,
          });
          savedEntries += 1;
        }
      }
    }

    console.log(
      `Analysis completed with ${savedEntries} entries saved out of ${relevantDocs.length} relevant files.`
    );
    return { savedEntries, totalFiles: relevantDocs.length }; // Return feedback
  },
});
