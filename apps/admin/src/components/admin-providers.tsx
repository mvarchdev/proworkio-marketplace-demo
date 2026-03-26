"use client";

import { Refine } from "@refinedev/core";
import type { ResourceProps } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { Suspense, type ReactNode } from "react";

import { demoDataProvider } from "@/lib/demo-provider";
import { resourceConfigs } from "@/lib/admin-data";

const resources: ResourceProps[] = Object.values(resourceConfigs).map((resource) => ({
  name: resource.key,
  list: resource.path,
}));

export function AdminProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={children}>
      <Refine dataProvider={demoDataProvider} routerProvider={routerProvider} resources={resources}>
        {children}
      </Refine>
    </Suspense>
  );
}
