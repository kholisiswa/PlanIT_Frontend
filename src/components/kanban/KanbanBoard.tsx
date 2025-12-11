// client/src/components/kanban/KanbanBoard.tsx
import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { motion, AnimatePresence } from "framer-motion";

import { KanbanColumn } from "./KanbanColumn";
import { useKanbanDnd } from "./useKanbanDragDrop";
import { useColumnWidths } from "./useColumnWidths";
import { useColumnCollapse } from "./useColumnCollapse";


import type { TaskWithTags } from "@/types/task";

// Status list
const STATUSES = ["pending", "in-progress", "completed"] as const;
type Status = (typeof STATUSES)[number];

interface KanbanBoardProps {
  projectId: number;
  tasks: TaskWithTags[];
  onOpenDetail: (task: TaskWithTags) => void;
  onDeleteTask?: (task: TaskWithTags) => void;
}

export function KanbanBoard({
  projectId,
  tasks,
  onOpenDetail,
  onDeleteTask,
}: KanbanBoardProps) {
  /* ---------------------------------------------
        DnD SENSORS
  --------------------------------------------- */
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(PointerSensor)
  );

  /* ---------------------------------------------
        DnD STATE & HANDLERS
  --------------------------------------------- */
  const {
    board,
    activeTask,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = useKanbanDnd(projectId, tasks);

  /* ---------------------------------------------
        COLUMN WIDTHS (Resizable)
  --------------------------------------------- */
  const { widths, resize } = useColumnWidths();

  /* ---------------------------------------------
        COLLAPSE STATE
  --------------------------------------------- */
  const { collapsed, toggle } = useColumnCollapse();

  /* ---------------------------------------------
        UI RENDER
  --------------------------------------------- */
  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <motion.div
          layout
          className="flex gap-4 mt-6 overflow-x-auto pb-3 px-1"
          style={{ alignItems: "flex-start", scrollBehavior: "smooth" }}
          transition={{
            layout: { type: "spring", stiffness: 220, damping: 30 },
          }}
        >
          <AnimatePresence initial={false}>
            {STATUSES.map((status, index) => (
              <motion.div
                key={status}
                layout
                className="shrink-0"
                transition={{
                  layout: { type: "spring", stiffness: 240, damping: 26 },
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
                exit={{ opacity: 0, y: -12 }}
              >
                <KanbanColumn
                  status={status}
                  tasks={board[status] as TaskWithTags[]}
                  width={widths[status]}
                  collapsed={collapsed[status]}
                  onResize={(s, delta) => resize(s, delta)}
                  onToggleCollapse={() => toggle(status)}
                  onOpenDetail={onOpenDetail}
                  onDeleteTask={onDeleteTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* GHOST CARD SAAT DI-DRAG */}
        <DragOverlay>
          {activeTask && (
            <motion.div
              initial={{ scale: 0.96, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
              }}
              className="p-3 w-72 rounded-lg border bg-card shadow-xl"
            >
              <div className="font-medium">{activeTask.title}</div>

              {activeTask.description && (
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {activeTask.description}
                </div>
              )}

              <div className="mt-2 text-xs opacity-70">
                Priority: {activeTask.priority}
              </div>
            </motion.div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
