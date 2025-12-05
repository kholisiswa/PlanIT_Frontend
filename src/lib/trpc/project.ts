// client/src/lib/trpc/project.ts
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";

export const projectKey = {
  list: ["projects"] as const,
  one: (id: number) => ["project", id] as const,
};

/* GET ALL PROJECTS */
export function useProjects() {
  return trpc.project.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
}

/* GET ONE PROJECT */
export function useProject(id: number) {
  return trpc.project.getById.useQuery(
    { id },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );
}

/* CREATE PROJECT */
export function useCreateProject() {
  const qc = useQueryClient();
  return trpc.project.create.useMutation({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKey.list });
    },
  });
}

/* UPDATE PROJECT */
export function useUpdateProject() {
  const qc = useQueryClient();
  // typed 'vars' as any to avoid TS implicit-any errors; ubah sesuai tipe jika mau
  return trpc.project.update.useMutation({
    onSuccess: (_res, vars: any) => {
      qc.invalidateQueries({ queryKey: projectKey.list });
      if (vars?.id) qc.invalidateQueries({ queryKey: projectKey.one(vars.id) });
    },
  });
}

/* DELETE PROJECT */
export function useDeleteProject() {
  const qc = useQueryClient();
  return trpc.project.delete.useMutation({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKey.list });
    },
  });
}
