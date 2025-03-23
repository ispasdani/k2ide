"use client";

import React, { useState } from "react";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { useMutation, useQuery } from "convex/react";
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
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const saveDocument = useMutation(api.repoDocuments.saveDocument);
  const documents = useQuery(api.repoDocuments.getDocumentsByProject, {
    projectId,
  });
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ""
  );

  const handleAnalyzeProject = async () => {
    if (documents && documents.length > 0) return;

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      const loader = new GithubRepoLoader(githubUrl, {
        branch: "main",
        recursive: true,
        accessToken: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
        ignoreFiles: [
          "package.json",
          "package-lock.json",
          "node_modules/**",
          "postcss.config.mjs",
          "tailwind.config.ts",
          "*.md",
          "*.lock",
          "*.config.js",
          "*.config.ts",
        ],
      });
      const docs = await loader.load();

      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const MAX_BYTES = 30000;

      const relevantDocs = docs.filter((doc) =>
        /\/(components|src|app|hooks|convex|lib|utils|pages|_app|_document)\//i.test(
          doc.metadata.source
        )
      );

      for (const doc of relevantDocs) {
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(doc.pageContent);

        if (contentBytes.length <= MAX_BYTES) {
          const embeddingResult = await model.embedContent(doc.pageContent);
          const embedding = embeddingResult.embedding.values;
          await saveDocument({
            projectId,
            filePath: doc.metadata.source,
            pageContent: doc.pageContent,
            metadata: { source: githubUrl },
            embedding,
          });
        } else {
          const chunks = [];
          let start = 0;
          while (start < contentBytes.length) {
            const end = Math.min(start + MAX_BYTES, contentBytes.length);
            const chunkBytes = contentBytes.slice(start, end);
            const chunkContent = new TextDecoder().decode(chunkBytes);
            chunks.push(chunkContent);
            start = end;
          }

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embeddingResult = await model.embedContent(chunk);
            const embedding = embeddingResult.embedding.values;
            await saveDocument({
              projectId,
              filePath: `${doc.metadata.source}_chunk_${i + 1}`,
              pageContent: chunk,
              metadata: {
                source: githubUrl,
                chunk: `${i + 1}/${chunks.length}`,
              },
              embedding,
            });
          }
          console.log(
            `Split ${doc.metadata.source} into ${chunks.length} chunks`
          );
        }
      }
    } catch (error: any) {
      console.error("Error analyzing repo:", error);
      setAnalysisError(
        error.message.includes("rate limit")
          ? "GitHub API rate limit exceeded. Please add a GitHub token in your environment variables."
          : "Failed to analyze the repository. Please try again."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question || !documents || documents.length === 0) return;
    setLoading(true);
    setAnswer("");

    try {
      const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });
      const questionEmbeddingResult = await embedModel.embedContent(question);
      const questionEmbedding = questionEmbeddingResult.embedding.values;

      const scoredDocs = documents
        .filter((doc) => doc.embedding !== undefined)
        .map((doc) => ({
          doc,
          similarity: cosineSimilarity(
            questionEmbedding,
            doc.embedding as number[]
          ),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      const context =
        scoredDocs.length > 0
          ? scoredDocs.map((item) => item.doc.pageContent).join("\n\n")
          : "No relevant documents found.";

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

      const promptTemplate = PromptTemplate.fromTemplate(
        `Answer the following question based on the provided context from the GitHub repository:
        Context: {context}
        Question: {question}
        Answer concisely and accurately.`
      );

      const geminiRunnable = {
        invoke: async (input: { context: string; question: string }) => {
          const prompt = await promptTemplate.format(input);
          const result = await model.generateContent(prompt);
          return { content: result.response.text() };
        },
      };

      const chain = RunnableSequence.from([
        { context: () => context, question: () => question },
        geminiRunnable,
        new StringOutputParser(),
      ]);

      const response = await chain.invoke({});
      setAnswer(response);
    } catch (error) {
      console.error("Error answering question:", error);
      setAnswer("Sorry, an error occurred while processing your question.");
    } finally {
      setLoading(false);
    }
  };

  const isAnalyzed = documents && documents.length > 0; // Explicit check for documents

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        Ask a Question About the Project
      </h3>
      {!isAnalyzed && (
        <button
          onClick={handleAnalyzeProject}
          disabled={analysisLoading}
          className={`mb-4 px-4 py-2 rounded-md ${
            analysisLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {analysisLoading ? "Analyzing..." : "Let AI Analyze Your Project"}
        </button>
      )}
      {analysisError && <p className="text-red-500 mb-2">{analysisError}</p>}
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
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export default AskQuestionCard;
