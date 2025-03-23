"use client";

import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

const ProjectLinked = () => {
  const { project } = useProjects();

  return (
    <div className="w-fit rounded-md bg-primary px-4 py-3">
      <div className="flex items-center">
        <Github className="size-5 text-white" />
        <div className="ml-2">
          <p className="text-sm font-medium text-white">
            This project is linked to{" "}
            <Link
              href={project?.githubUrl ?? ""}
              className="inline-flex items-center text-white/80 hover:underline"
            >
              {project?.githubUrl} <ExternalLink className="ml-1 size-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectLinked;
