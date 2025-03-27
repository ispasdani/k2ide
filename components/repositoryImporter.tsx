// File: components/RepositoryImporter.tsx
import React, { useState } from "react";
import JSZip from "jszip";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface RepoFile {
  filePath: string;
  content: string;
  metadata: {
    source: string;
  };
}

const RepositoryImporter: React.FC<{
  projectId: string;
  githubUrl: string;
  githubToken?: string;
}> = ({ projectId, githubUrl, githubToken }) => {
  const importRepositoryMutation = useMutation(
    api.importrepository.importRepository
  );
  const [status, setStatus] = useState<string>("");

  // Function to fetch and unzip the repository from GitHub using our proxy endpoint.
  const handleImport = async () => {
    setStatus("Downloading repository ZIP...");
    try {
      // Build the proxy URL. Our API route (e.g. /api/githubZip) will handle fetching the ZIP.
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

      // Collect promises to ensure all files are processed.
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
            .catch((e) => {
              console.error("Failed to read file", relativePath, e);
            });
          filePromises.push(promise);
        }
      });
      await Promise.all(filePromises);

      setStatus("Saving repository files...");
      // Call the mutation with the array of file objects.
      await importRepositoryMutation({
        projectId: projectId as Id<"project">,
        files: filesToImport,
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
        Get Project Repository
      </button>
      <p>{status}</p>
    </div>
  );
};

export default RepositoryImporter;
