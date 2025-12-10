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
import { ArrowLeft } from "lucide-react";

const TagIcon = ({
  color = "#635EFC",
  size = 42,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M28.547 15.4398L16.547 3.43984C16.047 2.94394 15.3712 2.66594 14.667 2.6665H5.33366C4.62642 2.6665 3.94814 2.94746 3.44804 3.44755C2.94794 3.94765 2.66699 4.62593 2.66699 5.33317V14.6665C2.66671 15.0184 2.73608 15.3668 2.8711 15.6918C3.00611 16.0167 3.2041 16.3118 3.45366 16.5598L15.4537 28.5598C15.9536 29.0557 16.6295 29.3337 17.3337 29.3332C18.0398 29.3302 18.7159 29.0473 19.2137 28.5465L28.547 19.2132C29.0478 18.7154 29.3307 18.0393 29.3337 17.3332C29.3339 16.9813 29.2646 16.6328 29.1296 16.3079C28.9945 15.9829 28.7966 15.6879 28.547 15.4398ZM17.3337 26.6665L5.33366 14.6665V5.33317H14.667L26.667 17.3332M8.66699 6.6665C9.06256 6.6665 9.44924 6.7838 9.77813 7.00357C10.107 7.22333 10.3634 7.53569 10.5148 7.90114C10.6661 8.26659 10.7057 8.66872 10.6286 9.05669C10.5514 9.44465 10.3609 9.80101 10.0812 10.0807C9.8015 10.3604 9.44514 10.5509 9.05717 10.6281C8.66921 10.7052 8.26708 10.6656 7.90163 10.5143C7.53617 10.3629 7.22382 10.1065 7.00405 9.77765C6.78429 9.44875 6.66699 9.06207 6.66699 8.6665C6.66699 8.13607 6.87771 7.62736 7.25278 7.25229C7.62785 6.87722 8.13656 6.6665 8.66699 6.6665Z"
      fill={color}
    />
  </svg>
);

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

          <TagIcon color={tag.color ?? "#635EFC"} size={42} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-default">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Tasks using
              </p>
              <p className="text-3xl font-bold">{tag.name}</p>
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
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl cursor-default">
                 Tagged tasks
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              These tasks are currently tagged for quick filtering across all
              projects.
            </p>
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
