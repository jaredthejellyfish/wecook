import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { usePathname } from "@/hooks/usePathname";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Bookmark,
  ShoppingBag,
  UserCircle,
  HelpCircle,
  LogOut,
  PlusCircle,
  Folder,
} from "lucide-react";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Weekly Prep",
    icon: CalendarDays,
    path: "/weekly-prep",
  },
  {
    label: "All recipes",
    icon: Folder,
    path: "/recipes",
  },
  {
    label: "Saved Recipes",
    icon: Bookmark,
    path: "/recipes/saved",
  },
  {
    label: "Shopping List",
    icon: ShoppingBag,
    path: "/shopping-list",
  },
];

export function SidebarNav() {
  const {pathname} = usePathname();

  return (
    <Sidebar className="border-r bg-transparent pt-20 dark:border-neutral-700 dark:bg-neutral-900">
      <SidebarHeader>
        <Button className="w-full bg-primary" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add a Recipe
        </Button>
      </SidebarHeader>
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="dark:text-neutral-400">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem
                  key={item.path}
                  className={cn(
                    pathname === item.path && "bg-sidebar-accent rounded-md"
                  )}
                >
                  <Link to={item.path}>
                    <SidebarMenuButton>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="dark:text-neutral-400">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Your Plan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & FAQs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
