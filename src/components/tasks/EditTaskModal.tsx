// client/src/pages/tasks/EditTaskModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

// calendar imports
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// -----------------------------------------------------
// FORM SCHEMA
// -----------------------------------------------------
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().nullable().optional(),
  tagIds: z.array(z.number()).optional(),
});

export type EditTaskFormValues = z.infer<typeof formSchema>;

// -----------------------------------------------------
// COMPONENT
// -----------------------------------------------------
interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  initialData: EditTaskFormValues & { id: number };
  onSubmit: (data: EditTaskFormValues) => void;
}

export function EditTaskModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: EditTaskModalProps) {
  const tagsQuery = trpc.tag.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const safeInitial = {
    ...initialData,
    description: initialData.description ?? "",
    dueDate: initialData.dueDate ?? "",
    tagIds: initialData.tagIds ?? [],
  };

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: safeInitial,
  });

  // Reset form setiap modal dibuka
  useEffect(() => {
    if (open) form.reset(safeInitial);
  }, [open, initialData]);

  // TAG TOGGLE
  const toggleTag = (tagId: number) => {
    const current = form.getValues("tagIds") ?? [];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];

    form.setValue("tagIds", next);
  };

  const selected = form.watch("tagIds") ?? [];

  // DUE DATE PARSING
  const parsedDueDate = form.watch("dueDate")
    ? new Date(form.watch("dueDate")!)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((data) => {
            onSubmit({
              ...data,
              description: data.description || undefined,
              dueDate: data.dueDate
                ? new Date(data.dueDate).toISOString()
                : null,
              tagIds: data.tagIds ?? [],
            });
          })}
        >
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input {...form.register("title")} />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea rows={3} {...form.register("description")} />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={form.watch("priority")}
              onValueChange={(v) => form.setValue("priority", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DUE DATE — FIXED DARK CALENDAR ONLY */}
          <div>
            <label className="text-sm font-medium">Due Date</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {parsedDueDate
                    ? format(parsedDueDate, "dd/MM/yyyy")
                    : "Select date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="
                  w-auto p-0 
                  bg-[#1c1c1e]
                  border border-[#2a2a2d]
                  text-white
                  rounded-xl
                  shadow-xl
                "
              >
                <Calendar
                  mode="single"
                  selected={parsedDueDate ?? undefined}
                  className="dark [&>*]:bg-transparent [&_*]:text-white"
                  onSelect={(date) => {
                    if (!date) {
                      form.setValue("dueDate", null);
                      return;
                    }

                    // Simpan tanggal saja (jam ke 00:00)
                    const cleaned = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    ).toISOString();

                    form.setValue("dueDate", cleaned);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            </div>
            
          {/* TAG PICKER */}
          <div>
            <label className="text-sm font-medium">Tags</label>

            <div className="flex flex-wrap gap-2 mt-2">
              {tagsQuery.data?.map((tag) => {
                const active = selected.includes(tag.id);

                return (
                  <Badge
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="cursor-pointer px-3 py-1"
                    style={{
                      backgroundColor: active
                        ? tag.color ?? "#3b82f6"
                        : "#e5e7eb",
                      color: active ? "white" : "black",
                    }}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
