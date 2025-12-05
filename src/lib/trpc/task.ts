// client/src/lib/trpc/task.ts
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
// Task type from database (provided through tRPC responses)
type Task = any;

/* -----------------------------------------
   QUERY KEYS
----------------------------------------- */
export const taskKey = {
  list: (projectId: number) => ["tasks", projectId] as const,
  one: (taskId: number) => ["task", taskId] as const,
};

/* -----------------------------------------
   GET ONE TASK
----------------------------------------- */
export function useTask(taskId: number | null) {
  return trpc.task.getOne.useQuery(
    { id: taskId! },
    {
      enabled: !!taskId,
      refetchOnWindowFocus: false,
    }
  );
}

/* -----------------------------------------
   LIST TASKS BY PROJECT
----------------------------------------- */
export function useTasks(projectId: number) {
  return trpc.task.listByProject.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      refetchOnWindowFocus: false,
    }
  );
}

/* -----------------------------------------
   CREATE TASK
----------------------------------------- */
export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();

  return trpc.task.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKey.list(projectId) });
    },
  });
}

/* -----------------------------------------
   UPDATE TASK
----------------------------------------- */
export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();

  return trpc.task.update.useMutation({
    onSuccess: (_, variables) => {
      // invalidate list
      queryClient.invalidateQueries({ queryKey: taskKey.list(projectId) });

      // also invalidate single task, if open in modal
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: taskKey.one(variables.id) });
      }
    },
  });
}

/* -----------------------------------------
   DELETE TASK
----------------------------------------- */
export function useDeleteTask(projectId: number) {
  const queryClient = useQueryClient();

  return trpc.task.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKey.list(projectId) });
    },
  });
}

/* -----------------------------------------
   REORDER TASKS (KANBAN)
----------------------------------------- */
export function useReorderTask(projectId: number) {
  const queryClient = useQueryClient();

  return trpc.task.reorder.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKey.list(projectId) });
    },
  });
}

export type TagShape = {
  id: number;
  name: string;
  color: string | null;
};

export type TaskWithTags = Task & {
  tags?: TagShape[]; // optional supaya kompatibel
};
