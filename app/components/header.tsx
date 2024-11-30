import { UserButton } from '@clerk/tanstack-start';
import { Link } from '@tanstack/react-router';
import { Bell, BookOpen, Menu, Search, ShoppingBag } from 'lucide-react';

import { usePathname } from '@/hooks/usePathname';
import { sidebarItems, sidebarSettings } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

import GenerateRecipeButton from './generate-recipe-button';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Input } from './ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { sidebarMenuButtonVariants } from './ui/sidebar';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

function Header() {
  const { pathname } = usePathname();
  return (
    <header className="fixed top-0 z-50 w-full border-b backdrop-blur bg-white/90 dark:bg-neutral-800/90 dark:border-neutral-700 right-0 left-0 p-0">
      <div className="container flex h-16 items-center gap-4 px-4 justify-between w-full mx-auto">
        <div className="flex items-center gap-2 font-semibold">
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-0 mr-1">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetHeader className="mt-2">
                <SheetTitle className="hidden">Menu</SheetTitle>
                <GenerateRecipeButton />
              </SheetHeader>
              <div className="mt-4">
                <div className="duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0">
                  Menu
                </div>
                <div className="flex flex-col gap-2">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.path}
                      className={cn(
                        'group/menu-item relative',
                        pathname === item.path &&
                          'bg-sidebar-accent rounded-md',
                      )}
                    >
                      <Link to={item.path}>
                        <div
                          className={sidebarMenuButtonVariants({
                            variant: 'default',
                            size: 'default',
                          })}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink mt-4">
                  Settings
                </div>
                <div className="flex flex-col gap-2">
                  {sidebarSettings.map((item) => (
                    <div
                      key={item.path}
                      className={cn(
                        'group/menu-item relative',
                        pathname === item.path &&
                          'bg-sidebar-accent rounded-md',
                      )}
                    >
                      <Link to={item.path}>
                        <div
                          className={sidebarMenuButtonVariants({
                            variant: 'default',
                            size: 'default',
                          })}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
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
