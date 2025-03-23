import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { items } from "@/consts/SidebarItemsMenuConsts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const SidebarItemsMenu = () => {
  const pathname = usePathname();

  return (
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
  );
};

export default SidebarItemsMenu;
