import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl: string = "https://github.com/ispasdani/gitnius-app";

// Define the Response type as per your original intention
type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// Define the function with proper TypeScript typing
export const getCommitHashes = async (
  githubUrl: string
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  const { data } = await octokit.rest.repos.listCommits({
    owner: "ispasdani",
    repo: "gitnius-app",
  });

  // Map the raw GitHub API data to the Response type
  const commits: Response[] = data.map((commit: any) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message,
    commitAuthorName: commit.commit.author.name,
    commitAuthorAvatar: commit.author?.avatar_url || "", // Fallback for null author
    commitDate: commit.commit.author.date,
  }));

  // Sort commits by commitDate in descending order (most recent first)
  commits.sort((a: Response, b: Response) => {
    return new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime();
  });

  return commits; // Return the mapped data instead of logging it
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
