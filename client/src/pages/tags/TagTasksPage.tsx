import { useEffect } from "react";
import { DashboardLayoutCustom } from "@/components/DashboardLayoutCustom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Tag } from "lucide-react";

export default function TagTasksPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const tagQuery = trpc.tag.getById.useQuery({ id: Number(id) });
  const tasksQuery = trpc.task.getByTagId.useQuery({ tagId: Number(id) });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (tagQuery.isLoading || tasksQuery.isLoading)
    return (
      <DashboardLayoutCustom>
        <p className="text-center py-10 text-muted-foreground select-none cursor-default">
          Loading...
        </p>
      </DashboardLayoutCustom>
    );

  if (!tagQuery.data)
    return (
      <DashboardLayoutCustom>
        <p className="text-center py-10 text-muted-foreground select-none cursor-default">
          Tag not found
        </p>
      </DashboardLayoutCustom>
    );

  const tag = tagQuery.data;
  const tasks = tasksQuery.data ?? [];

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 max-w-4xl mx-auto select-none">

        {/* BACK BUTTON */}
        <button
          onClick={() => setLocation("/tags")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tags
        </button>

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge
                className="text-white px-3 py-1.5 text-base rounded-lg cursor-default select-none"
                style={{ backgroundColor: tag.color ?? "#3b82f6" }}
              >
                {tag.name}
              </Badge>
            </div>

            <p className="text-muted-foreground max-w-xl cursor-default">
              {tag.description || "No description provided for this tag."}
            </p>
          </div>

          <Tag className="text-muted-foreground opacity-70 cursor-default" size={42} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-default">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tag ID</p>
              <p className="text-3xl font-bold">#{tag.id}</p>
            </CardContent>
          </Card>

          <Card className="cursor-default">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tasks Linked</p>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* TASK LIST */}
        <Card className="cursor-default">
          <CardHeader>
            <CardTitle className="text-xl cursor-default">
              Tasks using "{tag.name}"
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground cursor-default">
                No tasks are using this tag yet.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="
                    p-4 
                    rounded-lg 
                    border 
                    bg-card 
                    hover:bg-accent 
                    hover:shadow 
                    transition 
                    cursor-pointer
                    select-none
                  "
                  onClick={() => setLocation(`/projects/${task.projectId}`)}
                >
                  <h3 className="font-semibold text-lg">{task.title}</h3>

                  <p className="text-muted-foreground text-sm mt-1">
                    {task.description || "No description"}
                  </p>

                  <div className="text-xs text-muted-foreground mt-2">
                    Status:{" "}
                    <span className="font-medium capitalize">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutCustom>
  );
}
