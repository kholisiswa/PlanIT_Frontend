// client/src/components/kanban/useKanbanDnd.ts
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
} from "@dnd-kit/core";

import type { TaskWithTags } from "@/types/task";
type Status = "pending" | "in-progress" | "completed";

type BoardMap = Record<Status, TaskWithTags[]>;

/* --------------------------------------------
   PARSE ID HELPERS
-------------------------------------------- */
function parseId(raw: unknown) {
  const id = String(raw);

  if (id.startsWith("col-")) {
    return {
      type: "column" as const,
      status: id.replace("col-", "") as Status,
    };
  }

  if (id.startsWith("task-")) {
    // Format: task-in-progress-12
    const parts = id.split("-"); // ["task","in","progress","12"]

    const status = parts.slice(1, parts.length - 1).join("-") as Status;
    const num = parts[parts.length - 1];

    return {
      type: "task" as const,
      status,
      id: Number(num),
    };
  }

  return { type: "unknown" as const };
}


/* Group tasks by column */
function groupTasks(list: TaskWithTags[]): BoardMap {
  return {
    pending: list.filter((t) => t.status === "pending"),
    "in-progress": list.filter((t) => t.status === "in-progress"),
    completed: list.filter((t) => t.status === "completed"),
  };
}

/* --------------------------------------------
   SAFE STATUS DETECTOR
-------------------------------------------- */
function findStatus(board: BoardMap, id: number): Status | null {
  for (const s of ["pending", "in-progress", "completed"] as const) {
    if (board[s].some((t) => t.id === id)) return s;
  }
  return null;
}

/* =====================================================
   useKanbanDnd — FINAL FIXED VERSION
===================================================== */
export function useKanbanDnd(projectId: number, tasks: TaskWithTags[]) {
  // @ts-ignore
  const utils = trpc.useUtils();

  const [board, setBoard] = useState<BoardMap>(() => groupTasks(tasks));
  const [activeTask, setActiveTask] = useState<TaskWithTags | null>(null);

  /* ---------------------------------
     SERVER MUTATION (REORDER)
  --------------------------------- */
  // @ts-ignore
  const reorderMutation = trpc.task.reorder.useMutation({
  onSuccess: () => {
    utils.project.getTasks.invalidate({ projectId });
    utils.project.getById.invalidate({ id: projectId }); 
  },
  onError: () => {
    setBoard(groupTasks(tasks));
  },
  });


  /* ---------------------------------
     SYNC BOARD WITH SERVER (NO LOOP!)
  --------------------------------- */
  useEffect(() => {
  // Hanya sync kalau tidak sedang drag
  if (!activeTask) {
    setBoard(groupTasks(tasks));
  }
}, [tasks]);

  /* -------------------------- DRAG START -------------------------- */
  function onDragStart(e: DragStartEvent) {
    const p = parseId(e.active.id);
    if (p.type !== "task") return;

    const s = findStatus(board, p.id);
    if (!s) return;

    const found = board[s].find((t) => t.id === p.id);
    if (found) setActiveTask(found);
  }

  /* -------------------------- DRAG OVER -------------------------- */
  function onDragOver(e: DragOverEvent) {
    const active = parseId(e.active.id);
    const over = parseId(e.over?.id);

    if (active.type !== "task") return;

    const activeId = active.id;

    const fromStatus = findStatus(board, activeId);
    if (!fromStatus) return;

    const fromIndex = board[fromStatus].findIndex((t) => t.id === activeId);
    if (fromIndex === -1) return;

    let toStatus: Status = fromStatus;
    let toIndex: number = fromIndex;

    /* -------------- OVER COLUMN -------------- */
    if (over.type === "column") {
      toStatus = over.status;
      toIndex = board[toStatus].length;
    }

    /* -------------- OVER TASK -------------- */
    if (over.type === "task") {
      const overId = over.id;
      const detected = findStatus(board, overId);
      if (!detected) return;

      toStatus = detected;
      toIndex = board[toStatus].findIndex((t) => t.id === overId);
      if (toIndex === -1) toIndex = board[toStatus].length;
    }

    /* STOP IF NO CHANGE */
    if (fromStatus === toStatus && fromIndex === toIndex) return;

    /* ----------- OPTIMISTIC REORDER ----------- */
    setBoard((prev) => {
      const clone: BoardMap = {
        pending: [...prev.pending],
        "in-progress": [...prev["in-progress"]],
        completed: [...prev.completed],
      };

      const [moved] = clone[fromStatus].splice(fromIndex, 1);
      if (!moved) return prev;

      moved.status = toStatus;
      clone[toStatus].splice(toIndex, 0, moved);

      return clone;
    });
  }

  /* -------------------------- DRAG END --------------------------- */
  function onDragEnd(_: DragEndEvent) {
    setActiveTask(null);

    const payload = [
      ...board.pending.map((t, i) => ({
        id: t.id,
        status: "pending" as Status,
        position: i,
      })),
      ...board["in-progress"].map((t, i) => ({
        id: t.id,
        status: "in-progress" as Status,
        position: i,
      })),
      ...board.completed.map((t, i) => ({
        id: t.id,
        status: "completed" as Status,
        position: i,
      })),
    ];

    reorderMutation.mutate({ projectId, items: payload });
  }

  /* -------------------------- DRAG CANCEL ------------------------- */
  function onDragCancel(_: DragCancelEvent) {
    setActiveTask(null);
    setBoard(groupTasks(tasks));
  }

  return {
    board,
    activeTask,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  };
}
