// pages/project/ProjectDetail.tsx

import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

import { DashboardLayoutCustom } from "@/components/DashboardLayoutCustom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Edit2, Plus, Trash2 } from "lucide-react";

import { ProjectModal } from "@/components/ProjectModal";
import { AddTaskModal } from "@/components/AddTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";

import type { TaskWithTags } from "@/types/task";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectDetail() {
  const [match, params] = useRoute("/projects/:id");
  const navigate = useLocation()[1];

  const rawId = params?.id;
  const projectId = Number(rawId);

  if (!rawId || Number.isNaN(projectId) || projectId <= 0) {
    return (
      <DashboardLayoutCustom>
        <div className="space-y-4 select-none cursor-default">
          <h2 className="text-xl font-bold text-red-500">Invalid project</h2>
          <p className="text-sm text-muted-foreground">
            The project id in the URL is invalid.
          </p>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      </DashboardLayoutCustom>
    );
  }

  const { data: project, isLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const { data: tasks = [] } = trpc.project.getTasks.useQuery(
    { projectId },
    { enabled: !!projectId, refetchOnWindowFocus: false }
  );

  const utils = trpc.useUtils();

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      navigate("/projects");
    },
  });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate();
      utils.project.getTasks.invalidate({ projectId });
    },
  });

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.project.getTasks.invalidate({ projectId });
      utils.project.getById.invalidate();
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.project.getTasks.invalidate({ projectId });
      utils.project.getById.invalidate();
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      utils.project.getTasks.invalidate({ projectId });
      utils.project.getById.invalidate();
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithTags | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithTags | null>(null);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);

  const openTaskDeleteDialog = (taskOrId: TaskWithTags | number) => {
    if (typeof taskOrId === "number") {
      const foundTask = tasks.find((t) => t.id === taskOrId) ?? null;
      setTaskToDelete(foundTask);
      return;
    }
    setTaskToDelete(taskOrId);
  };

  const handleDeleteProject = () => {
    if (!project) {
      return;
    }

    setDeleteLoading(true);
    deleteProject.mutate(
      { id: project.id },
      {
        onSuccess: () => {
          setDeleteLoading(false);
          setShowDeleteDialog(false);
        },
        onError: () => {
          setDeleteLoading(false);
        },
      }
    );
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) {
      return;
    }

    setTaskDeleteLoading(true);
    deleteTask.mutate(
      { id: taskToDelete.id },
      {
        onSuccess: () => {
          setTaskDeleteLoading(false);
          setTaskToDelete(null);
        },
        onError: () => {
          setTaskDeleteLoading(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayoutCustom>
        <p className="text-muted-foreground select-none cursor-default">
          Loading project...
        </p>
      </DashboardLayoutCustom>
    );
  }

  if (!project) {
    return (
      <DashboardLayoutCustom>
        <div className="space-y-4 select-none cursor-default">
          <h2 className="text-xl font-bold text-red-500">Project not found</h2>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      </DashboardLayoutCustom>
    );
  }

  const statusStyle =
    {
      active: "bg-[#DAFDE9] text-[#125C45]",
      completed:
        "bg-[#D2E2FF] text-[#1547E6] dark:bg-[#1547E6] dark:text-[#D2E2FF]",
      archived:
        "bg-[#E9E9F7] text-[#1F1F2A] dark:bg-[#1F1F2A] dark:text-[#E9E9F7]",
    }[project.status] ?? "bg-gray-800 text-white";

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 select-none cursor-default">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description ?? ""}</p>
          </div>

          <div className="flex gap-2 select-none cursor-default">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2 pointer-events-none" /> Edit
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2 pointer-events-none" /> Delete
            </Button>
          </div>
        </div>

        {/* BANNER */}
        <div className={`h-32 rounded-xl bg-linear-to-br ${project.color}`} />

        {/* PROJECT OVERVIEW */}
        <Card className="select-none cursor-default">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* STATUS */}
            <div>
              <span className="text-muted-foreground text-sm">Status:</span>
              <span
                className={[
                  "ml-2 px-2 py-1 rounded-md text-xs font-medium",
                  statusStyle,
                ].join(" ")}
              >
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>

            {/* PROGRESS */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>{project.progress}%</span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${project.color}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* CREATED */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 pointer-events-none" />
              Created:{" "}
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            {/* BOXES */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-accent/50 flex flex-col items-start">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="font-semibold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TASK HEADER */}
        <div className="flex justify-between items-center mt-6">
          <h2 className="text-xl font-semibold">Tasks</h2>

          <Button className="gap-2" onClick={() => setTaskModalOpen(true)}>
            <Plus className="w-4 h-4 pointer-events-none" /> Add Task
          </Button>
        </div>

        {/* KANBAN */}
        <KanbanBoard
          projectId={projectId}
          tasks={tasks as TaskWithTags[]}
          onOpenDetail={(task) => setSelectedTask(task)}
          onDeleteTask={openTaskDeleteDialog}
        />
      </div>

      {/* EDIT PROJECT */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={{
          id: project.id,
          name: project.name,
          description: project.description ?? "",
          status: project.status,
          progress: project.progress ?? 0,
          color: project.color || "from-blue-500 to-blue-600",
        }}
        onSubmit={(data) => {
          updateProject.mutate({
            id: project.id,
            name: data.name || project.name,
            description:
              data.description && data.description.trim().length > 0
                ? data.description.trim()
                : "",
            status: data.status || project.status,
            progress: data.progress ?? project.progress ?? 0,
            color:
              data.color && data.color.length > 0
                ? data.color
                : project.color || "from-blue-500 to-blue-600",
          });
        }}
      />

      {/* ADD TASK */}
      <AddTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(data) => {
          createTask.mutate({
            projectId: project.id,
            title: data.title,
            description: data.description || "",
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || null,
          });
        }}
      />

      {/* EDIT TASK */}
      {selectedTask && (
        <EditTaskModal
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          initialData={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description ?? "",
            status: selectedTask.status,
            priority: selectedTask.priority,
            dueDate: selectedTask.dueDate
              ? new Date(selectedTask.dueDate).toISOString()
              : undefined,
          }}
          onSubmit={(data) => {
            updateTask.mutate(
              {
                id: selectedTask.id,
                ...data,
                description:
                  data.description && data.description.length > 0
                    ? data.description
                    : "",
                dueDate: data.dueDate || undefined,
              },
              {
                onSuccess: () => setSelectedTask(null),
              }
            );
          }}
        />
      )}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTaskToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="w-full max-w-md rounded-[24px] border border-[#dfe5eb] bg-white px-8 py-10 text-center shadow-[0_20px_74px_rgba(15,23,42,0.27)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
            <span className="text-4xl font-semibold leading-none text-white">
              !
            </span>
          </div>

          <AlertDialogHeader className="space-y-1 text-center">
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900 text-center">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 text-center">
              {taskToDelete?.title
                ? `Are you sure you want to delete "${taskToDelete.title}"?`
                : "Are you sure you want to delete this task?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8 flex w-full flex-row gap-4 justify-center">
            <AlertDialogCancel
              type="button"
              className="h-12 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 w-full flex-1"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              onClick={handleConfirmDeleteTask}
              disabled={taskDeleteLoading}
              className="h-12 rounded-full bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] transition hover:bg-red-700 disabled:opacity-70 w-full flex-1"
            >
              {taskDeleteLoading ? "Delete..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowDeleteDialog(false);
          }
        }}
      >
        <AlertDialogContent className="w-full max-w-md rounded-[24px] border border-[#dfe5eb] bg-white px-8 py-10 text-center shadow-[0_20px_74px_rgba(15,23,42,0.27)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
            <span className="text-4xl font-semibold leading-none text-white">
              !
            </span>
          </div>

          <AlertDialogHeader className="space-y-1 text-center sm:text-center">
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900 text-center sm:text-center">
              Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 text-center sm:text-center">
              Are you sure you want to delete this project?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* FOOTER (Tombol lebar, sejajar, dan terpusat) */}
          <AlertDialogFooter className="mt-8 flex w-full flex-row gap-4 justify-center">
            <AlertDialogCancel
              type="button"
              className="h-12 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 w-full flex-1"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              onClick={handleDeleteProject}
              disabled={deleteLoading}
              className="h-12 rounded-full bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] transition hover:bg-red-700 disabled:opacity-70 w-full flex-1"
            >
              {deleteLoading ? "Delete..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayoutCustom>
  );
}
