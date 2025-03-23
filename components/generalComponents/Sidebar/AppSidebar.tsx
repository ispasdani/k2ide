"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "../../ui/sidebar";

import LogoSvg from "@/svgs/LogoSvg";
import SidebarProjectsMenu from "./modules/SidebarProjectsMenu";
import SidebarItemsMenu from "./modules/SidebarItemsMenu";

const AppSidebar = () => {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
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
            <SidebarItemsMenu />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarProjectsMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
