// client/src/components/kanban/KanbanTaskCard.tsx
import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
// Task type from database (provided through tRPC responses)
type Task = any;
import { Flag, Edit3, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pending" | "in-progress" | "completed";
type TaskWithTags = Task & { tags?: any[] };

interface Props {
  id: string; // MUST match "task-status-id"
  task: TaskWithTags;
  index?: number;
  status?: Status;

  onOpenDetail?: (task: TaskWithTags) => void;
  onUpdate?: (partial: Partial<Task> & { id: number }) => void;
  onDeleteTask?: (task: TaskWithTags) => void;
}

export function KanbanTaskCard({
  id,
  task,
  onUpdate,
  onOpenDetail,
  onDeleteTask,
}: Props) {
  /* ---------------------------------
        SORTABLE (DRAG & DROP)
  ---------------------------------- */
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 9999 : undefined,
  };

  /* ---------------------------------
         INLINE TITLE EDIT
  ---------------------------------- */
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTitleDraft(task.title ?? "");
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function saveTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed === (task.title ?? "").trim()) {
      setIsEditing(false);
      return;
    }
    onUpdate?.({ id: task.id, title: trimmed });
    setIsEditing(false);
  }

  const cancelEdit = () => {
    setTitleDraft(task.title);
    setIsEditing(false);
  };

  /* ---------------------------------
               RENDER
  ---------------------------------- */
  return (
    <motion.div
      ref={setNodeRef}
      layout="position"
      layoutId={`task-${task.id}`}
      style={style}
      className={cn(
        // Mengubah tata letak agar bertumpuk (flex-col) di mobile, dan horizontal (flex-row) di desktop
        "p-3 rounded-lg border bg-card shadow-sm relative group flex flex-col select-none md:flex-row",
        isDragging && "rotate-1 pointer-events-none opacity-70"
      )}
      onClick={() => {
        if (!isDragging && !isEditing) onOpenDetail?.(task);
      }}
    >
        {/* Konten Utama */}
        <div className="flex-1 min-w-0">
            {/* ------------------ LEFT CONTENT ------------------ */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveTitle();
                                if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-full px-2 py-1 rounded border bg-background text-base focus:ring-2 focus:ring-primary/40"
                        />
                    ) : (
                        <div
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className={cn(
                                "font-medium truncate",
                                task.status === "completed" && "line-through text-muted-foreground"
                            )}
                        >
                            {task.title}
                        </div>
                    )}

                    {!isEditing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="p-1 rounded hover:bg-accent transition inline-flex"
                        >
                            <Edit3 className="w-4 h-4 opacity-80" />
                        </button>
                    )}
                </div>

                {task.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                    </div>
                )}

                {/* Priority */}
                <div className="mt-2 text-xs opacity-80 flex items-center gap-2">
                    <Flag className="w-3 h-3" />
                    <span className="uppercase text-xs tracking-wide">
                        {task.priority}
                    </span>
                </div>
            </div>
        </div>

      {/* ------------------ ACTIONS & DRAG HANDLE (Desktop Only) ------------------ */}
      {/* Container ini disembunyikan di mobile (md:hidden) */}
      <div className="hidden md:flex items-start ml-3 gap-1">
        {/* Delete Button (Desktop) */}
        {onDeleteTask && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task);
            }}
            className="p-2 rounded hover:bg-destructive/20 text-destructive transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Drag Handle (Desktop) */}
        <div
          {...(!isEditing ? attributes : {})}
          {...(!isEditing ? listeners : {})}
          onClick={(e) => e.stopPropagation()}
          className="p-2 -mr-2 rounded hover:bg-accent/20 cursor-grab active:cursor-grabbing transition opacity-80"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
          }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* ------------------ ACTIONS & DRAG HANDLE (Mobile Only) ------------------ */}
      {/* Container ini ditampilkan di mobile dan disembunyikan di desktop (md:hidden) */}
      <div className="mt-3 flex items-center justify-between md:hidden">
          {/* Delete Button (Mobile) - diletakkan di kiri untuk penempatan yang lebih baik */}
          {onDeleteTask && (
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task);
                  }}
                  className="p-2 rounded hover:bg-destructive/20 text-destructive transition"
              >
                  <Trash2 className="w-5 h-5" />
              </button>
          )}

          {/* Drag Handle (Mobile) - diletakkan di tengah */}
          <div
              {...(!isEditing ? attributes : {})}
              {...(!isEditing ? listeners : {})}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded hover:bg-accent/20 cursor-grab active:cursor-grabbing transition opacity-80"
              style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  touchAction: "none",
              }}
          >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Placeholder untuk menjaga Drag Handle di tengah (jika onDeleteTask tidak ada) */}
          {/* Jika onDeleteTask ada, ini digantikan oleh tombol Delete */}
          {onDeleteTask ? (
             <div className="w-[41px] h-[41px]" /> // Sesuaikan lebar/tinggi dengan tombol Delete agar simetris
          ) : (
              <div className="w-0 h-0" />
          )}

      </div>
    </motion.div>
  );
}

export default KanbanTaskCard;
