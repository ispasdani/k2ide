// File: components/RepositoryImporter.tsx
import React, { useState } from "react";
import JSZip from "jszip";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface RepoFile {
  filePath: string;
  content: string;
  metadata: {
    source: string;
  };
}

interface RepositoryImporterProps {
  projectId: string;
  githubUrl: string;
  githubToken?: string;
}

const RepositoryImporter: React.FC<RepositoryImporterProps> = ({
  projectId,
  githubUrl,
  githubToken,
}) => {
  // Query to check if repo files exist.
  const repoFiles = useQuery(api.repoFiles.getRepoFiles, {
    projectId: projectId as Id<"project">,
  }) as RepoFile[] | null;

  const importRepositoryMutation = useMutation(
    api.importrepository.importRepository
  );
  const [status, setStatus] = useState<string>("");

  const handleImport = async () => {
    setStatus("Downloading repository ZIP...");
    try {
      // Use our proxy endpoint to avoid CORS issues.
      const proxyUrl = `/api/githubZip?githubUrl=${encodeURIComponent(
        githubUrl
      )}${githubToken ? `&githubToken=${encodeURIComponent(githubToken)}` : ""}`;

      const zipResponse = await fetch(proxyUrl);
      if (!zipResponse.ok) {
        throw new Error(`Failed to download ZIP: ${zipResponse.statusText}`);
      }
      const blob = await zipResponse.blob();
      setStatus("Unzipping repository...");

      const jszip = new JSZip();
      const zip = await jszip.loadAsync(blob);
      const filesToImport: RepoFile[] = [];

      const filePromises: Promise<void>[] = [];
      zip.forEach((relativePath, file) => {
        if (!file.dir && relativePath) {
          const promise = file
            .async("text")
            .then((content) => {
              // Remove the root folder prefix if present.
              const parts = relativePath.split("/");
              parts.shift();
              const cleanedPath = parts.join("/");
              if (cleanedPath) {
                filesToImport.push({
                  filePath: cleanedPath,
                  content,
                  metadata: { source: "GitHub" },
                });
              }
            })
            .catch((e) =>
              console.error("Failed to read file", relativePath, e)
            );
          filePromises.push(promise);
        }
      });
      await Promise.all(filePromises);
      setStatus("Saving repository files...");

      // Use !! to ensure update is a boolean.
      const update = !!(repoFiles && repoFiles.length > 0);
      await importRepositoryMutation({
        projectId: projectId as Id<"project">,
        files: filesToImport,
        update,
      });

      setStatus("Repository imported successfully!");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="p-4 border-b">
      <button
        onClick={handleImport}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {repoFiles && repoFiles.length > 0
          ? "Update Repository"
          : "Get Project Repository"}
      </button>
      <p>{status}</p>
    </div>
  );
};

export default RepositoryImporter;
