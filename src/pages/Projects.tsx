import { useState } from "react";
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
  Plus,
  Search,
  MoreVertical,
  Folder,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ProjectModal } from "@/components/ProjectModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type ProjectStatus = "active" | "completed" | "archived";

const statusColors: Record<ProjectStatus, string> = {
  active: "bg-[#DAFDE9] text-[#125C45] ",
  completed:
    "bg-[#D2E2FF] text-[#1547E6] dark:bg-[#1547E6] dark:text-[#D2E2FF]",
  archived:
    "bg-[#E9E9F7] text-[#1F1F2A] dark:bg-[#1F1F2A] dark:text-[#E9E9F7]",
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number | null;
  color: string | null;
  createdAt: Date;
  ownerName?: string | null;
  taskCount: number;
};

export default function Projects() {
  const navigate = useLocation()[1];

  const { data: rawProjects, isLoading } = trpc.project.getAll.useQuery();

  const projects = (rawProjects ?? []) as Project[];

  const utils = trpc.useUtils();

  const createProject = trpc.project.create.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  // NEW STATES FOR DELETE DIALOG
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteProject = () => {
    if (!selectedProject) {
      return;
    }

    setDeleteLoading(true);
    deleteProject.mutate(
      { id: selectedProject.id },
      {
        onSuccess: () => {
          setDeleteLoading(false);
          setShowDeleteDialog(false);
          setSelectedProject(null);
        },
        onError: () => {
          setDeleteLoading(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayoutCustom>
        <p className="text-muted-foreground select-none cursor-default">
          Loading projects...
        </p>
      </DashboardLayoutCustom>
    );
  }

  const statusFilters: ProjectStatus[] = ["active", "completed", "archived"];

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || project.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 select-none cursor-default">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your projects
            </p>
          </div>

          <Button
            className="gap-2 cursor-pointer select-none"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                className="capitalize cursor-pointer"
                onClick={() =>
                  setFilterStatus(filterStatus === status ? null : status)
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden cursor-pointer"
            >
              <div
                className={`h-32 bg-linear-to-br ${project.color} relative`}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/30 text-white transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(project);
                          setModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>

                      {/* DELETE ACTION */}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.description || "No description"}
                    </CardDescription>
                  </div>

                  <Badge
                    variant="secondary"
                    className={[
                      "px-2 py-1 rounded-md text-xs font-semibold cursor-default",
                      statusColors[project.status],
                    ].join(" ")}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent
                className="space-y-4 cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-accent/50 flex gap-2 items-center">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                      <p className="font-semibold">{project.taskCount}</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-accent/50 flex gap-2 items-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-semibold text-xs">
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2 group cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="text-center py-10">
              <Folder className="w-12 h-12 mb-4 text-muted-foreground mx-auto" />
              <h3 className="font-semibold text-lg">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                Create your first project to get started
              </p>
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PROJECT MODAL */}
      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                description: editing.description ?? undefined,
                status: editing.status,
                progress: editing.progress ?? 0,
                color: editing.color ?? "from-blue-500 to-blue-600",
              }
            : undefined
        }
        onSubmit={(data) => {
          const payload = { ...data };
          if (editing) {
            updateProject.mutate(
              { id: editing.id, ...payload },
              {
                onSuccess: () => {
                  setModalOpen(false);
                  setEditing(null);
                },
              }
            );
          } else {
            createProject.mutate(payload, {
              onSuccess: () => {
                setModalOpen(false);
              },
            });
          }
        }}
      />

      {/* DELETE DIALOG - MODIFIKASI HANYA PADA FOOTER */}
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

          {/* PERBAIKAN DI SINI: Membuat tombol sejajar horizontal, lebar penuh, dan di tengah */}
          <AlertDialogFooter className="mt-8 flex w-full flex-row gap-4 justify-center">
            <AlertDialogCancel
              type="button"
              // Kelas lama: h-12 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50
              // Kelas baru ditambahkan: w-1/2 flex-1
              className="h-12 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 w-full flex-1"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              onClick={handleDeleteProject}
              disabled={deleteLoading}
              // Kelas lama: h-12 rounded-full bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] transition hover:bg-red-700 disabled:opacity-70
              // Kelas baru ditambahkan: w-1/2 flex-1
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
