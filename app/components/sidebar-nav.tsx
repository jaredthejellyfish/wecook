import { Link } from '@tanstack/react-router';
import {
  Bookmark,
  CalendarDays,
  Folder,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShoppingBag,
  UserCircle,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';

import { usePathname } from '@/hooks/usePathname';
import { cn } from '@/lib/utils';

import GenerateRecipeButton from './generate-recipe-button';

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Weekly Prep',
    icon: CalendarDays,
    path: '/weekly-prep',
  },
  {
    label: 'All recipes',
    icon: Folder,
    path: '/recipes',
  },
  {
    label: 'Saved Recipes',
    icon: Bookmark,
    path: '/recipes/saved',
  },
  {
    label: 'Shopping List',
    icon: ShoppingBag,
    path: '/shopping-list',
  },
];

const sidebarSettings: SidebarItem[] = [
  {
    label: 'Your Plan',
    icon: UserCircle,
    path: '/settings/plan',
  },
  {
    label: 'Help & FAQs',
    icon: HelpCircle,
    path: '/help',
  },
  {
    label: 'Preferences',
    icon: Settings,
    path: '/settings/preferences',
  },
];

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  path: string;
};

export function SidebarNav() {
  const { pathname } = usePathname();

  return (
    <Sidebar className="border-r bg-transparent pt-20 dark:border-neutral-700 dark:bg-neutral-900">
      <SidebarHeader>
        <GenerateRecipeButton />
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
                    pathname === item.path && 'bg-sidebar-accent rounded-md',
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
              {sidebarSettings.map((item) => (
                <SidebarMenuItem
                  key={item.path}
                  className={cn(
                    pathname === item.path && 'bg-sidebar-accent rounded-md',
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
      </SidebarContent>
    </Sidebar>
  );
}
