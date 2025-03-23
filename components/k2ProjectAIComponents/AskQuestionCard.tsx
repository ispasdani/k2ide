"use client";

import React, { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const AskQuestionCard = ({
  githubUrl,
  projectId,
}: {
  githubUrl: string;
  projectId: Id<"project">;
}) => {
  const [branch, setBranch] = useState("main");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);

  const files = useQuery(api.repoFiles.getFilesByProject, { projectId });
  const analyzeRepo = useAction(api.analyzerepo.analyzeRepo);

  const handleAnalyzeProject = async () => {
    if (files && files.length > 0) {
      setAnalysisFeedback(`Analyzed ${files.length} files`);
      return;
    }

    setAnalysisLoading(true);
    setAnalysisFeedback(null);

    try {
      const result = await analyzeRepo({ githubUrl, projectId, branch });
      setAnalysisFeedback(
        `Analyzed ${result.savedFiles} files from branch "${branch}"`
      );
    } catch (error: any) {
      console.error("Error analyzing repo:", error);
      setAnalysisFeedback("Failed to analyze repository: " + error.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        Ask a Question About the Project
      </h3>
      {!files?.length && (
        <div className="mb-4">
          <label
            htmlFor="branch"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            GitHub Branch (default: main)
          </label>
          <input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g., main, dev"
            className="w-full p-2 border rounded-md mb-2"
          />
          <button
            onClick={handleAnalyzeProject}
            disabled={analysisLoading}
            className={`px-4 py-2 rounded-md ${
              analysisLoading
                ? "bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {analysisLoading ? "Analyzing..." : "Analyze Project Repository"}
          </button>
        </div>
      )}
      {analysisFeedback && (
        <p className="text-gray-600 mb-2">{analysisFeedback}</p>
      )}
    </div>
  );
};

export default AskQuestionCard;
