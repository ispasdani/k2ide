import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl: string = "https://github.com/ispasdani/gitnius-app";

// Define the Response type as per your original intention
export type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
  diff?: string; // Raw diff text (optional)
  files?: { filename: string; patch?: string }[]; // Changed files (optional)
};

// Define the function with proper TypeScript typing
export const getCommitHashes = async (
  githubUrl: string
): Promise<Response[]> => {
  // Extract owner and repo from githubUrl (optional improvement)
  const url = new URL(githubUrl);
  const [, owner, repo] = url.pathname.split("/");

  // Step 1: Get the list of commits
  const { data: commitsData } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: 10, // Limit to 10 commits for performance (adjust as needed)
  });

  // Step 2: Map initial commit metadata
  const commits: Response[] = await Promise.all(
    commitsData.map(async (commit: any) => {
      // Step 3: Fetch detailed commit data including diff
      const { data: commitDetails } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });

      return {
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitAuthorName: commit.commit.author.name,
        commitAuthorAvatar: commit.author?.avatar_url || "",
        commitDate: commit.commit.author.date,
        diff: commitDetails.files?.map((file: any) => file.patch).join("\n"), // Combine patches
        files: commitDetails.files?.map((file: any) => ({
          filename: file.filename,
          patch: file.patch || "No diff available",
        })),
      };
    })
  );

  // Step 4: Sort by commitDate (most recent first)
  commits.sort(
    (a, b) =>
      new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime()
  );

  return commits;
};

// Execute the function and log the result
// getCommitHashes(githubUrl)
//   .then((result: Response[]) => console.log(result))
//   .catch((error: any) => console.error("Error fetching commits:", error));

// export const pollCommits = async (projectId: string) => {
//   const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
//   const commitHashes = await getCommitHashes(githubUrl);
//   const unprocessedCommits = await filterUnprocessedCommits(
//     projectId,
//     commitHashes
//   );
// };

// async function fetchProjectGithubUrl(projectId: string) {
//   const project = await convex.query(api.projects.getProjectByProjectId, {
//     projectId: projectId as Id<"project">,
//   });

//   if (!project?.githubUrl) {
//     throw new Error("Project has no github url.");
//   }

//   return { project, githubUrl: project.githubUrl };
// }

// async function filterUnprocessedCommits(
//   projectId: string,
//   commitHashes: Response[]
// ) {
//   const processedCommits = await db.commit.findMany({
//     where: { projectId },
//   });
//   const unprocessedCommits = commitHashes.filter(
//     (commit) =>
//       !processedCommits.some(
//         (processedCommits) => processedCommits.commitHash === commit.commitHash
//       )
//   );

//   return unprocessedCommits;
// }

async function summariseCommit(githubUrl: string, commitHash: string) {}

// ts-node lib/github.ts
