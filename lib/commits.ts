import { getCommitHashes } from "./github";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Type for Convex commits (includes Convex metadata)
export type Commit = {
  _id: Id<"commits">;
  _creationTime: number;
  projectId: Id<"project">;
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar?: string; // Optional as per schema
  commitDate: string;
  diff?: string;
  files?: { filename: string; patch?: string }[];
};

export const fetchAndSaveNewCommits = async (
  githubUrl: string,
  projectId: Id<"project">,
  savedCommits: Commit[] | undefined,
  saveCommitsMutation: ReturnType<
    typeof useMutation<typeof api.commits.saveCommits>
  >,
  perPage: number = 5
): Promise<void> => {
  try {
    const latestCommits = await getCommitHashes(githubUrl, 1, perPage);
    const savedCommitHashes = new Set(
      savedCommits?.map((c) => c.commitHash) || []
    );
    const newCommits = latestCommits.filter(
      (commit) => !savedCommitHashes.has(commit.commitHash)
    );

    if (newCommits.length > 0) {
      await saveCommitsMutation({
        projectId,
        commits: newCommits, // Type matches Response, which is compatible with mutation args
      });
    }
  } catch (err: any) {
    throw new Error(
      err.status === 429 || err.response?.data?.message?.includes("rate limit")
        ? "GitHub API rate limit exceeded. Please wait and try again later."
        : err.status === 403
          ? "Forbidden: Check GitHub token or repo access."
          : "Failed to fetch and save commits."
    );
  }
};
