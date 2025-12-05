import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------
const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().nullable().optional(),
  tagIds: z.array(z.number()).optional(),
});

type TaskFormData = z.infer<typeof TaskSchema>;

// --------------------------------------------------
// PROPS
// --------------------------------------------------
interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------
export function AddTaskModal({ open, onClose, onSubmit }: AddTaskModalProps) {
  // GET ALL TAGS
  const tagsQuery = trpc.tag.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // FORM
  const form = useForm<TaskFormData>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: null,
      tagIds: [],
    },
  });

  // RESET WHEN MODAL OPENS
  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  // TAG HANDLER
  const selectedTags = form.watch("tagIds") ?? [];

  const toggleTag = (id: number) => {
    const current = form.getValues("tagIds") ?? [];

    form.setValue(
      "tagIds",
      current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id]
    );
  };

  // SUBMIT
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      description: data.description || undefined,
      tagIds: data.tagIds ?? [],
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    });

    onClose();
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="add-task-modal"
        className="sm:max-w-[500px] bg-background text-foreground border-border select-none cursor-default"
      >
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" id="add-task-modal">

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              {...form.register("title")}
              placeholder="Write task title..."
              className="cursor-text"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...form.register("description")}
              placeholder="Optional description..."
              className="cursor-text"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as any)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={form.watch("priority")}
              onValueChange={(v) => form.setValue("priority", v as any)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left cursor-pointer gap-2",
                    !form.watch("dueDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 opacity-70" />
                  {form.watch("dueDate")
                    ? new Date(form.watch("dueDate")!).toLocaleDateString("id-ID")
                    : "dd/mm/yyyy"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-auto">
                <Calendar
                  mode="single"
                  selected={
                    form.watch("dueDate")
                      ? new Date(form.watch("dueDate")!)
                      : undefined
                  }
                  onSelect={(date) =>
                    form.setValue("dueDate", date ? date.toISOString() : null)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">Tags</label>

            <div className="flex flex-wrap gap-2 mt-2">
              {tagsQuery.data?.map((tag: any) => {
                const active = selectedTags.includes(tag.id);

                return (
                  <Badge
                    key={tag.id}
                    variant={active ? "default" : "secondary"}
                    onClick={() => toggleTag(tag.id)}
                    className="cursor-pointer px-3 py-1 transition select-none"
                    style={{
                      backgroundColor: active ? tag.color ?? undefined : undefined,
                      color: active ? "white" : undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
