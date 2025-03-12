"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// You might have a type for your project documents. For instance:
// import type { Doc } from "@/convex/_generated/dataModel";
// type Project = Doc<"project">;
// For this example, we'll use a generic Project type.
export type Project = {
  _id: string;
  projectName: string;
  githubUrl: string;
  githubToken: string;
  projectId: string;
  role: string;
  sharedWith: [];
  // any other fields from your schema
};

export function useProjects() {
  const { user } = useUser();

  // Get the initial projectId from localStorage (if any)
  const [projectId, setProjectId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("projectId") || "";
    }
    return "";
  });

  // Update localStorage whenever projectId changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (projectId) {
        localStorage.setItem("projectId", projectId);
      } else {
        localStorage.removeItem("projectId");
      }
    }
  }, [projectId]);

  // Always call the query hook.
  // Note: When user is not loaded, you can pass an empty string (or handle that inside your query)
  const projects = useQuery(api.projects.getUserProjects, {
    clerkId: user?.id || "",
  }) as Project[] | undefined;

  // Compute the selected project (if any) by matching the stored projectId.
  const project = projects?.find((p) => p._id === projectId);

  return { projects, projectId, setProjectId, project };
}
