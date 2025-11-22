"use client";

import { type Chapter } from "@prisma/client";
import { EyeIcon, PlusIcon, Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrandingClient } from "~/lib/branding";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import Emoji from "~/components/Emoji";
import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

import { UpsertChapterModal } from "~/app/admin/components/UpsertChapterModal";

export default function ChaptersPage() {
  const branding = getBrandingClient();

  const {
    data: chapters,
    refetch: refetchChapters,
    isLoading,
  } = api.chapter.all.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(undefined);

  const router = useRouter();
  const refetch = () => {
    refetchChapters();
  };

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
              Admin Dashboard
            </span>
          </div>
          <div className="flex w-[108px] items-center justify-end" />
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <div className="flex gap-x-2">
            <Button onClick={() => router.push("/admin")}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Events
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
              <ChapterSkeleton />
            </>
          ) : (
            chapters?.map((chapter) => (
              <Card
                key={chapter.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  "border-border",
                  "active:scale-[0.99]",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xl">
                      <Emoji>{chapter.emoji}</Emoji>
                    </span>

                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <span className="line-clamp-1 text-xl">
                            {chapter.name}
                          </span>
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Presentation className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {chapter._count.events}
                          </span>
                          <span className="text-muted-foreground">
                            {chapter._count.events === 1 ? "event" : "events"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        showUpsertChapterModal(chapter);
                      }}
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
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <UpsertChapterModal
        chapter={chapterToEdit}
        onSubmit={() => refetch()}
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
        <div className="flex items-center justify-between gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-200" />
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-7 w-48 rounded bg-gray-200" />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="h-8 w-8 rounded bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}
