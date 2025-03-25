// File: components/ProjectViewer.tsx
import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ProjectFile {
  _id: string;
  projectId: string;
  path: string; // e.g., "src/index.ts"
  name: string; // e.g., "index.ts"
  isDirectory: boolean;
  content?: string; // Only for files
}

// Define a type for our tree nodes.
type FileTreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
  children?: FileTreeNode[];
};

/**
 * Build a nested file tree from a flat list of project files.
 * Assumes that file paths use "/" as separator.
 */
function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  // Use an object to build the tree.
  const tree: {
    [key: string]: FileTreeNode & { children: Record<string, FileTreeNode> };
  } = {};

  for (const file of files) {
    const parts = file.path.split("/");
    let currentLevel = tree;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: currentPath,
          isDirectory: i < parts.length - 1 || file.isDirectory,
          children: {},
        };
      }
      if (i === parts.length - 1 && !file.isDirectory) {
        // It is a file, so store its content.
        currentLevel[part].isDirectory = false;
        currentLevel[part].content = file.content;
      }
      currentLevel = currentLevel[part].children;
    }
  }

  // Recursively convert our object to an array.
  function convert(level: Record<string, FileTreeNode>): FileTreeNode[] {
    return Object.values(level).map((node) => {
      if (node.isDirectory && node.children) {
        return { ...node, children: convert(node.children) };
      }
      return node;
    });
  }
  return convert(tree);
}

/**
 * Recursive component to render the file tree.
 * Clicking on a file (not a folder) will call onSelect.
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
 * Main component to display the repository.
 * It queries Convex for project files, builds a file tree, and shows file content.
 */
const ProjectViewer: React.FC<{ projectId: string }> = ({ projectId }) => {
  // Query Convex for files belonging to this project.
  const files = useQuery(api.projects.getProjectFiles, {
    projectId,
  }) as ProjectFile[];

  // State to keep track of the selected file.
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);

  // Build a file tree structure from the flat file list.
  const fileTree = useMemo(() => (files ? buildFileTree(files) : []), [files]);

  if (!files) {
    return <div>Loading project files...</div>;
  }

  return (
    <div className="flex h-full">
      {/* Sidebar: File Tree */}
      <div className="w-1/3 border-r p-4 overflow-auto">
        <h2 className="font-bold mb-2">File Tree</h2>
        <FileTree nodes={fileTree} onSelect={setSelectedFile} />
      </div>

      {/* Main Panel: Code Viewer */}
      <div className="w-2/3 p-4 overflow-auto">
        {selectedFile ? (
          <>
            <h2 className="font-bold mb-2">{selectedFile.name}</h2>
            {selectedFile.content ? (
              <CodeViewer content={selectedFile.content} />
            ) : (
              <div>This item is a folder or has no viewable content.</div>
            )}
          </>
        ) : (
          <div>Select a file from the tree to view its content.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectViewer;
