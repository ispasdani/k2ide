"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useCommitsStore } from "@/store/commitStore";
import { Id } from "@/convex/_generated/dataModel";

// You might have a type for your project documents. For instance:
// import type { Doc } from "@/convex/_generated/dataModel";
// type Project = Doc<"project">;
// For this example, we'll use a generic Project type.
export type Project = {
  _id: Id<"project">;
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
  const { projectId, setProjectId } = useCommitsStore();

  // Always call the query hook.
  // Note: When user is not loaded, you can pass an empty string (or handle that inside your query)
  const projects = useQuery(api.projects.getUserProjects, {
    clerkId: user?.id || "",
  }) as Project[] | undefined;

  // Compute the selected project (if any) by matching the stored projectId.
  const project = projects?.find((p) => p._id === projectId) || null;

  return { projects, projectId, setProjectId, project };
}
