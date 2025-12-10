import { useEffect, useState, type SVGProps } from "react";
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

import { Plus, Search, Filter } from "lucide-react";

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
  tags: { name: string; color?: string | null }[];

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

const CompletedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32" fill="none">
    <path d="M2.33335 17.4C2.06668 17.1333 1.93868 16.8222 1.94935 16.4667C1.96001 16.1111 2.09912 15.8 2.36668 15.5333C2.63335 15.2889 2.94446 15.1609 3.30001 15.1493C3.65557 15.1378 3.96668 15.2658 4.23335 15.5333L8.96668 20.2667L9.43335 20.7333L9.90001 21.2C10.1667 21.4667 10.2947 21.7778 10.284 22.1333C10.2733 22.4889 10.1342 22.8 9.86668 23.0667C9.60001 23.3111 9.2889 23.4391 8.93335 23.4507C8.57779 23.4622 8.26668 23.3342 8.00001 23.0667L2.33335 17.4ZM16.4667 20.2333L27.8 8.89999C28.0667 8.63332 28.3778 8.50577 28.7333 8.51732C29.0889 8.52888 29.4 8.66754 29.6667 8.93332C29.9111 9.19999 30.0391 9.5111 30.0507 9.86665C30.0622 10.2222 29.9342 10.5333 29.6667 10.8L17.4 23.0667C17.1333 23.3333 16.8222 23.4667 16.4667 23.4667C16.1111 23.4667 15.8 23.3333 15.5333 23.0667L9.86668 17.4C9.62224 17.1555 9.50001 16.8502 9.50001 16.484C9.50001 16.1178 9.62224 15.8009 9.86668 15.5333C10.1333 15.2667 10.4502 15.1333 10.8173 15.1333C11.1845 15.1333 11.5009 15.2667 11.7667 15.5333L16.4667 20.2333ZM22.1 10.8333L17.4 15.5333C17.1556 15.7778 16.8502 15.9 16.484 15.9C16.1178 15.9 15.8009 15.7778 15.5333 15.5333C15.2667 15.2667 15.1333 14.9502 15.1333 14.584C15.1333 14.2178 15.2667 13.9009 15.5333 13.6333L20.2333 8.93332C20.4778 8.68888 20.7836 8.56666 21.1507 8.56666C21.5178 8.56666 21.8342 8.68888 22.1 8.93332C22.3667 9.19999 22.5 9.51643 22.5 9.88266C22.5 10.2489 22.3667 10.5658 22.1 10.8333Z" fill="#00BC4B"/>
  </svg>
);

const InProgressIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32" fill="none">
    <path d="M2.6665 15.9998C2.6665 23.3638 8.63584 29.3332 15.9998 29.3332C23.3638 29.3332 29.3332 23.3638 29.3332 15.9998C29.3332 8.63584 23.3638 2.6665 15.9998 2.6665C8.63584 2.6665 2.6665 8.63584 2.6665 15.9998ZM26.6665 15.9998C26.6665 18.8288 25.5427 21.5419 23.5423 23.5423C21.5419 25.5427 18.8288 26.6665 15.9998 26.6665C13.1709 26.6665 10.4578 25.5427 8.45736 23.5423C6.45698 21.5419 5.33317 18.8288 5.33317 15.9998C5.33317 13.1709 6.45698 10.4578 8.45736 8.45736C10.4578 6.45698 13.1709 5.33317 15.9998 5.33317C18.8288 5.33317 21.5419 6.45698 23.5423 8.45736C25.5427 10.4578 26.6665 13.1709 26.6665 15.9998ZM15.9998 15.9998V7.99984C18.1216 7.99984 20.1564 8.84269 21.6567 10.343C23.157 11.8433 23.9998 13.8781 23.9998 15.9998H15.9998Z" fill="#F3B000"/>
  </svg>
);

const PendingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32" fill="none">
    <path d="M13.3335 27.7027C12.1733 27.4384 11.0589 27.0029 10.0269 26.4107M18.6669 4.29736C21.3177 4.90279 23.6845 6.39028 25.3797 8.5163C27.0749 10.6423 27.9981 13.2809 27.9981 16C27.9981 18.7192 27.0749 21.3577 25.3797 23.4838C23.6845 25.6098 21.3177 27.0973 18.6669 27.7027M6.10553 22.7907C5.37898 21.7335 4.82664 20.5667 4.46953 19.3347M4.16553 14C4.37886 12.7334 4.78953 11.5334 5.36553 10.4334L5.59086 10.0267M9.20953 6.10536C10.4578 5.24787 11.8571 4.6344 13.3335 4.29736M16.0002 10.6667V16M16.0002 21.3334V21.3467" stroke="#F10F23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const statusIcons = {
  pending: PendingIcon,
  "in-progress": InProgressIcon,
  completed: CompletedIcon,
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
    tags: (t.tags ?? []).map((tag: any) => ({
      name: tag.name,
      color: tag.color,
    })),
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
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: "📊",
      color: "#3B82F6",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: "⚙️",
      color: "#F59E0B",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
      icon: "✅",
      color: "#10B981",
    },
    {
      label: "Overdue",
      value: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed"
      ).length,
      icon: "⚠️",
      color: "#EF4444",
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
            return (
              <Card key={s.label} className="cursor-default">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="cursor-default">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </div>

                    <span
                      className="text-3xl pointer-events-none"
                      style={{ color: s.color }}
                      aria-hidden="true"
                    >
                      {s.icon}
                    </span>
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
                          <Badge
                            key={tag.name}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: tag.color ?? "#3b82f6",
                              color: "white",
                            }}
                          >
                            {tag.name}
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
