"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRepoStore, RepoFile } from "@/store/repoStore";
import ProjectCodeEditor, {
  FileTreeNode,
} from "../generalComponents/CodeEditor";
import RepositoryImporter from "./repositoryImporter";

function buildFileTree(files: RepoFile[]): FileTreeNode[] {
  const tree: Record<string, any> = {};
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
        currentLevel[part].isDirectory = false;
        currentLevel[part].content = file.content;
      }
      currentLevel = currentLevel[part].children;
    }
  }
  function convert(nodeRecord: Record<string, any>): FileTreeNode[] {
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

const CodeViewer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-full whitespace-pre-wrap">
      {content}
    </pre>
  );
};

const ProjectViewer: React.FC<{
  projectId: string;
  project: { githubUrl: string; githubToken?: string };
}> = ({ projectId, project }) => {
  const queryRepoFiles = useQuery(api.repoFiles.getRepoFiles, {
    projectId: projectId as Id<"project">,
  }) as RepoFile[] | null;

  const { repoFiles, setRepoFiles } = useRepoStore();

  // Reset repoFiles when projectId changes
  useEffect(() => {
    // Clear repoFiles when projectId changes to ensure old data isn't displayed
    setRepoFiles([]);
  }, [projectId, setRepoFiles]);

  // Sync repoFiles with query data
  useEffect(() => {
    if (queryRepoFiles && queryRepoFiles.length > 0) {
      setRepoFiles(queryRepoFiles);
    }
  }, [queryRepoFiles, setRepoFiles]);

  const filesForDisplay =
    repoFiles.length > 0 ? repoFiles : queryRepoFiles || [];
  const fileTree = useMemo(
    () => (filesForDisplay ? buildFileTree(filesForDisplay) : []),
    [filesForDisplay]
  );

  const [editorMode, setEditorMode] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);

  return (
    <div className="flex h-full flex-col">
      <RepositoryImporter
        projectId={projectId}
        githubUrl={project.githubUrl}
        githubToken={project.githubToken}
      />
      <div className="p-4 border-b">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => setEditorMode((prev) => !prev)}
        >
          {editorMode ? "Close Code Editor" : "Open Code Editor"}
        </button>
      </div>
      {editorMode ? (
        <div className="flex flex-1">
          <ProjectCodeEditor
            fileTree={fileTree}
            projectId={projectId as Id<"project">}
          />
        </div>
      ) : (
        <div className="flex flex-1">
          <div className="border-r p-4 overflow-auto">
            <h2 className="font-bold mb-2">File Tree</h2>
            {filesForDisplay.length > 0 ? (
              <FileTree nodes={fileTree} onSelect={setSelectedFile} />
            ) : (
              <div>No repository files found. Click the importer above.</div>
            )}
          </div>
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
      )}
    </div>
  );
};

export default ProjectViewer;
