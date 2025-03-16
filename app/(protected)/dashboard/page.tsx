"use client";

import { useProjects } from "@/hooks/useProjects";
import { getCommitHashes, Response } from "@/lib/github"; // Import Response type
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const githubUrl: string = "https://github.com/ispasdani/gitnius-app";

const Dashboard = () => {
  const { project } = useProjects();
  const [commits, setCommits] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [project?.githubUrl]);

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
        <h2 className="text-lg font-semibold">Recent Commits</h2>
        {loading && <p>Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && commits.length === 0 && <p>No commits found.</p>}
        {!loading && !error && commits.length > 0 && (
          <ul className="mt-2 space-y-4">
            {commits.map((commit) => (
              <li key={commit.commitHash} className="border p-4 rounded-md">
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
                {/* Display file changes */}
                {commit.files && commit.files.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Changes:</p>
                    <ul className="ml-4 list-disc text-sm text-gray-700">
                      {commit.files.map((file, index) => (
                        <li key={index}>
                          <span className="font-mono">{file.filename}</span>
                          {file.patch && (
                            <pre className="mt-1 p-2 bg-gray-100 rounded-md text-xs overflow-auto">
                              {file.patch}
                            </pre>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No file changes available.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
