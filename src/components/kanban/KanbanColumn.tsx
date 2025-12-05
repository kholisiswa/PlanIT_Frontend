import React, { useRef, useCallback, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Task type from database (provided through tRPC responses)
type Task = any;
import KanbanTaskCard from "./KanbanTaskCard";


type Status = "pending" | "in-progress" | "completed";
type TaskWithTags = Task & { tags?: any[] };

export interface KanbanColumnProps {
  status: Status;
  tasks: TaskWithTags[];

  width?: number;
  onResize?: (status: Status, delta: number) => void;

  collapsed?: boolean;
  onToggleCollapse?: (status: Status) => void;

  onOpenDetail?: (task: TaskWithTags) => void;
  onDeleteTask?: (taskId: number) => void;
}

/* ======================================================
   K A N B A N   C O L U M N   (FINAL CLEAN VERSION)
====================================================== */
export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  width,
  onResize,
  collapsed = false,
  onToggleCollapse,
  onOpenDetail,
  onDeleteTask,
}) => {
  /* ----------------------- Droppable ----------------------- */
  const droppableId = `col-${status}`;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { status },
  });

  const title =
    status === "pending"
      ? "To Do"
      : status === "in-progress"
      ? "In Progress"
      : "Completed";

  /* ------------------- Sortable item IDs ------------------- */
  const itemIds = tasks.map((t) => `task-${status}-${t.id}`);

  /* ---------------------- Resize logic ---------------------- */
  const resizeRef = useRef<{
    pointerId: number | null;
    onMove?: (ev: PointerEvent) => void;
    onUp?: (ev: PointerEvent) => void;
  }>({ pointerId: null });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onResize || collapsed) return;

      const el = e.currentTarget as HTMLElement;
      resizeRef.current.pointerId = e.pointerId;

      try {
        el.setPointerCapture?.(e.pointerId);
      } catch {}

      let lastX = e.clientX;

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== resizeRef.current.pointerId) return;

        const delta = ev.clientX - lastX;
        if (delta !== 0) onResize(status, delta);

        lastX = ev.clientX;
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== resizeRef.current.pointerId) return;

        try {
          el.releasePointerCapture?.(e.pointerId);
        } catch {}

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        resizeRef.current = { pointerId: null };
      };

      resizeRef.current.onMove = onMove;
      resizeRef.current.onUp = onUp;

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onResize, collapsed, status]
  );

  useEffect(() => {
    return () => {
      if (resizeRef.current.onMove)
        window.removeEventListener("pointermove", resizeRef.current.onMove);
      if (resizeRef.current.onUp)
        window.removeEventListener("pointerup", resizeRef.current.onUp);
    };
  }, []);

  /* ---------------------- Width style ---------------------- */
  const widthStyle = collapsed
    ? { width: "60px" }
    : width
    ? { width: `${width}px` }
    : undefined;

  /* ---------------------- RENDER ---------------------- */
  return (
    <motion.div
      ref={(el) => setNodeRef(el as HTMLElement)}
      layout
      style={widthStyle}
      className="relative bg-muted/30 border border-border/40 rounded-xl p-3 
                 flex flex-col gap-3 min-h-[420px]"
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      aria-labelledby={`col-title-${status}`}
      aria-roledescription="kanban column"
      role="region"
    >
      {/* Collapse toggle */}
      {onToggleCollapse && (
        <button
          onClick={() => onToggleCollapse(status)}
          className="absolute -left-3 top-4 bg-card border rounded-full 
                     p-1 shadow-sm z-10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      {/* Collapsed simple view */}
      {collapsed ? (
        <div className="rotate-90 mt-40 text-sm opacity-80 text-center select-none">
          {title}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 id={`col-title-${status}`} className="font-semibold text-lg">
              {title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sortable tasks */}
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <motion.div layout className="flex flex-col gap-2">
              {tasks.map((task, index) => (
                <KanbanTaskCard
                  key={task.id}
                  id={`task-${status}-${task.id}`}
                  task={task as TaskWithTags}
                  status={status}
                  index={index}
                  onOpenDetail={onOpenDetail}
                  onDeleteTask={onDeleteTask}
                />
              ))}

              {tasks.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No tasks
                </div>
              )}

              {isOver && (
                <div className="h-10 border-2 border-dashed border-primary/40 
                                rounded-lg animate-pulse" />
              )}
            </motion.div>
          </SortableContext>
        </>
      )}

      {/* Resize handle */}
      {!collapsed && onResize && (
        <div
          onPointerDown={onPointerDown}
          role="separator"
          aria-orientation="vertical"
          className="absolute -right-1 top-0 h-full w-3 cursor-col-resize z-20"
        >
          <div className="h-full w-0.5 mx-auto bg-border/60 rounded" />
        </div>
      )}
    </motion.div>
  );
};

export default KanbanColumn;
