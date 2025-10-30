"use client";

import CsvButton from "../../components/CsvButton";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  ExternalLink,
  FlagIcon,
  ShareIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { statusScore } from "~/lib/types/submissionStatus";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { getBrandingClient } from "~/lib/branding";

import SubmissionStatusBadge from "~/components/SubmissionStatusBadge";
import { Button } from "~/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import SubmissionDetails from "./SubmissionDetails";

const CSV_HEADERS = [
  "id",
  "name",
  "tagline",
  "description",
  "email",
  "url",
  "pocName",
  "demoUrl",
];

export type Event = {
  id: string;
  name: string;
  date: Date;
  url: string;
  secret: string;
};

export default function SubmissionsDashboard({
  event: initialEvent,
  isAdmin,
}: {
  event: Event;
  isAdmin: boolean;
}) {
  const branding = getBrandingClient();
  const { data: submissions, refetch } = api.submission.all.useQuery({
    eventId: initialEvent.id,
    secret: initialEvent.secret,
  });
  const setSubmissionsMutation = api.submission.setSubmissions.useMutation();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  submissions?.sort((a, b) => {
    if (a.status !== b.status) {
      return statusScore(b.status) - statusScore(a.status);
    }
    if (a.flagged !== b.flagged) {
      return a.flagged ? -1 : 1;
    }
    if ((b.rating ?? 0) !== (a.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    return a.name.localeCompare(b.name);
  });

  const selectedSubmission = submissions?.find((s) => s.id === selectedId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!submissions || submissions.length === 0) return;
      if (event.key === "Escape") {
        setSelectedId(undefined);
      }
      if (event.key === "ArrowUp" || event.key === "[") {
        setSelectedId((prev) => {
          if (!prev) return submissions[0]?.id;
          const currentIndex = submissions.findIndex((s) => s.id === prev);
          if (currentIndex > 0) return submissions[currentIndex - 1]?.id;
          return prev;
        });
      }
      if (event.key === "ArrowDown" || event.key === "]") {
        setSelectedId((prev) => {
          if (!prev) return submissions[0]?.id;
          const currentIndex = submissions.findIndex((s) => s.id === prev);
          if (currentIndex < submissions.length - 1)
            return submissions[currentIndex + 1]?.id;
          return prev;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submissions]);

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/admin/${initialEvent.id}/submissions?secret=${initialEvent.secret}`,
    );
    toast.success("URL to view submissions copied to clipboard!");
  };

  const onUploadSubmissions = (rows: Record<string, string>[]) => {
    setSubmissionsMutation
      .mutateAsync({
        eventId: initialEvent.id,
        submissions: rows as any,
      })
      .then(() => {
        toast.success("Submissions updated!");
        refetch();
      })
      .catch((e) => {
        toast.error("Failed to update submissions: " + e.message);
      });
  };

  return (
    <div className="flex size-full flex-1 flex-col gap-2">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex min-h-12 flex-row items-end justify-between space-y-0 pb-2">
            <div className="flex items-end gap-2">
              {!isAdmin && (
                <Image
                  src={branding.logoPath}
                  alt="logo"
                  width={40}
                  height={40}
                  className="-ml-1"
                />
              )}
              <div className="flex items-center justify-start gap-2">
                {isAdmin && <SidebarTrigger className="md:hidden" />}
                <h2 className="line-clamp-1 text-2xl font-semibold">
                  Submissions ({submissions?.length ?? 0})
                </h2>
              </div>
            </div>
            {submissions && (
              <CsvButton
                data={submissions}
                headers={CSV_HEADERS}
                filename="submissions.csv"
                onUpload={onUploadSubmissions}
              />
            )}
          </div>
          <div className="max-h-[calc(100%-48px)] overflow-y-auto rounded-md border">
            <Table className="h-full">
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {submissions?.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={3}
                        className="h-24 text-center italic text-muted-foreground/50"
                      >
                        No submissions (yet!)
                      </td>
                    </TableRow>
                  ) : (
                    submissions?.map((submission, index) => (
                      <motion.tr
                        key={submission.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`cursor-pointer border-b transition-colors hover:bg-muted/50 ${
                          selectedId === submission.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedId(submission.id)}
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="font-medium">{submission.name}</div>
                          <div className="line-clamp-2 text-sm italic text-muted-foreground">
                            {submission.tagline}
                          </div>
                        </TableCell>
                        <TableCell className="flex flex-col items-end justify-end gap-1 text-right">
                          <div className="flex flex-row items-center justify-end gap-2">
                            {submission.flagged && (
                              <FlagIcon
                                className="h-[18px] w-[18px] fill-orange-500 text-orange-700"
                                strokeWidth={2.5}
                              />
                            )}
                            <StarRating rating={submission.rating ?? 0} />
                          </div>
                          <SubmissionStatusBadge status={submission.status} />
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-transparent pl-2" />
        <ResizablePanel minSize={30} className="pl-2">
          <div className="flex max-h-[calc(100%-48px)] w-full items-center justify-end gap-2 overflow-y-scroll pb-2">
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <HoverCard openDelay={100}>
                  <HoverCardTrigger asChild>
                    <Button asChild variant="secondary">
                      <Link href={initialEvent.url} className="gap-2">
                        <ExternalLink className="size-4" />
                        View event
                      </Link>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="flex w-auto max-w-lg flex-row items-center gap-2">
                    <Image
                      src={branding.logoPath}
                      alt="logo"
                      width={40}
                      height={40}
                      className="-ml-1"
                    />
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <div className="line-clamp-1 text-base font-bold leading-6">
                          {initialEvent.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <time>
                          {initialEvent.date.toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
              <Button asChild variant="secondary">
                <Link href={`/${initialEvent.id}/submit`} className="gap-2">
                  <ExternalLink className="size-4" />
                  View form
                </Link>
              </Button>
              <Button onClick={copyLink}>
                <ShareIcon className="size-4" />
                Share
              </Button>
            </div>
          </div>
          {selectedSubmission ? (
            <SubmissionDetails
              event={initialEvent}
              submission={selectedSubmission}
              isAdmin={isAdmin}
              onUpdate={refetch}
            />
          ) : (
            <div className="flex size-full items-start justify-center p-6">
              <p className="self-center italic text-muted-foreground/50">
                Select a submission to view details
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex flex-row gap-[1px]">
      {[1, 2, 3, 4, 5].map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "h-[20px] w-[20px] transition-all duration-300",
            index < rating
              ? "fill-yellow-300 text-yellow-500"
              : "text-muted-foreground/50",
          )}
          strokeWidth={2.25}
        />
      ))}
    </div>
  );
}
