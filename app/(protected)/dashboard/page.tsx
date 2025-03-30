"use client";

import ProjectTeam from "@/components/dashboard/ProjectTeam";
import ProjectLinked from "@/components/generalComponents/ProjectLinked";
import { useProjects } from "@/hooks/useProjects";
import React from "react";

const Dashboard = () => {
  const { project } = useProjects(); // assume this returns { project } with projectId etc
  return (
    <div>
      <div className="flex items-start justify-start flex-col flex-wrap gap-y-4">
        <ProjectLinked />

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          {project ? (
            <ProjectTeam projectId={project._id} />
          ) : (
            <div>No project found.</div>
          )}
          {/* Team Members */}
          {/* Invite Button */}
          {/* Archive Button */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
