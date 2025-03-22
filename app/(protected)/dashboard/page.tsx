"use client";

import { useProjects } from "@/hooks/useProjects";
import { fetchAndSaveNewCommits, Commit } from "@/lib/commits";
import { ExternalLink, GitCommitVertical, Github } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FileChange } from "@/lib/github";

const COMMITS_PER_PAGE = 5;

const Dashboard = () => {
  const { project } = useProjects();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayPage, setDisplayPage] = useState<number>(1);

  const saveCommitsMutation = useMutation(api.commits.saveCommits);
  const savedCommits = useQuery(
    api.commits.getCommitsByProject,
    project?._id ? { projectId: project._id as Id<"project"> } : "skip"
  ) as Commit[] | undefined; // Explicitly type as Commit[]

  const handleFetchCommits = async () => {
    if (!project?.githubUrl || !project?._id) {
      setError("Missing GitHub URL or project ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchAndSaveNewCommits(
        project.githubUrl,
        project._id as Id<"project">,
        savedCommits,
        saveCommitsMutation,
        COMMITS_PER_PAGE
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paginatedCommits = savedCommits
    ? savedCommits.slice(0, displayPage * COMMITS_PER_PAGE)
    : [];
  const canShowLess = paginatedCommits.length > COMMITS_PER_PAGE;
  const hasMore = (savedCommits?.length || 0) > paginatedCommits.length;

  const handleShowMore = () => {
    setDisplayPage((prev) => prev + 1);
  };

  const handleShowLess = () => {
    if (paginatedCommits.length > COMMITS_PER_PAGE) {
      setDisplayPage((prev) => prev - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
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

        {(!savedCommits || savedCommits.length === 0) && !loading && !error && (
          <button
            onClick={handleFetchCommits}
            className="flex mt-2 pl-2 pr-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
          >
            <GitCommitVertical />
            Get Repository Commits
          </button>
        )}

        {savedCommits && savedCommits.length > 0 && !loading && !error && (
          <button
            onClick={handleFetchCommits}
            className="flex mt-2 pl-2 pr-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
          >
            <GitCommitVertical />
            Update Commits
          </button>
        )}

        {loading && <p>Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && paginatedCommits.length > 0 && (
          <ul className="mt-2 space-y-4">
            {paginatedCommits.map((commit) => (
              <li
                key={commit.commitHash}
                className="border p-4 rounded-md bg-sidebar"
              >
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
                      <AccordionTrigger className="p-0">
                        {commit.files.length > 1 ? "Commits" : "Commit"} (
                        {commit.files.length} file
                        {commit.files.length > 1 ? "s" : ""})
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="ml-4 list-disc text-sm text-gray-700">
                          {commit.files.map(
                            (file: FileChange, index: number) => (
                              <li key={index}>
                                <span className="font-mono">
                                  {file.filename}
                                </span>
                                {file.patch && (
                                  <pre className="mt-1 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">
                                    {file.patch}
                                  </pre>
                                )}
                              </li>
                            )
                          )}
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

        {!loading && !error && paginatedCommits.length > 0 && (
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
