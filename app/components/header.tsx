
import { Menu, Bell, BookOpen, Search, ShoppingBag } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { UserButton } from "@clerk/tanstack-start";
import { Skeleton } from "./ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { Link } from '@tanstack/react-router';

function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b backdrop-blur bg-white/90 dark:bg-neutral-800/90 dark:border-neutral-700 right-0 left-0 p-0">
      <div className="container flex h-16 items-center gap-4 px-4 justify-between w-full mx-auto">
        <div className="flex items-center gap-2 font-semibold">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-xl font-serif"
          >
            <span className="dark:text-white">WeCook</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-neutral-400" />
            <Input
              placeholder="What would you like to cook?"
              className="pl-8 w-full bg-muted dark:bg-neutral-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <ShoppingBag className="h-5 w-5 dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Shopping List</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <BookOpen className="h-5 w-5 dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Saved Recipes</p>
            </TooltipContent>
          </Tooltip>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 dark:text-white" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p>No notifications</p>
            </HoverCardContent>
          </HoverCard>

          <ThemeToggle />

          <Skeleton className="w-7 h-7 rounded-full" disabled>
            <UserButton />
          </Skeleton>
        </div>
      </div>
    </header>
  );
}

export default Header;

