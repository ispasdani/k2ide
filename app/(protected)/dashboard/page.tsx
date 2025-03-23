import ProjectLinked from "@/components/generalComponents/ProjectLinked";
import React from "react";

const Dashboard = () => {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <ProjectLinked />

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          {/* Team Members */}
          {/* Invite Button */}
          {/* Archive Button */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
