"use client";

import { useProjects } from "@/hooks/useProjects";
import { getCommitHashes } from "@/lib/github";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const githubUrl: string = "https://github.com/ispasdani/gitnius-app";

// Define the Response type (same as in github.ts)
type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

const Dashboard = () => {
  const { project } = useProjects();
  const [commits, setCommits] = useState<Response[]>([]); // State to store commits
  const [loading, setLoading] = useState<boolean>(true); // Optional: Loading state
  const [error, setError] = useState<string | null>(null); // Optional: Error state

  console.log("Project:", project);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const commitData = await getCommitHashes(
          project?.githubUrl || githubUrl
        );
        setCommits(commitData);
      } catch (err) {
        console.error("Error fetching commits:", err);
        setError("Failed to load commits");
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []); // Re-run if githubUrl changes
  console.log(commits);
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        {/* Github Link */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl} <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          {/* Team Members */}
          {/* Invite Button */}
          {/* Archive Button */}
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {/* AskQuestionCard */}
        </div>
      </div>

      <div className="mt-8">
        {/* Commit Display */}
        <h2 className="text-lg font-semibold">Recent Commits</h2>
        {loading && <p>Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && commits.length === 0 && <p>No commits found.</p>}
        {!loading && !error && commits.length > 0 && (
          <ul className="mt-2 space-y-2">
            {commits.map((commit) => (
              <li key={commit.commitHash} className="border p-2 rounded-md">
                <p>
                  <strong>{commit.commitMessage}</strong> by{" "}
                  {commit.commitAuthorName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(commit.commitDate).toLocaleString()} -{" "}
                  <a
                    href={`https://github.com/ispasdani/gitnius-app/commit/${commit.commitHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {commit.commitHash.substring(0, 7)}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
