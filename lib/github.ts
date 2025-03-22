import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl: string = "https://github.com/ispasdani/gitnius-app";

export type FileChange = {
  filename: string;
  patch?: string;
};

// Define the Response type as per your original intention
export type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string; // GitHub always returns this, but we'll handle undefined in Convex
  commitDate: string;
  diff?: string;
  files?: FileChange[];
};

// Define the function with proper TypeScript typing
export const getCommitHashes = async (
  githubUrl: string,
  page: number = 1, // Default to page 1
  perPage: number = 5 // Default to 5 commits per page
): Promise<Response[]> => {
  const url = new URL(githubUrl);
  const [, owner, repo] = url.pathname.split("/");

  // Fetch commits with pagination
  const { data: commitsData } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    page, // GitHub API page number (1-based)
    per_page: perPage, // Number of commits per page
  });

  // Map commits and fetch details
  const commits: Response[] = await Promise.all(
    commitsData.map(async (commit: any) => {
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
        diff: commitDetails.files?.map((file: any) => file.patch).join("\n"),
        files: commitDetails.files?.map((file: any) => ({
          filename: file.filename,
          patch: file.patch || "No diff available",
        })),
      };
    })
  );

  // Sort by commitDate (most recent first)
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
