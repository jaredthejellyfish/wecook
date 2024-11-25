// app/routes/__root.tsx
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import appCss from "@/styles/app.css?url";
import Devtools from "@/components/Devtools";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ThemeProvider } from "@/providers/theme-provider";
import { themeScript } from "@/scripts/theme-script";

export const Route = createRootRoute({
  notFoundComponent: () => <div>Not Found</div>,
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      // Add the theme script before your app's hydration
      {
        tag: "script",
        children: themeScript,
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "WeCook",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Devtools />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html suppressHydrationWarning>
          <head>
            <Meta />
          </head>
          <body>
            {children}
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
