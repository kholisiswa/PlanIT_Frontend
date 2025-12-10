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
import { Archive as ArchiveIcon } from "lucide-react";

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
  onDelete?: (id: number) => Promise<void> | void;
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
  onDelete,
}: ProjectModalProps) {
  const isEdit = Boolean(initialData?.id);
  const [loading, setLoading] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!initialData?.id || !onDelete) {
      return;
    }

    try {
      setDeleteLoading(true);
      await onDelete(initialData.id);
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Delete failed", error);
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = (value: ProjectFormValues["status"]) => {
    const currentStatus = form.getValues("status");

    if (isEdit && value === "archived" && currentStatus !== "archived") {
      setArchiveDialogOpen(true);
      return;
    }

    form.setValue("status", value, { shouldDirty: true });
  };

  const handleConfirmArchive = () => {
    form.setValue("status", "archived", { shouldDirty: true });
    setArchiveDialogOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setArchiveDialogOpen(false);
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

            {/* Status (only editable when editing existing project) */}
            {isEdit && (
              <div className="space-y-1 select-none">
                <label className="text-sm font-medium select-none">Status</label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    handleStatusChange(v as ProjectFormValues["status"])
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
            )}

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
              {/* Progress Input (dihapus dari kode yang Anda berikan, tetapi diperlukan oleh formSchema) */}
            </div>

            {/* Delete Project CTA */}
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:border-red-300 hover:text-red-700 focus-visible:ring-red-500/50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Project
              </Button>
            )}

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
      
      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(isOpen) => setDeleteDialogOpen(isOpen)}
      >
        <AlertDialogContent className="w-full max-w-md rounded-[24px] border border-[#dfe5eb] bg-white px-8 py-10 text-center shadow-[0_20px_74px_rgba(15,23,42,0.27)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
            <span className="text-4xl font-semibold leading-none text-white">
              !
            </span>
          </div>
          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900">
              Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Apakah kamu yakin ingin menghapus tugas ini?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8 flex flex-col gap-3">
            <AlertDialogCancel
              type="button"
              className="h-12 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Batal
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              className="h-12 rounded-full bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] transition hover:bg-red-700 disabled:opacity-70"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG (ARCHIVE CONFIRMATION) */}
      <AlertDialog
        open={archiveDialogOpen}
        onOpenChange={(isOpen) => setArchiveDialogOpen(isOpen)}
      >
        <AlertDialogContent className="w-full max-w-md rounded-[24px] border border-[#dfe5eb] bg-white px-8 py-10 text-center shadow-[0_20px_74px_rgba(15,23,42,0.27)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <ArchiveIcon className="h-12 w-12 text-slate-500" />
          </div>
          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900">
              Archive
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Anda yakin untuk mengarsip project ini ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* PERBAIKAN DI SINI: Mengubah tata letak footer agar tombol berdampingan */}
          <AlertDialogFooter className="mt-8 flex w-full flex-row-reverse sm:justify-center gap-3">
            <AlertDialogAction
              type="button"
              onClick={handleConfirmArchive}
              className="h-12 flex-1 rounded-full bg-[#37475A] text-sm font-semibold text-white transition hover:bg-[#2A3748] shadow-[0_10px_20px_rgba(15,23,42,0.25)]"
            >
              Archive Project
            </AlertDialogAction>
            
            <AlertDialogCancel
              type="button"
              className="h-12 flex-1 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Batal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
