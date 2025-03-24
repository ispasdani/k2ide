"use client";

import React, { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
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
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relevantFiles, setRelevantFiles] = useState<
    { filePath: string; content: string }[]
  >([]);
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);

  const files = useQuery(api.repoFiles.getFilesByProject, { projectId });
  const analyzeRepo = useAction(api.analyzerepo.analyzeRepo);

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ""
  );

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

  const handleAskQuestion = async () => {
    if (!question || !files || files.length === 0) return;
    setLoading(true);
    setAnswer("");
    setRelevantFiles([]);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0 },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const context = files
        .map((file) => `File: ${file.filePath}\nContent: ${file.content}`)
        .join("\n\n");
      const prompt = `Answer this question based on the provided project files and your general coding knowledge:\n\nProject Files:\n${context}\n\nQuestion: ${question}`;

      const result = await model.generateContent(prompt);
      const answerText = result.response.text();
      setAnswer(answerText);

      // Find files whose content appears in the answer
      const matchedFiles = files
        .filter((file) => answerText.includes(file.content.slice(0, 50))) // Check first 50 chars for partial match
        .map((file) => ({ filePath: file.filePath, content: file.content }));
      setRelevantFiles(matchedFiles);
    } catch (error) {
      console.error("Error answering question:", error);
      setAnswer("Sorry, an error occurred while processing your question.");
    } finally {
      setLoading(false);
    }
  };

  const isAnalyzed = files && files.length > 0;

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        Ask a Question About the Project
      </h3>
      {!isAnalyzed && (
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
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g., What does this project do?"
        className="w-full p-2 border rounded-md mb-2"
        rows={3}
        disabled={!isAnalyzed}
      />
      <button
        onClick={handleAskQuestion}
        disabled={loading || !isAnalyzed}
        className={`px-4 py-2 rounded-md ${
          loading || !isAnalyzed
            ? "bg-gray-400"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        {loading
          ? "Processing..."
          : isAnalyzed
            ? "Ask"
            : "Analyze project first"}
      </button>
      {answer && (
        <div className="mt-4">
          <h4 className="font-semibold">Answer:</h4>
          <p className="mb-2">{answer}</p>
          {relevantFiles.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-700">Relevant Files:</h5>
              {relevantFiles.map((file, index) => (
                <div key={index} className="mt-2">
                  <p className="text-sm text-gray-600">File: {file.filePath}</p>
                  <pre className="bg-gray-100 p-2 rounded-md text-sm overflow-auto max-h-64">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuestionCard;
