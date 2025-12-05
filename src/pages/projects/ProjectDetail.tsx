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
            {/* EDIT BUTTON */}
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2 pointer-events-none" /> Edit
            </Button>

            {/* DELETE BUTTON FIXED */}
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (confirm("Delete this project?")) {
                  deleteProject.mutate({ id: project.id });
                }
              }}
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
    project.status === "active"
      ? "bg-yellow-400 text-white"
      : project.status === "completed"
      ? "bg-green-400 text-white"
      : "bg-gray-800 text-white",
  ].join(" ")}
>
  {project.status}
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
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-accent/50 flex flex-col items-start">
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="font-semibold">{project.ownerName ?? ""}</p>
              </div>

              <div className="p-3 rounded-lg bg-accent/50 flex flex-col items-start">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="font-semibold">{tasks.length}</p>
              </div>

              <div className="p-3 rounded-lg bg-accent/50 flex flex-col items-start">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-semibold text-xs">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
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
          onDeleteTask={(taskId) => deleteTask.mutate({ id: taskId })}
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
    </DashboardLayoutCustom>
  );
}
