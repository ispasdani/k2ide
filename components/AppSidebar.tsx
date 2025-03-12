"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  Bot,
  Code,
  CreditCard,
  Home,
  LayoutDashboard,
  Plus,
  SquareDashedKanban,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import LogoSvg from "@/svgs/LogoSvg";
import { useProjects } from "@/hooks/useProjects";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "AI Code Editor",
    url: "/gitnius-editor",
    icon: Code,
  },
  {
    title: "Wireframe To Code",
    url: "/wireframe-to-code",
    icon: SquareDashedKanban,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

const projects = [
  {
    name: "Project1",
  },
  {
    name: "Project2",
  },
  {
    name: "project3",
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProjects();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-start">
          <LogoSvg className="w-[24px] h-[24px] m-2" />
          {open && <h1 className="text-2xl font-bold text-primary">K2-IDE</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          {
                            "!bg-primary !text-white": pathname === item.url,
                          },
                          "list-none"
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects
                ?.filter((project) => project.role === "owner")
                .map((project) => {
                  return (
                    <SidebarMenuItem
                      key={project._id}
                      className="cursor-pointer"
                    >
                      <SidebarMenuButton asChild>
                        <div onClick={() => setProjectId(project._id)}>
                          <div
                            className={cn(
                              "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                              {
                                "bg-primary text-white":
                                  project._id === projectId,
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
