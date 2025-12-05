import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import { trpc, trpcClient } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "../../shared/const";
import { getLoginUrl } from "./const";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// --- AUTO REDIRECT IF UNAUTHORIZED ---
const redirectIfUnauthorized = (err: unknown) => {
  if (!(err instanceof TRPCClientError)) return;
  if (err.message === UNAUTHED_ERR_MSG) {
    window.location.href = getLoginUrl();
  }
};

// react-query error listeners
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectIfUnauthorized(event.query.state.error);
  }
});
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectIfUnauthorized(event.mutation.state.error);
  }
});

// --- Render tree (use trpcClient from central lib) ---
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* @ts-ignore - tRPC type collision, but works at runtime */}
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <App />
    </trpc.Provider>
  </QueryClientProvider>
);
