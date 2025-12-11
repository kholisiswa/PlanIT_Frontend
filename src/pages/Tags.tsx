import { useState } from "react";
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
import { Plus, Search, Trash2, Edit2 } from "lucide-react";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ================================
//   CUSTOM ICONS (dihilangkan untuk fokus pada layout)
// ================================

const UsageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none">
    <path
      d="M4.68733 24C4.04288 24 3.47088 23.7889 2.97133 23.3667C2.47177 22.9444 2.16599 22.4111 2.05399 21.7667L0.0206611 9.56667C-0.0460055 9.16667 0.0486612 8.80578 0.304661 8.484C0.560661 8.16222 0.899328 8.00089 1.32066 8H22.1873C22.6096 8 22.9487 8.16133 23.2047 8.484C23.4607 8.80667 23.5549 9.16756 23.4873 9.56667L21.454 21.7667C21.3429 22.4111 21.0375 22.9444 20.538 23.3667C20.0384 23.7889 19.466 24 18.8207 24H4.68733ZM2.95399 10.6667L4.65399 21.3333H18.854L20.554 10.6667H2.95399ZM9.08733 16H14.4207C14.7984 16 15.1153 15.872 15.3713 15.616C15.6273 15.36 15.7549 15.0436 15.754 14.6667C15.7531 14.2898 15.6251 13.9733 15.37 13.7173C15.1149 13.4613 14.7984 13.3333 14.4207 13.3333H9.08733C8.70955 13.3333 8.39311 13.4613 8.13799 13.7173C7.88288 13.9733 7.75488 14.2898 7.75399 14.6667C7.75311 15.0436 7.88111 15.3604 8.13799 15.6173C8.39488 15.8742 8.71133 16.0018 9.08733 16ZM3.75399 6.66667C3.37622 6.66667 3.05977 6.53867 2.80466 6.28267C2.54955 6.02667 2.42155 5.71022 2.42066 5.33333C2.41977 4.95644 2.54777 4.64 2.80466 4.384C3.06155 4.128 3.37799 4 3.75399 4H19.754C20.1318 4 20.4487 4.128 20.7047 4.384C20.9607 4.64 21.0882 4.95644 21.0873 5.33333C21.0864 5.71022 20.9584 6.02711 20.7033 6.284C20.4482 6.54089 20.1318 6.66844 19.754 6.66667H3.75399ZM6.42066 2.66667C6.04288 2.66667 5.72644 2.53867 5.47133 2.28267C5.21622 2.02667 5.08822 1.71022 5.08733 1.33333C5.08644 0.956445 5.21444 0.64 5.47133 0.384C5.72822 0.128 6.04466 0 6.42066 0H17.0873C17.4651 0 17.782 0.128 18.038 0.384C18.294 0.64 18.4216 0.956445 18.4207 1.33333C18.4198 1.71022 18.2918 2.02711 18.0367 2.284C17.7815 2.54089 17.4651 2.66844 17.0873 2.66667H6.42066Z"
      fill="#D44A28"
    />
  </svg>
);

const TagsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none">
    <path
      d="M28.547 15.4398L16.547 3.43984C16.047 2.94394 15.3712 2.66594 14.667 2.6665H5.33366C4.62642 2.6665 3.94814 2.94746 3.44804 3.44755C2.94794 3.94765 2.66699 4.62593 2.66699 5.33317V14.6665C2.66671 15.0184 2.73608 15.3668 2.8711 15.6918C3.00611 16.0167 3.2041 16.3118 3.45366 16.5598L15.4537 28.5598C15.9536 29.0557 16.6295 29.3337 17.3337 29.3332C18.0398 29.3302 18.7159 29.0473 19.2137 28.5465L28.547 19.2132C29.0478 18.7154 29.3307 18.0393 29.3337 17.3332C29.3339 16.9813 29.2646 16.6328 29.1296 16.3079C28.9945 15.9829 28.7966 15.6879 28.547 15.4398ZM17.3337 26.6665L5.33366 14.6665V5.33317H14.667L26.667 17.3332M8.66699 6.6665C9.06256 6.6665 9.44924 6.7838 9.77813 7.00357C10.107 7.22333 10.3634 7.53569 10.5148 7.90114C10.6661 8.26659 10.7057 8.66872 10.6286 9.05669C10.5514 9.44465 10.3609 9.80101 10.0812 10.0807C9.8015 10.3604 9.44514 10.5509 9.05717 10.6281C8.66921 10.7052 8.26708 10.6656 7.90163 10.5143C7.53617 10.3629 7.22382 10.1065 7.00405 9.77765C6.78429 9.44875 6.66699 9.06207 6.66699 8.6665C6.66699 8.13607 6.87771 7.62736 7.25278 7.25229C7.62785 6.87722 8.13656 6.6665 8.66699 6.6665Z"
      fill="#635EFC"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="8"
    viewBox="0 0 15 8"
    fill="none">
    <path
      d="M0.192308 4.44169C0.0589744 4.30836 -0.00502564 4.1528 0.000307692 3.97503C0.00564103 3.79725 0.0751966 3.64169 0.208974 3.50836C0.342308 3.38614 0.497863 3.32214 0.675641 3.31636C0.853419 3.31058 1.00897 3.37458 1.14231 3.50836L3.50897 5.87503L3.74231 6.10836L3.97564 6.34169C4.10897 6.47503 4.17297 6.63058 4.16764 6.80836C4.16231 6.98614 4.09275 7.14169 3.95897 7.27503C3.82564 7.39725 3.67009 7.46125 3.49231 7.46703C3.31453 7.4728 3.15897 7.4088 3.02564 7.27503L0.192308 4.44169ZM7.25897 5.85836L12.9256 0.191693C13.059 0.0583601 13.2145 -0.00541782 13.3923 0.000359957C13.5701 0.00613773 13.7256 0.0754709 13.859 0.20836C13.9812 0.341693 14.0452 0.497249 14.051 0.675027C14.0568 0.852804 13.9928 1.00836 13.859 1.14169L7.72564 7.27503C7.59231 7.40836 7.43675 7.47503 7.25897 7.47503C7.0812 7.47503 6.92564 7.40836 6.79231 7.27503L3.95897 4.44169C3.83675 4.31947 3.77564 4.1668 3.77564 3.98369C3.77564 3.80058 3.83675 3.64214 3.95897 3.50836C4.09231 3.37503 4.25075 3.30836 4.43431 3.30836C4.61786 3.30836 4.77609 3.37503 4.90897 3.50836L7.25897 5.85836ZM10.0756 1.15836L7.72564 3.50836C7.60342 3.63058 7.45075 3.69169 7.26764 3.69169C7.08453 3.69169 6.92609 3.63058 6.79231 3.50836C6.65897 3.37503 6.59231 3.2168 6.59231 3.03369C6.59231 2.85058 6.65897 2.69214 6.79231 2.55836L9.14231 0.20836C9.26453 0.0861376 9.41742 0.0250267 9.60097 0.0250267C9.78453 0.0250267 9.94275 0.0861376 10.0756 0.20836C10.209 0.341693 10.2756 0.499916 10.2756 0.683027C10.2756 0.866138 10.209 1.02458 10.0756 1.15836Z"
      fill="#00BC4B"
    />
  </svg>
);

const COLOR_REFERENCE = [
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#a855f7" },
  { name: "Red", color: "#ef4444" },
  { name: "Green", color: "#22c55e" },
  { name: "Yellow", color: "#eab308" },
  { name: "Orange", color: "#f97316" },
  { name: "Pink", color: "#ec4899" },
  { name: "Indigo", color: "#6366f1" },
];

const COLOR_PRESETS = COLOR_REFERENCE.map((item) => item.color);

type TagType = RouterOutputs["tag"]["getAll"][number];

