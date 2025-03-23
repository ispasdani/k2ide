"use client";

import { useProjects } from "@/hooks/useProjects";
import { fetchAndSaveNewCommits, Commit } from "@/lib/commits";
import { GitCommitVertical } from "lucide-react";
import React from "react";
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
import ProjectLinked from "@/components/generalComponents/ProjectLinked";
import { useCommitsStore } from "@/store/commitStore";
import AskQuestionCard from "@/components/k2ProjectAIComponents/AskQuestionCard";

const COMMITS_PER_PAGE = 5;

const K2ProjectAI = () => {
  const { project } = useProjects();
  const projectId = project?._id as Id<"project"> | undefined;
  const {
    savedCommits,
    displayPage,
    loading,
    error,
    setSavedCommits,
    setDisplayPage,
    setLoading,
    setError,
  } = useCommitsStore();

  const saveCommitsMutation = useMutation(api.commits.saveCommits);
  const fetchedCommits = useQuery(
    api.commits.getCommitsByProject,
    projectId ? { projectId } : "skip"
  ) as Commit[] | undefined;

  // Sync Convex data with store
  React.useEffect(() => {
    if (projectId && fetchedCommits !== undefined) {
      setSavedCommits(projectId, fetchedCommits);
    }
  }, [projectId, fetchedCommits, setSavedCommits]);

  const handleFetchCommits = async () => {
    if (!project?.githubUrl || !projectId) {
      setError(projectId || "unknown", "Missing GitHub URL or project ID.");
      return;
    }

    setLoading(projectId, true);
    setError(projectId, null);

    try {
      await fetchAndSaveNewCommits(
        project.githubUrl,
        projectId,
        savedCommits[projectId],
        saveCommitsMutation,
        COMMITS_PER_PAGE
      );
    } catch (err: any) {
      setError(projectId, err.message);
    } finally {
      setLoading(projectId, false);
    }
  };

  const paginatedCommits =
    projectId && savedCommits[projectId]
      ? savedCommits[projectId]!.slice(
          0,
          (displayPage[projectId] || 1) * COMMITS_PER_PAGE
        )
      : [];
  const canShowLess = paginatedCommits.length > COMMITS_PER_PAGE;
  const hasMore =
    projectId && savedCommits[projectId]
      ? savedCommits[projectId]!.length > paginatedCommits.length
      : false;

  const handleShowMore = () =>
    projectId && setDisplayPage(projectId, (displayPage[projectId] || 1) + 1);
  const handleShowLess = () => {
    if (projectId && paginatedCommits.length > COMMITS_PER_PAGE) {
      setDisplayPage(projectId, (displayPage[projectId] || 1) - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <ProjectLinked />
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          {/* Team Members, Invite, Archive */}
        </div>
      </div>

      <div className="mt-4">
        {project && (
          <AskQuestionCard
            githubUrl={project.githubUrl}
            projectId={project._id}
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Recent Commits</h2>

        {(!savedCommits[projectId!] ||
          savedCommits[projectId!]!.length === 0) &&
          !loading[projectId!] &&
          !error[projectId!] && (
            <button
              onClick={handleFetchCommits}
              className="flex mt-2 pl-2 pr-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
            >
              <GitCommitVertical />
              Get Repository Commits
            </button>
          )}

        {savedCommits[projectId!] &&
          savedCommits[projectId!]!.length > 0 &&
          !loading[projectId!] &&
          !error[projectId!] && (
            <button
              onClick={handleFetchCommits}
              className="flex mt-2 pl-2 pr-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
            >
              <GitCommitVertical />
              Update Commits
            </button>
          )}

        {loading[projectId!] && <p>Loading commits...</p>}
        {error[projectId!] && (
          <p className="text-red-500">{error[projectId!]}</p>
        )}

        {!loading[projectId!] &&
          !error[projectId!] &&
          paginatedCommits.length > 0 && (
            <ul className="mt-2 space-y-4">
              {paginatedCommits.map((commit: Commit) => (
                <li
                  key={commit.commitHash}
                  className="border p-4 rounded-md bg-sidebar"
                >
                  <div className="flex items-center gap-3">
                    {commit.commitAuthorAvatar && (
                      <img
                        src={commit.commitAuthorAvatar}
                        alt={`${commit.commitAuthorName}'s avatar`}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
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
                    </div>
                  </div>
                  {commit.files && commit.files.length > 0 ? (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value={commit.commitHash}>
                        <AccordionTrigger className="p-0 cursor-pointer">
                          {commit.files.length > 1 ? "Commits" : "Commit"} (
                          {commit.files.length} file
                          {commit.files.length > 1 ? "s" : ""})
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="ml-4 list-disc text-sm text-gray-700 overflow-x-auto">
                            {commit.files.map(
                              (file: FileChange, index: number) => (
                                <li key={index} className="mb-5">
                                  <span className="font-mono">
                                    {file.filename}
                                  </span>
                                  {file.patch && (
                                    <div className="mt-1 w-full overflow-x-auto">
                                      <pre className="p-2 bg-gray-100 rounded-md text-xs whitespace-pre-wrap break-words">
                                        {file.patch}
                                      </pre>
                                    </div>
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

        {!loading[projectId!] &&
          !error[projectId!] &&
          paginatedCommits.length > 0 && (
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
                disabled={!hasMore || loading[projectId!]}
                className={`px-4 py-2 rounded-md ${
                  hasMore && !loading[projectId!]
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

export default K2ProjectAI;
