import AppSidebar from "@/components/generalComponents/Sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full">
        <div className="h-[5vh] flex items-center gap-2 border-sidebar-border bg-sidebar border p-2">
          <SidebarTrigger className="cursor-pointer" />
          {/* <SearchBar /> */}
          <div className="ml-auto"></div>
          <UserButton />
        </div>

        {/* Main Content*/}
        <div className="border-sidebar-border border shadow overflow-y-scroll-auto min-h-[95vh] p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
