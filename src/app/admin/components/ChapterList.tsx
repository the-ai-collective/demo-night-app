"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { UpsertChapterModal } from "./UpsertChapterModal";
import { ChapterDetailsModal } from "./ChapterDetailsModal";
import { MoreVertical, Trash2, Eye, Pencil } from "lucide-react";
import type { Chapter } from "~/lib/types/chapter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

export function ChapterList() {
  const { data: chapters, isLoading } = api.chapter.all.useQuery();
  const utils = api.useUtils();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: deleteChapter } = api.chapter.delete.useMutation({
    onSuccess: () => {
      utils.chapter.all.invalidate();
      utils.event.allAdmin.invalidate();
    },
    onError: (error) => {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    },
  });

  const handleViewDetails = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setDetailsOpen(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setEditOpen(true);
  };

  const handleDelete = (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      deleteChapter({ id: chapterId });
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading chapters...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Chapters</h2>
        <UpsertChapterModal />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chapters?.map((chapter: Chapter) => (
          <Card
            key={chapter.id}
            className="p-4 relative overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Three-dot menu in top right */}
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(chapter)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(chapter)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(chapter.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 pr-8">
              {/* Header with emoji and stats badge */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <span className="text-3xl">{chapter.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{chapter.name}</h3>
                  <p className="text-sm text-gray-600">
                    {chapter.city}, {chapter.country}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2">
                {/* Lead Tag */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <span>👤</span>
                  <span>{chapter.leadName || "Not assigned"}</span>
                </div>

                {/* Events Tag */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <span>📅</span>
                  <span>{chapter._count?.events ?? 0} {chapter._count?.events === 1 ? "event" : "events"}</span>
                </div>
              </div>

              {chapter.description && (
                <p className="text-sm text-gray-700 line-clamp-2">{chapter.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {chapters?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No chapters yet. Create one to get started!
        </div>
      )}

      {/* Modals */}
      {selectedChapter && (
        <ChapterDetailsModal
          chapter={selectedChapter}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}

      {editingChapter && (
        <UpsertChapterModal
          chapter={editingChapter}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            setEditingChapter(undefined);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}