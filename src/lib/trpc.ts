import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "C:/Users/user/PlanIT/PlanIT-backend/server/_core/appRouter";
 

// Use `any` for AppRouter on the frontend to avoid cross-project type resolution
// issues in this workspace. If you have a shared types package, replace `any`
// with the real `AppRouter` type import.
export const trpc = createTRPCReact<AppRouter>();

// @ts-ignore - tRPC type collision with any, but works at runtime
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      // Use VITE_API_URL if provided (production), otherwise fall back to
      // relative `/api/trpc` which is convenient for local dev with a proxy.
      url: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/trpc` : "/api/trpc",
      fetch(input, init) {
        return fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});
