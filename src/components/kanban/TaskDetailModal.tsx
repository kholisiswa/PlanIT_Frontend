// client/src/components/kanban/TaskDetailModal.tsx — FINAL FIXED
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Edit3, Save } from "lucide-react";
// Task type from database (provided through tRPC responses)
type Task = any;
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface UpdatePayload {
  id: number;
  title?: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  dueDate?: string | undefined;
}

interface Props {
  task: Task | null;
  projectId: number;
  onClose: () => void;
}

export default function TaskDetailModal({ task, projectId, onClose }: Props) {
  if (!task) return null;

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);

  useEffect(() => {
    setTitleDraft(task.title);
    setEditing(false);
  }, [task]);

  // ESC close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // @ts-ignore
  const utils = trpc.useUtils();

  // ----------------------------
  // UPDATE TASK
  // ----------------------------
  // @ts-ignore
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.listByProject.invalidate({ projectId });
    },
  });

  // ----------------------------
  // DELETE TASK
  // ----------------------------
  // @ts-ignore
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      utils.task.listByProject.invalidate({ projectId });
      onClose();
    },
  });

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setEditing(false);
      return;
    }

    updateTask.mutate({ id: task.id, title: trimmed });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("Delete this task?")) return;
    deleteTask.mutate({ id: task.id });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        key="modal"
        className="
          fixed z-50 top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2 
          bg-card border shadow-xl rounded-xl 
          p-6 w-[420px] max-w-full
        "
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 gap-3">
          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") {
                      setEditing(false);
                      setTitleDraft(task.title);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  autoFocus
                />
                <button
                  onClick={saveTitle}
                  className="p-2 rounded-md bg-primary text-primary-foreground"
                >
                  <Save size={16} />
                </button>
              </div>
            ) : (
              <h1 className="text-xl font-semibold truncate">{task.title}</h1>
            )}

            <div className="text-xs text-muted-foreground mt-1">
              {task.status} • {task.priority}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded hover:bg-muted"
              >
                <Edit3 size={16} />
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-destructive/10 text-destructive"
            >
              <Trash2 size={16} />
            </button>

            <button onClick={onClose} className="p-1 hover:bg-muted rounded ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* DESCRIPTION */}
        {task.description ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic mb-4">
            No description
          </p>
        )}

        {/* FOOTER */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={cn("px-4 py-2 rounded bg-muted hover:bg-muted/70")}
          >
            Close
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
