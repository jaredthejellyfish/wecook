import {
    Bookmark,
    CalendarDays,
    Folder,
    HelpCircle,
    LayoutDashboard,
    type LucideIcon,
    Settings,
    Share2,
    ShoppingBag,
    UserCircle,
} from 'lucide-react';

type SidebarItem = {
    label: string;
    icon: LucideIcon;
    path: string;
};


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
    {
        label: 'Public Recipes',
        icon: Share2,
        path: '/recipes/public',
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

export { sidebarItems, sidebarSettings };