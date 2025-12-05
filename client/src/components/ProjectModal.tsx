import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]),
  progress: z.number().min(0).max(100),
  color: z.string().min(1),
});

export type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: ProjectFormValues & { id?: number };
  onSubmit: (data: ProjectFormValues) => Promise<void> | void;
}

const GRADIENTS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-red-500 to-red-600",
];

export function ProjectModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: ProjectModalProps) {
  const isEdit = Boolean(initialData?.id);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      progress: 0,
      color: "from-blue-500 to-blue-600",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        status: initialData.status,
        progress: initialData.progress ?? 0,
        color: initialData.color ?? "from-blue-500 to-blue-600",
      });
    }
  }, [initialData]);

  const handleSave = async (data: ProjectFormValues) => {
    try {
      setLoading(true);
      await onSubmit(data);
      setLoading(false);

      form.reset(initialData);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset(initialData);
          onClose();
        }
      }}
    >
      <DialogContent className="select-none cursor-default">
        <DialogHeader>
          <DialogTitle className="select-none">
            {isEdit ? "Edit Project" : "New Project"}
          </DialogTitle>

          {/* Full FIX for Radix warning */}
          <DialogDescription className="select-none">
            {isEdit
              ? "Update your project details."
              : "Create a new project to organize your tasks."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
          {/* Name */}
          <div className="space-y-1 select-none">
            <label className="text-sm font-medium select-none">
              Project Name
            </label>
            <Input {...form.register("name")} className="select-text" />
          </div>

          {/* Description */}
          <div className="space-y-1 select-none">
            <label className="text-sm font-medium select-none">
              Description
            </label>
            <Textarea
              rows={3}
              {...form.register("description")}
              className="select-text"
            />
          </div>

          {/* Status */}
          <div className="space-y-1 select-none">
            <label className="text-sm font-medium select-none">Status</label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue("status", v as any, { shouldDirty: true })
              }
            >
              <SelectTrigger className="select-text cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="select-none">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="space-y-1 select-none">
            <label className="text-sm font-medium select-none">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() =>
                    form.setValue("color", g, { shouldDirty: true })
                  }
                  className={`
                    h-8 rounded-full bg-linear-to-br ${g}
                    border-2 transition cursor-pointer
                    ${
                      form.watch("color") === g
                        ? "border-white ring-2 ring-primary"
                        : "border-transparent"
                    }
                  `}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer select-none"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
