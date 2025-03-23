import {
  Bot,
  Code,
  CreditCard,
  Home,
  LayoutDashboard,
  SquareDashedKanban,
} from "lucide-react";

export const items = [
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
    title: "K2 Project AI",
    url: "/k2projectai",
    icon: Bot,
  },
  {
    title: "K2 Code Editor",
    url: "/k2-editor",
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
