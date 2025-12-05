import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutCustom } from "@/components/DashboardLayoutCustom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  BarChart3,
  Cog,
  Check,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { TaskModal } from "@/components/TaskModal";
import type { TaskFormData } from "@/components/TaskModal";

// ---------------- TYPES ----------------
type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string | null;
  tags: string[];
};

// ---------------- STYLE MAP ----------------
const priorityColors = {
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

const statusIcons = {
  pending: Circle,
  "in-progress": Circle,
  completed: CheckCircle2,
};

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useContext();

  // ---------------- FETCH TASKS ----------------
  const { data: rawTasks = [], isLoading: tasksLoading } =
    trpc.task.listAll.useQuery();

  // ---------------- MUTATIONS ----------------
  const createTask = trpc.task.create.useMutation({
    onSuccess: () => utils.task.listByProject.invalidate({ projectId: 1 }),
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.listByProject.invalidate({ projectId: 1 }),
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.listByProject.invalidate({ projectId: 1 }),
  });

  // ---------------- NORMALIZE ----------------
  const tasks: Task[] = rawTasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ?? null,
    tags: (t.tags ?? []).map((tag: any) => tag.name),
  }));

  // ---------------- LOCAL STATE ----------------
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ---------------- REDIRECT ----------------
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated]);

  // ---------------- LOADING ----------------
  if (loading || !isAuthenticated) {
    return (
      <DashboardLayoutCustom>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full" />
        </div>
      </DashboardLayoutCustom>
    );
  }

  if (tasksLoading) {
    return (
      <DashboardLayoutCustom>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full" />
        </div>
      </DashboardLayoutCustom>
    );
  }

  // ---------------- FILTER ----------------
  const q = searchQuery.toLowerCase();

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q) ?? false);

    const matchPriority = !filterPriority || t.priority === filterPriority;

    return matchSearch && matchPriority;
  });

  // ---------------- STATS ----------------
  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: BarChart3 },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: Cog,
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
      icon: Check,
    },
    {
      label: "Overdue",
      value: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed"
      ).length,
      icon: AlertTriangle,
    },
  ];

  // ---------------- ACTIONS ----------------
  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCreate = (data: TaskFormData) => {
    createTask.mutate({
      projectId: 1,
      title: data.title,
      description: data.description ?? undefined,
      priority: data.priority,
      dueDate: data.dueDate,
    });
    setModalOpen(false);
  };

  const handleUpdate = (id: number, data: TaskFormData) => {
    updateTask.mutate({
      id,
      title: data.title,
      description: data.description ?? undefined,
      priority: data.priority,
      dueDate: data.dueDate,
    });
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this task?")) {
      deleteTask.mutate({ id });
    }
  };

  const handleToggleStatus = (task: Task) => {
    const next =
      task.status === "pending"
        ? "in-progress"
        : task.status === "in-progress"
        ? "completed"
        : "pending";

    updateTask.mutate({ id: task.id, status: next });
  };

  // ---------------- RENDER ----------------
  return (
    <DashboardLayoutCustom>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none cursor-default">
          <div>
            <h1 className="text-3xl font-bold pointer-events-none">Dashboard</h1>
            <p className="text-muted-foreground pointer-events-none">
              Manage your tasks and projects efficiently
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="cursor-default">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="cursor-default">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </div>

                    <Icon className="w-8 h-8 text-muted-foreground pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* TASK LIST */}
        <Card>
          <CardHeader className="border-b border-border/50">
            <div className="flex flex-col sm:flex-row justify-between gap-3">

              {/* TITLE + COUNT */}
              <div className="pointer-events-none select-none">
                <CardTitle>Tasks</CardTitle>

                <CardDescription>
                  {filteredTasks.length} task
                  {filteredTasks.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-2 select-none">

              {/* SEARCH */}
              <div className="relative cursor-default">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 pointer-events-auto select-text"
                />
              </div>

              {/* PRIORITY FILTER */}
              <Button
                variant="outline"
                onClick={() =>
                  setFilterPriority(filterPriority === "high" ? null : "high")
                }
                className="cursor-pointer"
              >
                <Filter className="w-4 h-4 pointer-events-none" />
              </Button>
            </div>

            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const Icon = statusIcons[task.status];

                return (
                  <div
                    key={task.id}
                    className="flex gap-4 p-4 rounded-lg hover:bg-accent/50 transition group"
                  >
                    {/* STATUS TOGGLE */}
                    <button onClick={() => handleToggleStatus(task)}>
                      <Icon
                        className={`w-5 h-5 ${
                          task.status === "completed"
                            ? "text-green-500"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                    </button>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">

                        {/* TITLE + DESC */}
                        <div className="pointer-events-none select-none">
                          <h3
                            className={`font-medium ${
                              task.status === "completed"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>

                        {/* PRIORITY BADGE — FIXED SIZE */}
                        <Badge
                          className={`
                            ${priorityColors[task.priority]}
                            min-w-[70px] h-6 
                            inline-flex items-center justify-center
                            text-xs font-medium rounded-md
                            pointer-events-none select-none
                          `}
                          variant="secondary"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {/* TAGS + DATE */}
                      <div className="flex items-center gap-2 mt-2 pointer-events-none select-none">

                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}

                        <span className="ml-auto text-xs text-muted-foreground">
                          Due:{" "}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("id-ID")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL */}
      <div className="select-none">

        <div className="pointer-events-auto">
          <TaskModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={async (data) => {
              if (editingTask) {
                await handleUpdate(editingTask.id, data);
              } else {
                await handleCreate(data);
              }
            }}
            defaultValues={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description ?? undefined,
                    priority: editingTask.priority,
                    dueDate: editingTask.dueDate,
                  }
                : undefined
            }
          />
        </div>

      </div>

    </DashboardLayoutCustom>
  );
}
