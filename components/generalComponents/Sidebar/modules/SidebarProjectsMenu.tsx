import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const SidebarProjectsMenu = () => {
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProjects();

  return (
    <SidebarMenu>
      {projects
        ?.filter((project) => project.role === "owner")
        .map((project) => {
          return (
            <SidebarMenuItem key={project._id} className="cursor-pointer">
              <SidebarMenuButton asChild>
                <div onClick={() => setProjectId(project._id)}>
                  <div
                    className={cn(
                      "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                      {
                        "bg-primary text-white": project._id === projectId,
                      }
                    )}
                  >
                    {project.projectName[0]}
                  </div>
                  <span>{project.projectName}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}

      <div className="h-2"></div>
      <SidebarMenuItem>
        <Link href={"/create"}>
          <Button
            size={"sm"}
            variant={"outline"}
            className="w-fit cursor-pointer"
          >
            <Plus />
            {open && "Create Project"}
          </Button>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarProjectsMenu;
