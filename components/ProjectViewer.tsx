// File: components/ProjectViewer.tsx
import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import RepositoryImporter from "./repositoryImporter";

// Define the type for a repository file coming from Convex.
interface RepoFile {
  _id: string;
  projectId: string;
  filePath: string; // e.g., "src/index.ts"
  content: string; // File content as text
  metadata: { source: string };
}

// The type for our final UI file tree nodes.
export type FileTreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
  children?: FileTreeNode[];
};

// Internal type used during tree building.
interface InternalFileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
  children: Record<string, InternalFileTreeNode>;
}

/**
 * Build a nested file tree from a flat list of repository files.
 */
function buildFileTree(files: RepoFile[]): FileTreeNode[] {
  const tree: Record<string, InternalFileTreeNode> = {};
  for (const file of files) {
    const parts = file.filePath.split("/");
    let currentLevel = tree;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: currentPath,
          isDirectory: i < parts.length - 1,
          children: {},
        };
      }
      if (i === parts.length - 1) {
        // It's a file.
        currentLevel[part].isDirectory = false;
        currentLevel[part].content = file.content;
      }
      currentLevel = currentLevel[part].children;
    }
  }
  // Convert internal structure to FileTreeNode array.
  function convert(
    nodeRecord: Record<string, InternalFileTreeNode>
  ): FileTreeNode[] {
    return Object.values(nodeRecord).map((node) => {
      const converted: FileTreeNode = {
        name: node.name,
        path: node.path,
        isDirectory: node.isDirectory,
        content: node.content,
      };
      const childKeys = Object.keys(node.children);
      if (childKeys.length > 0) {
        converted.children = convert(node.children);
      }
      return converted;
    });
  }
  return convert(tree);
}

/**
 * Recursive component to display the file tree.
 */
interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelect: (node: FileTreeNode) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ nodes, onSelect }) => {
  return (
    <ul className="pl-4">
      {nodes.map((node) => (
        <li key={node.path}>
          <div
            className="cursor-pointer hover:underline"
            onClick={() => {
              if (!node.isDirectory) onSelect(node);
            }}
          >
            {node.isDirectory ? "📁 " : "📄 "}
            {node.name}
          </div>
          {node.isDirectory && node.children && (
            <FileTree nodes={node.children} onSelect={onSelect} />
          )}
        </li>
      ))}
    </ul>
  );
};

/**
 * A simple code viewer to display file content.
 */
const CodeViewer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-full whitespace-pre-wrap">
      {content}
    </pre>
  );
};

/**
 * Main component that displays the project repository.
 * It includes the RepositoryImporter at the top.
 */
const ProjectViewer: React.FC<{
  projectId: string;
  project: { githubUrl: string; githubToken?: string };
}> = ({ projectId, project }) => {
  // Query repoFiles for this project.
  const repoFiles = useQuery(api.repoFiles.getRepoFiles, {
    projectId: projectId as Id<"project">,
  }) as RepoFile[] | null;

  // State for selected file.
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);

  // Build file tree when repoFiles are loaded.
  const fileTree = useMemo(
    () => (repoFiles ? buildFileTree(repoFiles) : []),
    [repoFiles]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Repository Importer component */}
      <RepositoryImporter
        projectId={projectId}
        githubUrl={project.githubUrl}
        githubToken={project.githubToken}
      />
      <div className="flex flex-1">
        {/* Sidebar: File Tree */}
        <div className="w-1/3 border-r p-4 overflow-auto">
          <h2 className="font-bold mb-2">File Tree</h2>
          {repoFiles && repoFiles.length > 0 ? (
            <FileTree nodes={fileTree} onSelect={setSelectedFile} />
          ) : (
            <div>No repository files found. Click the importer above.</div>
          )}
        </div>
        {/* Main Panel: Code Viewer */}
        <div className="w-2/3 p-4 overflow-auto">
          {selectedFile ? (
            <>
              <h2 className="font-bold mb-2">{selectedFile.name}</h2>
              {selectedFile.content ? (
                <CodeViewer content={selectedFile.content} />
              ) : (
                <div>This is a folder or has no viewable content.</div>
              )}
            </>
          ) : (
            <div>Select a file from the tree to view its content.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectViewer;
