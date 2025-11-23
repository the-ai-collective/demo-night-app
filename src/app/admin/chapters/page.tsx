"use client";

import { useState } from "react";
import type { Chapter } from "~/lib/types/chapter";
import { PlusIcon } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { UpsertChapterModal } from "../components/UpsertChapterModal";
import { DeleteChapterButton } from "../components/DeleteChapter";
import { AdminHeader } from "../components/AdminHeader";

export default function ChaptersAdminPage() {
  const { data: chapters, refetch } = api.chapter.allAdmin.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(undefined);

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="container mx-auto p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <Button onClick={() => { setEditing(undefined); setModalOpen(true); }}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Chapter
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {chapters?.map((chapter: Chapter) => (
            <Card key={chapter.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                    {chapter.emoji}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-bold">{chapter.name}</div>
                    <div className="text-sm text-muted-foreground">{chapter.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => { e.stopPropagation(); setEditing(chapter); setModalOpen(true); }}
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                  <DeleteChapterButton
                    chapterId={chapter.id}
                    onDeleted={() => refetch()}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <UpsertChapterModal
        chapter={editing}
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) refetch(); }}
        onUpsert={() => refetch()}
      />
    </main>
  );
}
