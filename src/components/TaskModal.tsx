import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { trpc } from "@/lib/trpc";

export type TaskFormData = {
  projectId: number;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  status?: "pending" | "in-progress" | "completed";
  dueDate?: string | null;
  tagIds?: number[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  defaultValues?: {
    projectId?: number;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    dueDate: string | null;
  };
}

export function TaskModal({ open, onOpenChange, onSubmit, defaultValues }: Props) {
  // @ts-ignore
  const projectsQuery = trpc.project.getAll.useQuery();

  const [projectId, setProjectId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);

  /* --------------------------------------------------------
     SYNC DEFAULT VALUES (CREATE / EDIT)
  -------------------------------------------------------- */
  useEffect(() => {
    if (open) {
      if (defaultValues) {
        setProjectId(defaultValues.projectId ?? null);
        setTitle(defaultValues.title);
        setDescription(defaultValues.description ?? "");
        setPriority(defaultValues.priority);

        if (defaultValues.dueDate) {
          const parsedDate = parseISO(defaultValues.dueDate);
          setDueDate(!isNaN(parsedDate.getTime()) ? parsedDate : null);
        } else {
          setDueDate(null);
        }
      } else {
    // CREATE MODE
    setProjectId(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(null);
  }
    }
  }, [open, defaultValues]);

  /* --------------------------------------------------------
     HANDLE SAVE
  -------------------------------------------------------- */
  const handleSave = async () => {
    if (!title.trim() || !projectId || loading) return;

    setLoading(true);

    await onSubmit({
      projectId,
      title,
      description: description || null,
      priority,
      status: defaultValues ? undefined : "pending",
      dueDate: dueDate ? dueDate.toISOString() : null,
    });

    setLoading(false);
    onOpenChange(false);
  };

  /* --------------------------------------------------------
     RENDER UI
  -------------------------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] select-none cursor-default">

        <DialogHeader>
          <DialogTitle className="select-none">
            {defaultValues ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="select-none">
            Select project & fill task details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 select-none">

          {/* PROJECT DROPDOWN */}
          <div className="grid gap-2">
            <Label>Project *</Label>

            <Select
              value={projectId ? String(projectId) : ""}
              onValueChange={(v) => setProjectId(Number(v))}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>

              <SelectContent>
                {projectsQuery.data?.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TITLE */}
          <div className="grid gap-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cursor-text select-text"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="cursor-text select-text"
            />
          </div>

          {/* PRIORITY + DUE DATE */}
          <div className="grid grid-cols-2 gap-4">

            {/* PRIORITY */}
            <div className="grid gap-2">
              <Label>Priority</Label>

              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as any)}
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

            {/* DUE DATE */}
            <div className="grid gap-2">
              <Label>Due Date</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal cursor-pointer",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate ?? undefined}
                    onSelect={(d) => setDueDate(d ?? null)}
                  />
                </PopoverContent>
              </Popover>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={loading || !title.trim() || !projectId}>
            {defaultValues ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
