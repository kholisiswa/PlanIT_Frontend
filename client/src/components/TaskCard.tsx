import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Flag, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

import type { TaskWithTags, TagShape } from "@/types/task";

type TaskCardProps = {
  projectId: number;
  task: TaskWithTags;
  onEdit?: (task: TaskWithTags) => void;
  onDelete?: () => void;
};

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function TaskCard({ task, onEdit, onDelete, projectId }: TaskCardProps) {
  // @ts-ignore
  const utils = trpc.useUtils();
  const [showDateInput, setShowDateInput] = useState(false);

  // @ts-ignore
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.project.getTasks.invalidate({ projectId });
    },
  });

  const cycleStatus = {
    pending: "in-progress",
    "in-progress": "completed",
    completed: "pending",
  } as const;

  const cyclePriority = {
    low: "medium",
    medium: "high",
    high: "low",
  } as const;

  const toggleStatus = () => {
    updateTask.mutate({
      id: task.id,
      status: cycleStatus[task.status as keyof typeof cycleStatus],
    });
  };

  const togglePriority = () => {
    updateTask.mutate({
      id: task.id,
      priority: cyclePriority[task.priority as keyof typeof cyclePriority],
    });
  };

  const updateDueDate = (date: string) => {
    updateTask.mutate({
      id: task.id,
      dueDate: date || null,
    });
    setShowDateInput(false);
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID")
    : "—";

  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.01,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn(
        "group relative p-4 rounded-xl border bg-card shadow-sm flex justify-between gap-4",
        "select-none",              // hilangkan text selection
        "cursor-default",           // hilangkan cursor text
        task.status === "completed" && "opacity-80"
      )}
    >
      {/* QUICK ACTIONS */}
      <motion.div
        className="absolute top-2 right-3 flex items-center gap-2 select-none"
        initial={{ opacity: 0, y: -4 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-md hover:bg-accent transition cursor-pointer select-none"
          >
            <Pencil className="w-4 h-4 pointer-events-none" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-destructive/20 text-destructive transition cursor-pointer select-none"
          >
            <Trash2 className="w-4 h-4 pointer-events-none" />
          </button>
        )}
      </motion.div>

      {/* LEFT */}
      <div className="flex-1 min-w-0 select-none cursor-default">
        <motion.h3
          layout
          className={cn(
            "font-semibold text-lg leading-tight select-none cursor-default",
            task.status === "completed" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </motion.h3>

        {task.description && (
          <motion.p
            layout
            className="mt-1 text-sm text-muted-foreground line-clamp-2 select-none cursor-default"
          >
            {task.description}
          </motion.p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3 select-none cursor-default">
          {/* PRIORITY */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePriority}
            className="cursor-pointer select-none"
          >
            <Badge
              className={cn(priorityColors[task.priority as keyof typeof priorityColors], "cursor-pointer select-none")}
              variant="secondary"
            >
              <Flag className="w-3 h-3 mr-1 pointer-events-none" />
              {task.priority}
            </Badge>
          </motion.button>

          {/* TAGS */}
          {(task.tags ?? []).map((tag: TagShape) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-2 py-0.5 rounded-md select-none cursor-default"
              style={{
                backgroundColor: tag.color ?? "#6b7280",
                color: "white",
              }}
            >
              {tag.name}
            </Badge>
          ))}

          {/* DUE DATE */}
          <div className="ml-auto flex items-center gap-2 select-none cursor-default">
            {showDateInput ? (
              <motion.input
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="date"
                autoFocus
                className="text-xs bg-background border px-2 py-1 rounded-md cursor-text select-text"
                defaultValue={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onBlur={(e) => updateDueDate(e.target.value)}
              />
            ) : (
              <button
                onClick={() => setShowDateInput(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer select-none"
              >
                <Calendar className="w-3 h-3 pointer-events-none" />
                {formattedDate}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATUS BUTTON */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleStatus}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium",
          "bg-primary text-primary-foreground hover:opacity-90",
          "transition cursor-pointer select-none"
        )}
      >
        {task.status === "pending" && "Start"}
        {task.status === "in-progress" && "Complete"}
        {task.status === "completed" && "Reset"}
      </motion.button>
    </motion.div>
  );
}
