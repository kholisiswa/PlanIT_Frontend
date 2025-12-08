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
import { Plus, Search, Trash2, Edit2, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Tags() {
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");

  const COLOR_PRESETS = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#0ea5e9"];

  // QUERIES
  const tagsQuery = trpc.tag.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // MUTATIONS
  const utils = trpc.useUtils();
  const createTag = trpc.tag.create.useMutation({
    onSuccess: () => utils.tag.getAll.invalidate(),
  });

  const updateTag = trpc.tag.update.useMutation({
    onSuccess: () => {
      utils.tag.getAll.invalidate();
      setEditingId(null);
    },
  });

  const deleteTag = trpc.tag.delete.useMutation({
    onSuccess: () => utils.tag.getAll.invalidate(),
  });

  // FILTER
  const filtered =
    tagsQuery.data?.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  const totalTags = tagsQuery.data?.length ?? 0;
  const totalUsage =
    tagsQuery.data?.reduce((s, t) => s + Number(t.usageCount ?? 0), 0) ?? 0;

  // HANDLERS
  const handleCreate = () => {
    createTag.mutate({
      name: `New Tag ${totalTags + 1}`,
      description: "",
      color: "#3b82f6",
    });
  };

  const startEditing = (tag: any) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditDesc(tag.description ?? "");
    setEditColor(tag.color ?? "#3b82f6");
  };

  const handleUpdate = (tag: any) => {
    updateTag.mutate({
      id: tag.id,
      name: editName,
      description: editDesc,
      color: editColor,
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this tag?")) return;
    deleteTag.mutate({ id });
  };

  const handleOpenTag = (id: number) => {
    setLocation(`/tags/${id}`);
  };

  return (
    <DashboardLayoutCustom>
      <div className="space-y-6 select-none">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-default">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tags</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your task tags
            </p>
          </div>

          <Button className="gap-2 w-full sm:w-auto cursor-pointer select-none" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            New Tag
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-default">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tags</p>
                  <p className="text-3xl font-bold">{totalTags}</p>
                </div>
                <Tag className="w-8 h-8 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-3xl font-bold font-sans">
                    {Number(totalUsage || 0)}
                  </p>
                </div>
                <Tag className="w-8 h-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH */}
        <div className="relative select-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 cursor-text select-text"
          />
        </div>

        {/* LIST */}
        <Card>
          <CardHeader className="border-b cursor-default">
            <CardTitle>All Tags</CardTitle>
            <CardDescription>{filtered.length} tags</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {tagsQuery.isLoading && (
              <p className="text-center py-6 text-muted-foreground cursor-default">
                Loading...
              </p>
            )}

            {!tagsQuery.isLoading && filtered.length === 0 && (
              <p className="text-center py-6 text-muted-foreground cursor-default">
                No tags found
              </p>
            )}

            <div className="space-y-2">
              {filtered.map((tag: TagType) => (
                <div
                  key={tag.id}
                  className="
                    flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                    p-4 rounded-lg hover:bg-accent/50 transition-colors group
                    cursor-pointer select-none
                  "
                  onClick={() => handleOpenTag(tag.id)}
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4 flex-1 w-full">

                    {/* BADGE */}
                    <Badge
                      variant="secondary"
                      className="cursor-default"
                      style={{
                        backgroundColor:
                          editingId === tag.id ? editColor : (tag.color ?? "#3b82f6"),
                        color: "white",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
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
                    <div
                      className="flex-1 cursor-default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingId === tag.id ? (
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description..."
                          className="h-8 text-xs cursor-text select-text"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {tag.description || "No description"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >

                    {/* USAGE */}
                    <div className="text-right cursor-default">
                      <p className="text-sm font-semibold">{tag.usageCount ?? 0}</p>
                      <p className="text-xs text-muted-foreground">uses</p>
                    </div>

                    {/* COLORS WHEN EDITING */}
                    {editingId === tag.id && (
                      <div className="flex gap-1 flex-wrap">
                        {COLOR_PRESETS.map((c) => (
                          <div
                            key={c}
                            onClick={() => setEditColor(c)}
                            className="w-5 h-5 rounded-full cursor-pointer border-2"
                            style={{
                              backgroundColor: c,
                              borderColor: editColor === c ? "white" : "transparent",
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* EDIT / DELETE BUTTONS */}
                    <div className="flex gap-2 select-none">

                      {editingId === tag.id ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 cursor-pointer"
                          onClick={() => handleUpdate(tag)}
                        >
                          ✔
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() => startEditing(tag)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive cursor-pointer"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutCustom>
  );
}