export default function Tags() {
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLOR_PRESETS[0]);
  const resetNewTagForm = () => {
    setNewTagName("");
    setNewTagDesc("");
    setNewTagColor(COLOR_PRESETS[0] ?? "#3b82f6");
  };

  // QUERIES
  const tagsQuery = trpc.tag.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tagList: TagType[] = tagsQuery.data ?? [];

  // MUTATIONS
  const utils = trpc.useUtils();
  const createTag = trpc.tag.create.useMutation({
    onSuccess: () => {
      utils.tag.getAll.invalidate();
      toast.success("Tag baru telah ditambahkan!");
      if (isAddDialogOpen) {
        resetNewTagForm();
        setIsAddDialogOpen(false);
      }
    },
  });

  const updateTag = trpc.tag.update.useMutation({
    onSuccess: () => {
      utils.tag.getAll.invalidate();
      setEditingId(null);
      toast.success("Tag berhasil diperbarui!");
    },
  });

  const deleteTag = trpc.tag.delete.useMutation({
    onSuccess: () => {
      utils.tag.getAll.invalidate();
    },
  });

  const filtered = tagList.filter((tag: TagType) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTags = tagList.length;
  const totalUsage = tagList.reduce<number>((s, t) => s + Number(t.usageCount ?? 0), 0);

  const handleCreate = () => {
    setIsAddDialogOpen(true);
  };

  const handleSubmitNewTag = () => {
    if (!newTagName.trim()) {
      toast.error("Masukkan nama tag terlebih dahulu!");
      return;
    }

    createTag.mutate({
      name: newTagName.trim(),
      description: newTagDesc,
      color: newTagColor,
    });
  };

  const startEditing = (tag: TagType) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditDesc(tag.description ?? "");
    setEditColor(tag.color ?? "#3b82f6");
  };

  const handleUpdate = (tag: TagType) => {
    updateTag.mutate({
      id: tag.id,
      name: editName,
      description: editDesc,
      color: editColor,
    });
  };

  const handleDelete = (id: number) => {
    setTagToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleOpenTag = (id: number) => {
    setLocation(`/tags/${id}`);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowDeleteDialog(open);
    if (!open) {
      setTagToDelete(null);
    }
  };

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 select-none">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your task tags
            </p>
          </div>

          <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            New Tag
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tags</p>
                  <p className="text-3xl font-bold">{totalTags}</p>
                </div>
                <TagsIcon />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-3xl font-bold">{totalUsage}</p>
                </div>
                <UsageIcon />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* LIST */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>All Tags</CardTitle>
            <CardDescription>{filtered.length} tags</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {tagsQuery.isLoading && (
              <p className="text-center py-6 text-muted-foreground">Loading...</p>
            )}

            {!tagsQuery.isLoading && filtered.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">
                No tags found
              </p>
            )}

            <div className="space-y-2">
              {filtered.map((tag) => (
                <div
                  key={tag.id}
                  className="
                    flex flex-col sm:flex-row sm:items-center sm:justify-between 
                    gap-4 py-3 px-4 rounded-lg border border-border bg-card/70 
                    hover:bg-card/90 transition-colors cursor-pointer group
                  "
                  onClick={() => handleOpenTag(tag.id)}>
                  
                  {/* KIRI: Nama Tag (Badge) dan Deskripsi */}
                  <div
                    className="flex flex-1 items-center gap-4 min-w-0"
                    onClick={(e) => e.stopPropagation()}>
                    
                    {/* BADGE */}
                    <Badge
                      variant="secondary"
                      className="cursor-default flex-shrink-0"
                      style={{
                        backgroundColor:
                          editingId === tag.id
                            ? editColor
                            : tag.color ?? "#3b82f6",
                        color: "white",
                      }}>
                      {editingId === tag.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-6 text-xs w-32 cursor-text select-text"
                        />
                      ) : (
                        tag.name
                      )}
                    </Badge>

                    {/* DESCRIPTION */}
                    <div className="flex-1 min-w-0"> 
                      {editingId === tag.id ? (
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description..."
                          className="h-8 text-xs w-full cursor-text select-text"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground truncate">
                          {tag.description || "No description"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* KANAN: Usage Count, Color Picker, & Action Buttons */}
                  <div
                    className="
                      flex items-center justify-between sm:justify-end gap-3
                      border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 
                      border-border/70
                    "
                    onClick={(e) => e.stopPropagation()}>
                    
                    {/* USAGE */}
                    <div
                      className="text-left sm:text-right flex-shrink-0" /* MODIFIKASI: text-left di mobile */
                      style={{ minWidth: "56px" }}>
                      <p className="text-lg font-semibold text-foreground leading-none">
                        {tag.usageCount ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">uses</p>
                    </div>

                    {/* Color Picker & Action Buttons Container */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      
                      {/* COLORS WHEN EDITING */}
                      {editingId === tag.id && (
                        <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          {COLOR_PRESETS.map((c) => (
                            <div
                              key={c}
                              className="w-5 h-5 rounded-full cursor-pointer border-2 border-transparent"
                              style={{
                                backgroundColor: c,
                                borderColor:
                                  editColor === c ? "white" : "transparent",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditColor(c);
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* EDIT / DELETE BUTTONS */}
                      <div className="flex items-center gap-2">
                        {editingId === tag.id ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdate(tag);
                            }}>
                            <CheckIcon />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(tag);
                            }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tag.id);
                          }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADD TAG DIALOG - PERBAIKAN DI HEADER & COLOR BUTTONS */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetNewTagForm();
          }
        }}>
        <DialogContent className="max-w-md">
          {/* Tambahkan text-center untuk memusatkan teks di header */}
          <DialogHeader className="text-center"> 
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>Fill in the name, description, and color of your new tag</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">New Tag</p>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Name Tag"
                className="h-11"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Description</p>
              <Input
                value={newTagDesc}
                onChange={(e) => setNewTagDesc(e.target.value)}
                placeholder="Description"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Color Tag</p>
              <div className="grid grid-cols-4 gap-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    // PERBAIKAN: Menggunakan w-full agar tombol mengisi kolom grid sepenuhnya
                    className="h-10 w-full rounded-lg border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    style={{
                      backgroundColor: color,
                      // Warna border disesuaikan agar terlihat lebih jelas pada latar belakang gelap
                      borderColor: newTagColor === color ? "white" : "transparent",
                    }}
                    aria-label={`Pilih warna ${color}`}
                    aria-pressed={newTagColor === color}
                    onClick={() => setNewTagColor(color)}>
                    {newTagColor === color && (
                      <span className="sr-only">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSubmitNewTag}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG (Tidak diubah, hanya memastikan konsistensi) */}
      <Dialog open={showDeleteDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="select-none">
          <DialogHeader>
            <DialogTitle>Delete Tag?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove the
              tag.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setTagToDelete(null);
              }}>
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (tagToDelete != null) {
                  deleteTag.mutate(
                    { id: tagToDelete },
                    {
                      onSuccess: () => {
                        setShowDeleteDialog(false);
                        setTagToDelete(null);
                        toast.success("Tag berhasil dihapus!");
                      },
                    }
                  );
                } else {
                  setShowDeleteDialog(false);
                }
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayoutCustom>
  );
}
