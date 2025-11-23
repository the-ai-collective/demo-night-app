"use client";

import { type Chapter } from "@prisma/client";
import { BarChart3, Edit2, PlusIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

import { AdminHeader } from "../components/AdminHeader";
import { DeleteChapterDialog } from "./components/DeleteChapterDialog";
import { UpsertChapterModal } from "./components/UpsertChapterModal";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function ChaptersPage() {
  const { data: chapters, isLoading } = api.chapter.getAllAdmin.useQuery();
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>();

  const handleCreate = () => {
    setSelectedChapter(undefined);
    setIsUpsertOpen(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsUpsertOpen(true);
  };

  const handleDelete = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="container mx-auto max-w-5xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
            <p className="text-muted-foreground">
              Manage your local demo night chapters.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Loading chapters...
              </div>
            ) : chapters?.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                <p>No chapters found.</p>
                <Button variant="outline" onClick={handleCreate}>
                  Create your first chapter
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Emoji</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-center">Events</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters?.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell className="text-xl">{chapter.emoji}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/chapters/${chapter.id}`}
                          className="hover:underline"
                        >
                          {chapter.name}
                        </Link>
                      </TableCell>
                      <TableCell>{chapter.city || "-"}</TableCell>
                      <TableCell className="text-center">
                        {/* @ts-expect-error _count is added by the include */}
                        {chapter._count?.events || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {chapter.hidden ? (
                          <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
                            Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-transparent bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 hover:bg-green-100/80">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/chapters/${chapter.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Stats"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(chapter)}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(chapter)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <UpsertChapterModal
          open={isUpsertOpen}
          setOpen={setIsUpsertOpen}
          chapterToEdit={selectedChapter}
          onSuccess={() => setSelectedChapter(undefined)}
        />

        <DeleteChapterDialog
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
          chapterToDelete={selectedChapter}
          onSuccess={() => setSelectedChapter(undefined)}
        />
      </div>
    </main>
  );
}

