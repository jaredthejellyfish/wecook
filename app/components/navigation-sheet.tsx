import React from 'react';

import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';

import { usePathname } from '@/hooks/usePathname';
import { sidebarGeneration, sidebarItems, sidebarSettings } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

import GenerateRecipeButton from './generate-recipe-button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { sidebarMenuButtonVariants } from './ui/sidebar';

type Props = {};

function NavigationSheet({}: Props) {
  const { pathname } = usePathname();
  return (
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
                  pathname === item.path && 'bg-sidebar-accent rounded-md',
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
              Generation
          </div>
          <div className="flex flex-col gap-2">
            {sidebarGeneration.map((item) => (
              <div
                key={item.path}
                className={cn(
                  'group/menu-item relative',
                  pathname === item.path && 'bg-sidebar-accent rounded-md',
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
                  pathname === item.path && 'bg-sidebar-accent rounded-md',
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
  );
}

export default NavigationSheet;
