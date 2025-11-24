"use client";

import { type Chapter } from "@prisma/client";
import { ArrowLeftIcon, PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getBrandingClient } from "~/lib/branding";
import { api } from "~/trpc/react";

import Logos from "~/components/Logos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ChaptersPage() {
  const branding = getBrandingClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(
    undefined,
  );
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | undefined>(
    undefined,
  );

  const { data: chapters, refetch } = api.chapter.list.useQuery();
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();
  const deleteMutation = api.chapter.delete.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      emoji: "",
      slug: "",
    },
  });

  const filteredChapters =
    chapters?.filter(
      (chapter) =>
        chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  const openCreateModal = () => {
    setChapterToEdit(undefined);
    reset({ name: "", emoji: "", slug: "" });
    setModalOpen(true);
  };

  const openEditModal = (chapter: Chapter) => {
    setChapterToEdit(chapter);
    reset({
      name: chapter.name,
      emoji: chapter.emoji,
      slug: chapter.slug,
    });
    setModalOpen(true);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (chapterToEdit) {
        await updateMutation.mutateAsync({
          id: chapterToEdit.id,
          name: data.name,
          emoji: data.emoji,
          slug: data.slug || undefined, // Only include slug if provided
        });
        toast.success("Chapter updated successfully!");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          emoji: data.emoji,
          slug: data.slug || undefined, // Only include slug if provided
        });
        toast.success("Chapter created successfully!");
      }
      setModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save chapter",
      );
    }
  });

  const handleDelete = async () => {
    if (!chapterToDelete) return;
    try {
      await deleteMutation.mutateAsync(chapterToDelete.id);
      toast.success("Chapter deleted successfully!");
      setDeleteDialogOpen(false);
      setChapterToDelete(undefined);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chapter",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/60 shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-1 px-8 py-2">
          <Logos size={36} logoPath={branding.logoPath} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="line-clamp-1 font-marker text-xl font-bold leading-6 tracking-tight">
              {branding.appName} App
            </h1>
            <span className="font-marker text-sm font-bold text-muted-foreground">
              Admin Dashboard
            </span>
          </div>
          <div className="flex w-[108px] items-center justify-end" />
        </div>
      </header>

      <div className="container mx-auto p-8">
        <div className="mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Chapters</h2>
            <p className="text-sm text-muted-foreground">
              Organize events by chapter location
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Chapter
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredChapters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No chapters found matching your search"
                  : "No chapters yet. Create your first chapter to get started!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((chapter) => (
              <Card
                key={chapter.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-2xl">{chapter.emoji}</span>
                        <h3 className="text-lg font-semibold">
                          {chapter.name}
                        </h3>
                      </div>
                      <p className="mb-1 text-sm text-muted-foreground">
                        Slug:{" "}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          {chapter.slug}
                        </code>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {chapter._count.events}{" "}
                        {chapter._count.events === 1 ? "event" : "events"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(chapter)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setChapterToDelete(chapter);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chapterToEdit ? "Edit Chapter" : "Create New Chapter"}
            </DialogTitle>
            <DialogDescription>
              {chapterToEdit
                ? "Update the chapter details below."
                : "Create a new chapter to organize events by location."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="San Francisco"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  {...register("emoji", { required: "Emoji is required" })}
                  placeholder="🌉"
                />
                {errors.emoji && (
                  <p className="text-sm text-destructive">
                    {errors.emoji.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  {...register("slug", {
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message:
                        "Slug must be lowercase alphanumeric with hyphens",
                    },
                  })}
                  placeholder="sf (auto-generated from name if not provided)"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Auto-generated from name if not provided.
                  Lowercase letters, numbers, and hyphens only.
                  {chapterToEdit && " Leave empty to keep current slug."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {chapterToEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{chapterToDelete?.name}</strong>?
              <br />
              <br />
              Deleting a chapter will not delete events. Events assigned to this
              chapter will become unassigned and can be reassigned to another
              chapter later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
