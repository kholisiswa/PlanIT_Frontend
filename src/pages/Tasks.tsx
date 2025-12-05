/* FULL CODE FIXED – PRIORITY BADGE SAMA SEPERTI DASHBOARD */

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
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

// ================= TYPE FIX =================
type TaskStatus = "pending" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

// Task from DB (sementara any)
type DBTask = any;

// ---------------- UI TASK TYPE ----------------
type UITask = Omit<
  DBTask,
  "createdAt" | "updatedAt" | "dueDate" | "status" | "priority"
> & {
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority; // FIX HERE
};

// ---------------- ICONS ----------------
const statusIcons: Record<TaskStatus, any> = {
  pending: Circle,
  "in-progress": AlertCircle,
  completed: CheckCircle2,
};

// ---------------- PRIORITY COLORS (TYPED) ----------------
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
    bg-red-300 text-red-900
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

  // ---------------- FETCH TASKS ----------------
  const {
    data: rawTasks = [],
    isLoading,
    refetch,
  } = trpc.project.getAllTasks.useQuery();

  const defaultProjectId =
    rawTasks.length > 0 ? rawTasks[0].projectId : null;

  // ---------------- NORMALIZE ----------------
  const tasks: UITask[] = rawTasks.map((t: DBTask) => ({
    ...t,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority, // FIX HERE

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

  // ---------------- MUTATIONS ----------------
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
    onSuccess: () => refetch(),
  });

  // ---------------- FILTERING ----------------
  const filteredTasks = tasks.filter((task) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search);

    const matchesPriority =
      !filterPriority || task.priority === filterPriority;

    const matchesStatus =
      !filterStatus || task.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // ---------------- STATUS TOGGLE ----------------
  const handleToggleTask = (id: number, status: TaskStatus) => {
    const nextStatus: TaskStatus =
      status === "pending"
        ? "in-progress"
        : status === "in-progress"
        ? "completed"
        : "pending";

    updateTask.mutate({ id, status: nextStatus });
  };

  // ---------------- EDIT ----------------
  const handleEdit = (task: UITask) => {
    setEditTask({
      ...task,
      projectId: task.projectId,
    });
    setModalOpen(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = (id: number) => {
    if (confirm("Delete this task?")) {
      deleteTask.mutate({ id });
    }
  };

  // ---------------- STATS ----------------
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  // ---------------- LOADING ----------------
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
            }}
          >
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
              <CheckCheck className="w-8 h-8 text-green-500 opacity-50" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Circle className="w-8 h-8 text-blue-500 opacity-50" />
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
                      className="flex p-4 gap-4 rounded-lg hover:bg-accent/50 transition group"
                    >
                      {/* Toggle */}
                      <button
                        onClick={() =>
                          handleToggleTask(task.id, task.status)
                        }
                        className="cursor-pointer"
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            task.status === "completed"
                              ? "text-green-500"
                              : task.status === "in-progress"
                              ? "text-yellow-500"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
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
                              }`}
                            >
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
                          {/* ⭐ PRIORITY BADGE */}
                          <span
                            className={`
                              min-w-[70px] h-6 
                              inline-flex items-center justify-center 
                              rounded-md text-xs font-medium
                              ${priorityColors[task.priority]}
                            `}
                          >
                            {task.priority}
                          </span>

                          {/* DUE DATE */}
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
                <Circle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg">No tasks found</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first task to get started
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="cursor-pointer"
                >
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
    </DashboardLayoutCustom>
  );
}
