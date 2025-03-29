"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type FileTreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
  children?: FileTreeNode[];
};

interface ProjectCodeEditorProps {
  fileTree: FileTreeNode[];
  projectId: Id<"project">;
}

const ProjectCodeEditor: React.FC<ProjectCodeEditorProps> = ({
  fileTree,
  projectId,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"editor" | "terminal">("editor");
  const [terminalOutput, setTerminalOutput] = useState<string>(
    "Terminal output will be shown here."
  );

  const updateFile = useMutation(api.repoFiles.updateRepoFile);

  useEffect(() => {
    if (selectedFile && !selectedFile.isDirectory) {
      setEditorContent(selectedFile.content || "");
    }
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile || selectedFile.isDirectory) return;
    try {
      await updateFile({
        projectId,
        filePath: selectedFile.path,
        content: editorContent,
      });
      setTerminalOutput(`File "${selectedFile.name}" saved successfully.`);
    } catch (error: any) {
      setTerminalOutput(`Error saving file: ${error.message}`);
    }
  };

  const renderFileTree = (nodes: FileTreeNode[]) => (
    <ul className="pl-4 text-gray-300">
      {nodes.map((node) => (
        <li key={node.path}>
          <div
            className={`cursor-pointer p-1 rounded hover:bg-gray-600 ${
              selectedFile?.path === node.path && !node.isDirectory
                ? "bg-gray-600"
                : ""
            }`}
            onClick={() => {
              if (!node.isDirectory) setSelectedFile(node);
            }}
          >
            {node.isDirectory ? "📁" : "📄"}{" "}
            <span className="text-sm">{node.name}</span>
          </div>
          {node.isDirectory && node.children && renderFileTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] font-sans">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-[#333333] border-b border-[#252526] text-gray-300">
        <div className="flex space-x-1">
          <button
            className={`px-3 py-1 text-sm ${
              activeTab === "editor"
                ? "bg-[#007ACC] text-white"
                : "bg-[#3C3C3C] hover:bg-[#4E4E4E]"
            } rounded-t`}
            onClick={() => setActiveTab("editor")}
          >
            Editor
          </button>
          <button
            className={`px-3 py-1 text-sm ${
              activeTab === "terminal"
                ? "bg-[#007ACC] text-white"
                : "bg-[#3C3C3C] hover:bg-[#4E4E4E]"
            } rounded-t`}
            onClick={() => setActiveTab("terminal")}
          >
            Terminal
          </button>
        </div>
        <button
          className="px-3 py-1 bg-[#007ACC] text-white text-sm rounded hover:bg-[#005F9E] disabled:bg-gray-600 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={!selectedFile || selectedFile.isDirectory}
        >
          Save
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#333333] overflow-auto p-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">
            Explorer
          </h2>
          {fileTree.length > 0 ? (
            renderFileTree(fileTree)
          ) : (
            <p className="text-gray-500 text-sm px-1">No files available</p>
          )}
        </div>
        {/* Editor/Terminal */}
        <div className="w-[50vw] h-[50vh] flex flex-col overflow-auto">
          {activeTab === "editor" &&
          selectedFile &&
          !selectedFile.isDirectory ? (
            <Editor
              width="100%"
              height="100%"
              language={getLanguageFromPath(selectedFile.path)} // Dynamic language
              theme="vs-dark"
              value={editorContent}
              onChange={(value) => setEditorContent(value || "")}
              options={{
                automaticLayout: true,
                minimap: { enabled: true }, // VS Code-like minimap
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          ) : activeTab === "terminal" && selectedFile ? (
            <div className="flex-1 bg-[#1E1E1E] text-green-400 p-4 overflow-auto font-mono text-sm">
              {terminalOutput}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a file to begin editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to determine language based on file extension
const getLanguageFromPath = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

export default ProjectCodeEditor;
