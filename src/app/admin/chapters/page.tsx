"use client";

import { type Chapter } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrandingClient } from "~/lib/branding";
import { api } from "~/trpc/react";

import { UpsertChapterModal } from "./components/UpsertChapterModal";
import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function ChaptersPage() {
  const branding = getBrandingClient();
  const router = useRouter();
  const { data: chapters, refetch, isLoading } = api.chapter.all.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(
    undefined,
  );

  const showUpsertChapterModal = (chapter?: Chapter) => {
    setChapterToEdit(chapter);
    setModalOpen(true);
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
              Chapter Management
            </span>
          </div>
          <div className="flex w-[108px] items-center justify-end" />
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Chapters</h2>
            <p className="text-sm text-muted-foreground">
              Organize events by chapter (SF, NYC, Boston, etc.)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Events
            </Button>
            <Button onClick={() => showUpsertChapterModal()}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Chapter
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <ChapterSkeleton />
              <ChapterSkeleton />
            </>
          ) : chapters && chapters.length > 0 ? (
            chapters.map((chapter) => (
              <Card key={chapter.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                        {chapter.emoji}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{chapter.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Created{" "}
                          {new Date(chapter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => showUpsertChapterModal(chapter)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No chapters yet. Create your first chapter to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <UpsertChapterModal
        chapter={chapterToEdit}
        onSubmit={() => {
          refetch();
        }}
        onDeleted={() => {
          setModalOpen(false);
          refetch();
        }}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  );
}

function ChapterSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-200" />
            <div>
              <div className="h-6 w-32 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-10 w-16 rounded bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}

