// import { v } from "convex/values";
// import { action } from "./_generated/server";
// import { api } from "./_generated/api";
// import { Octokit } from "@octokit/rest";

// interface GitTreeItem {
//   path?: string;
//   type?: "blob" | "tree" | "commit";
//   sha?: string;
//   size?: number;
//   url?: string;
// }

// interface FileContent {
//   type: "file";
//   content: string;
//   encoding: "base64";
//   path: string;
//   sha: string;
//   size: number;
//   url: string;
// }

// export const analyzeRepo = action({
//   args: {
//     githubUrl: v.string(),
//     projectId: v.id("project"),
//     branch: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
//     const [owner, repo] = args.githubUrl
//       .replace("https://github.com/", "")
//       .split("/");
//     const branch = args.branch ?? "main";

//     const { data: tree } = await octokit.git.getTree({
//       owner,
//       repo,
//       tree_sha: branch,
//       recursive: "true",
//     });

//     const files = (tree.tree as GitTreeItem[])
//       .filter((item) => item.type === "blob" && item.path)
//       .filter((item) =>
//         /^(package\.json|src\/|app\/|components\/|hooks\/|lib\/|utils\/|pages\/|_app|_document)/i.test(
//           item.path!
//         )
//       )
//       .filter(
//         (item) => !/node_modules|\.(lock|md|config\.[jt]s)$/i.test(item.path!)
//       )
//       .slice(0, 100); // Up to 100 files

//     let savedFiles = 0;
//     for (const file of files) {
//       const { data: content } = await octokit.repos.getContent({
//         owner,
//         repo,
//         path: file.path!,
//         ref: branch,
//       });

//       if (
//         !Array.isArray(content) &&
//         content.type === "file" &&
//         "content" in content
//       ) {
//         const base64Content = (content as FileContent).content;
//         const fileContent = atob(base64Content);

//         await ctx.runMutation(api.repoFiles.saveFile, {
//           projectId: args.projectId,
//           filePath: file.path!,
//           content: fileContent,
//           metadata: { source: args.githubUrl },
//         });
//         savedFiles += 1;
//       }
//     }

//     return { savedFiles };
//   },
// });
