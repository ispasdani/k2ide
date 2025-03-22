"use client";

import { useProjects } from "@/hooks/useProjects";
import { getCommitHashes, Response } from "@/lib/github";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const COMMITS_PER_PAGE = 5;

const Dashboard = () => {
  const { project } = useProjects();
  const [commits, setCommits] = useState<Response[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  console.log("Project:", project);

  const fetchCommits = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const commitData = await getCommitHashes(
        project?.githubUrl || "",
        currentPage,
        COMMITS_PER_PAGE
      );
      setCommits((prevCommits) =>
        currentPage === 1 ? commitData : [...prevCommits, ...commitData]
      );
      setHasMore(commitData.length === COMMITS_PER_PAGE);
    } catch (err: any) {
      console.error("Error fetching commits:", err);
      if (
        err.status === 429 ||
        err.response?.data?.message?.includes("rate limit")
      ) {
        setError(
          "GitHub API rate limit exceeded. Please wait and try again later."
        );
      } else if (err.status === 403) {
        setError("Forbidden: Check GitHub token or repo access.");
      } else {
        setError("Failed to load commits.");
      }
    } finally {
      setLoading(false); // Always reset loading, even on error
    }
  };

  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
    fetchCommits();
  };

  const handleShowLess = () => {
    if (commits.length > COMMITS_PER_PAGE) {
      setCommits((prev) => prev.slice(0, -COMMITS_PER_PAGE));
      setCurrentPage((prev) => prev - 1);
    }
  };

  const canShowLess = commits.length > COMMITS_PER_PAGE;

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

        {/* Button to Trigger Fetch */}
        {commits.length === 0 && !loading && !error && (
          <button
            onClick={fetchCommits}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Get Repository Commits
          </button>
        )}

        {/* Loading State */}
        {loading && <p>Loading commits...</p>}

        {/* Error State */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Commits Display */}
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
                {commit.files && commit.files.length > 0 ? (
                  <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value={commit.commitHash}>
                      <AccordionTrigger>
                        {commit.files.length > 1 ? "Commits" : "Commit"} (
                        {commit.files.length} file
                        {commit.files.length > 1 ? "s" : ""})
                      </AccordionTrigger>
                      <AccordionContent>
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No file changes available.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Pagination Buttons */}
        {!loading && !error && commits.length > 0 && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleShowLess}
              disabled={!canShowLess}
              className={`px-4 py-2 rounded-md ${
                canShowLess
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Show Less
            </button>
            <button
              onClick={handleShowMore}
              disabled={!hasMore || loading}
              className={`px-4 py-2 rounded-md ${
                hasMore && !loading
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
