// File: client/src/_core/hooks/useAuth.ts

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export function useAuth() {
  // @ts-ignore - tRPC type collision, but works at runtime
  const utils = trpc.useUtils();

  // @ts-ignore - tRPC type collision, but works at runtime
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false, // Tidak perlu retry jika gagal, karena akan dialihkan
    refetchOnWindowFocus: true, // Refetch saat window kembali fokus
    staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
  });

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error,
      isAuthenticated: !!meQuery.data,
    };
  }, [meQuery.data, meQuery.isLoading, meQuery.error]);

  return {
    ...state,
    refresh: () => utils.auth.me.refetch(),
    // @ts-ignore - tRPC type collision, but works at runtime
    logout: trpc.auth.logout.useMutation({
      onSuccess: () => {
        utils.auth.me.setData(undefined, null);
        window.location.href = '/login'; // Redirect setelah logout
      },
    }).mutateAsync,
  };
}
