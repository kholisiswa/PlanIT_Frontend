/* FULL CODE WITH CUSTOM STATUS ICONS – MODIFIED FOR DYNAMIC SIZING */

import { DashboardLayoutCustom } from "@/components/DashboardLayoutCustom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TaskModal } from "@/components/TaskModal";
import { TaskActionMenu } from "@/components/TaskActionMenu";

import {
  Plus,
  Calendar,
} from "lucide-react";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ---------------- TYPES ---------------- */
type TaskStatus = "pending" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";
type DBTask = any;

type UITask = Omit<
  DBTask,
  "createdAt" | "updatedAt" | "dueDate" | "status" | "priority"
> & {
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
};

/* ---------------- CUSTOM STATUS ICONS - MODIFIED FOR DYNAMIC SIZING ---------------- */

// Ikon menerima properti w dan h (width dan height)
const CompletedIcon = ({ w = 35, h = 35 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 32 32" fill="none">
    <path d="M2.33335 17.4C2.06668 17.1333 1.93868 16.8222 1.94935 16.4667C1.96001 16.1111 2.09912 15.8 2.36668 15.5333C2.63335 15.2889 2.94446 15.1609 3.30001 15.1493C3.65557 15.1378 3.96668 15.2658 4.23335 15.5333L8.96668 20.2667L9.43335 20.7333L9.90001 21.2C10.1667 21.4667 10.2947 21.7778 10.284 22.1333C10.2733 22.4889 10.1342 22.8 9.86668 23.0667C9.60001 23.3111 9.2889 23.4391 8.93335 23.4507C8.57779 23.4622 8.26668 23.3342 8.00001 23.0667L2.33335 17.4ZM16.4667 20.2333L27.8 8.89999C28.0667 8.63332 28.3778 8.50577 28.7333 8.51732C29.0889 8.52888 29.4 8.66754 29.6667 8.93332C29.9111 9.19999 30.0391 9.5111 30.0507 9.86665C30.0622 10.2222 29.9342 10.5333 29.6667 10.8L17.4 23.0667C17.1333 23.3333 16.8222 23.4667 16.4667 23.4667C16.1111 23.4667 15.8 23.3333 15.5333 23.0667L9.86668 17.4C9.62224 17.1555 9.50001 16.8502 9.50001 16.484C9.50001 16.1178 9.62224 15.8009 9.86668 15.5333C10.1333 15.2667 10.4502 15.1333 10.8173 15.1333C11.1845 15.1333 11.5009 15.2667 11.7667 15.5333L16.4667 20.2333ZM22.1 10.8333L17.4 15.5333C17.1556 15.7778 16.8502 15.9 16.484 15.9C16.1178 15.9 15.8009 15.7778 15.5333 15.5333C15.2667 15.2667 15.1333 14.9502 15.1333 14.584C15.1333 14.2178 15.2667 13.9009 15.5333 13.6333L20.2333 8.93332C20.4778 8.68888 20.7836 8.56666 21.1507 8.56666C21.5178 8.56666 21.8342 8.68888 22.1 8.93332C22.3667 9.19999 22.5 9.51643 22.5 9.88266C22.5 10.2489 22.3667 10.5658 22.1 10.8333Z" fill="#00BC4B"/>
  </svg>
);

const InProgressIcon = ({ w = 35, h = 35 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 32 32" fill="none">
    <path d="M2.6665 15.9998C2.6665 23.3638 8.63584 29.3332 15.9998 29.3332C23.3638 29.3332 29.3332 23.3638 29.3332 15.9998C29.3332 8.63584 23.3638 2.6665 15.9998 2.6665C8.63584 2.6665 2.6665 8.63584 2.6665 15.9998ZM26.6665 15.9998C26.6665 18.8288 25.5427 21.5419 23.5423 23.5423C21.5419 25.5427 18.8288 26.6665 15.9998 26.6665C13.1709 26.6665 10.4578 25.5427 8.45736 23.5423C6.45698 21.5419 5.33317 18.8288 5.33317 15.9998C5.33317 13.1709 6.45698 10.4578 8.45736 8.45736C10.4578 6.45698 13.1709 5.33317 15.9998 5.33317C18.8288 5.33317 21.5419 6.45698 23.5423 8.45736C25.5427 10.4578 26.6665 13.1709 26.6665 15.9998ZM15.9998 15.9998V7.99984C18.1216 7.99984 20.1564 8.84269 21.6567 10.343C23.157 11.8433 23.9998 13.8781 23.9998 15.9998H15.9998Z" fill="#F3B000"/>
  </svg>
);

const PendingIcon = ({ w = 35, h = 35 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 32 32" fill="none">
    <path d="M13.3335 27.7027C12.1733 27.4384 11.0589 27.0029 10.0269 26.4107M18.6669 4.29736C21.3177 4.90279 23.6845 6.39028 25.3797 8.5163C27.0749 10.6423 27.9981 13.2809 27.9981 16C27.9981 18.7192 27.0749 21.3577 25.3797 23.4838C23.6845 25.6098 21.3177 27.0973 18.6669 27.7027M6.10553 22.7907C5.37898 21.7335 4.82664 20.5667 4.46953 19.3347M4.16553 14C4.37886 12.7334 4.78953 11.5334 5.36553 10.4334L5.59086 10.0267M9.20953 6.10536C10.4578 5.24787 11.8571 4.6344 13.3335 4.29736M16.0002 10.6667V16M16.0002 21.3334V21.3467" stroke="#F10F23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/* ---------------- ICON REGISTER ---------------- */
const statusIcons: Record<TaskStatus, any> = {
  pending: PendingIcon,
  "in-progress": InProgressIcon,
  completed: CompletedIcon,
};

/* ---------------- PRIORITY COLORS ---------------- */
const priorityColors: Record<TaskPriority, string> = {
  low: `
    bg-green-300 text-green-900
    dark:bg-green-800 dark:text-green-100
  `,
  medium: `
    bg-yellow-300 text-yellow-900
    dark:bg-yellow-800 dark:text-yellow-100
  `,
  high: `
    bg-[FCCFD3] text-[F10F23]
    dark:bg-red-800 dark:text-red-100
  `,
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<UITask | null>(null);

  // 🔥 ONLY ADDED:
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /* ---------------- QUERY ---------------- */
  const {
    data: rawTasks = [],
    isLoading,
    refetch,
  } = trpc.project.getAllTasks.useQuery();

  /* ---------------- FIX: ALWAYS ARRAY ---------------- */
  const safeTasks: DBTask[] = Array.isArray(rawTasks)
    ? rawTasks
    : Array.isArray((rawTasks as any)?.tasks)
    ? (rawTasks as any).tasks
    : [];

  /* ---------------- NORMALIZE ---------------- */
  const tasks: UITask[] = safeTasks.map((t: DBTask) => ({
    ...t,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority,

    createdAt:
      t.createdAt instanceof Date
        ? t.createdAt.toISOString()
        : String(t.createdAt),

    updatedAt:
      t.updatedAt instanceof Date
        ? t.updatedAt.toISOString()
        : String(t.updatedAt),

    dueDate:
      t.dueDate instanceof Date
        ? t.dueDate.toISOString()
        : t.dueDate
        ? String(t.dueDate)
        : null,
  }));

  const defaultProjectId = tasks.length > 0 ? tasks[0].projectId : null;

  /* ---------------- MUTATIONS ---------------- */
  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      refetch();
      setModalOpen(false);
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      setEditTask(null);
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      refetch();
      setShowDelete(false);
    },
  });

  /* ---------------- FILTER ---------------- */
  const filteredTasks = tasks.filter((task) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search);

    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStatus = !filterStatus || task.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  /* ---------------- ACTIONS ---------------- */
  const handleToggleTask = (id: number, status: TaskStatus) => {
    const nextStatus: TaskStatus =
      status === "pending"
        ? "in-progress"
        : status === "in-progress"
        ? "completed"
        : "pending";

    updateTask.mutate({ id, status: nextStatus });
  };

  const handleEdit = (task: UITask) => {
    setEditTask({ ...task });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    // 🔥 REPLACED confirm() ONLY
    setDeleteId(id);
    setShowDelete(true);
  };

  /* ---------------- STATS ---------------- */
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <DashboardLayoutCustom>
        <div className="flex items-center justify-center h-96">
          <div className="text-2xl text-muted-foreground animate-pulse select-none cursor-default">
            Loading tasks...
          </div>
        </div>
      </DashboardLayoutCustom>
    );
  }

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 select-none cursor-default">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track all your tasks
            </p>
          </div>

          <Button
            className="gap-2 cursor-pointer select-none"
            onClick={() => {
              setEditTask(null);
              setModalOpen(true);
            }}>
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Completed */}
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
              <CompletedIcon /> {/* Menggunakan default 35x35 */}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressCount}</p>
              </div>
              <InProgressIcon /> {/* Menggunakan default 35x35 */}
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <PendingIcon /> {/* Menggunakan default 35x35 */}
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader className="border-b border-border/50">
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>{filteredTasks.length} tasks</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {filteredTasks.length > 0 ? (
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const Icon = statusIcons[task.status];

                  return (
                    <div
                      key={task.id}
                      className="flex p-4 gap-4 rounded-lg hover:bg-accent/50 transition group">
                      
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="cursor-pointer">
                        <Icon w={25} h={25} /> {/* MODIFIKASI: Ukuran 25x25 */}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                task.status === "completed"
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}>
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <TaskActionMenu
                            onEdit={() => handleEdit(task)}
                            onDelete={() => handleDelete(task.id)}
                          />
                        </div>

                        {/* PRIORITY & DUE DATE */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`min-w-[70px] h-6 inline-flex items-center justify-center rounded-md text-xs font-medium ${
                              priorityColors[task.priority]
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>

                          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "id-ID"
                                )
                              : "No due date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-2xl text-muted-foreground mx-auto mb-4 opacity-50">
                  {/* Icon Lucide Circle here is removed/replaced for simplicity */}
                  No Task Icon
                </p>
                <h3 className="font-semibold text-lg">No tasks found</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first task to get started
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="cursor-pointer">
                  <Plus className="w-4 h-4" /> Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <div className="select-none cursor-default">
        <TaskModal
          open={modalOpen}
          onOpenChange={(v) => {
            setModalOpen(v);
            if (!v) setEditTask(null);
          }}
          defaultValues={
            editTask
              ? {
                  projectId: editTask.projectId,
                  title: editTask.title,
                  description: editTask.description || "",
                  priority: editTask.priority,
                  dueDate: editTask.dueDate,
                }
              : undefined
          }
          onSubmit={async (form) => {
            if (editTask) {
              await updateTask.mutateAsync({
                id: editTask.id,
                projectId: form.projectId,
                title: form.title,
                description: form.description || null,
                priority: form.priority,
                dueDate: form.dueDate || null,
              });
            } else {
              await createTask.mutateAsync({
                projectId: form.projectId,
                title: form.title,
                description: form.description || null,
                priority: form.priority,
                dueDate: form.dueDate || null,
              });
            }
          }}
        />
      </div>

      {/* DELETE CONFIRM DIALOG — ONLY NEW UI ADDED */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="select-none cursor-default max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  deleteTask.mutate({ id: deleteId });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayoutCustom>
  );
}
