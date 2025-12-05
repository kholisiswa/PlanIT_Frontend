import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";

// Query keys
const tagKey = {
  list: ["tags"],
};

export function useTags() {
  return trpc.tag.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return trpc.tag.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKey.list });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return trpc.tag.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKey.list });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return trpc.tag.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKey.list });
    },
  });
}
