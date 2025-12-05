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
  Users,
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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  archived:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function Projects() {
  const navigate = useLocation()[1];

  /* -----------------------------
     TRPC QUERIES
  ----------------------------- */
  // @ts-ignore
  const { data: projects = [], isLoading } = trpc.project.getAll.useQuery();
  // @ts-ignore
  const utils = trpc.useUtils();

  // @ts-ignore
  const createProject = trpc.project.create.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  // @ts-ignore
  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  // @ts-ignore
  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => utils.project.getAll.invalidate(),
  });

  /* -----------------------------
     UI STATE
  ----------------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  if (isLoading) {
    return (
      <DashboardLayoutCustom>
        <p className="text-muted-foreground select-none cursor-default">
          Loading projects...
        </p>
      </DashboardLayoutCustom>
    );
  }

  /* -----------------------------
     FILTER
  ----------------------------- */
  const filteredProjects = projects.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* -----------------------------
     RENDER
  ----------------------------- */
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 select-text cursor-text"
            />
          </div>

          <div className="flex gap-2">
            {["active", "completed", "archived"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                className="capitalize cursor-pointer select-none"
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
              {/* TOP GRADIENT */}
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
                        className="opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/30 text-white transition-opacity cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="cursor-pointer select-none">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(project);
                          setModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Delete this project?")) {
                            deleteProject.mutate({ id: project.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* CONTENT */}
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
    "px-2 py-1 rounded-md text-xs font-semibold capitalize",

    project.status === "active" &&
      "bg-yellow-500 text-white dark:bg-yellow-600",

    project.status === "completed" &&
      "bg-green-500 text-white dark:bg-green-600",

    project.status === "archived" &&
      "bg-gray-800 text-gray-100 dark:bg-gray-700",
  ]
    .filter(Boolean)
    .join(" ")}
>
  {project.status}
</Badge>

                </div>
              </CardHeader>

              <CardContent
                className="space-y-4 cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
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

                {/* STATS */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2 rounded-lg bg-accent/50 flex gap-2 items-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-semibold">{project.ownerName}</p>
                    </div>
                  </div>

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

                {/* VIEW DETAILS */}
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

        {/* EMPTY STATE */}
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
                className="cursor-pointer select-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MODAL */}
      <div className="select-none cursor-default">
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
                  description: editing.description,
                  status: editing.status,
                  progress: editing.progress,
                  color: editing.color,
                }
              : undefined
          }
          onSubmit={(data) => {
            const submissionData = { ...data };
            if (editing) {
              updateProject.mutate(
                { id: editing.id, ...submissionData },
                {
                  onSuccess: () => {
                    setModalOpen(false);
                    setEditing(null);
                  },
                }
              );
            } else {
              createProject.mutate(submissionData, {
                onSuccess: () => {
                  setModalOpen(false);
                },
              });
            }
          }}
        />
      </div>
    </DashboardLayoutCustom>
  );
}
