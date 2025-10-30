"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { type QuickAction } from "~/lib/types/quickAction";
import { cn } from "~/lib/utils";
import { type DemoFeedback } from "~/server/api/routers/demo";

import AttendeeTypeBadge from "~/components/AttendeeTypeBadge";

export function FeedbackItem({
  feedback,
  quickActions,
}: {
  feedback: DemoFeedback;
  quickActions: QuickAction[];
}) {
  const summary = [
    feedback.claps
      ? `👏<span class="text-xs"> x${feedback.claps}</span>`
      : null,
    feedback.tellMeMore ? "📬" : null,
    ...(feedback.quickActions?.map(
      (id) => quickActions.find((a) => a.id === id)?.icon ?? "❓",
    ) ?? []),
  ].filter((s) => s) as string[];
  const summaryString = summary.join(" • ");
  const copyEmailToClipboard = () => {
    if (!feedback.attendee?.email) return;
    navigator.clipboard.writeText(feedback.attendee.email);
    toast.success("Email copied to clipboard!");
  };
  return (
    <div
      className={cn(
        "group z-10 flex w-full flex-col gap-1 rounded-lg bg-gray-300/50 p-4 font-medium leading-6 shadow-xl backdrop-blur",
        feedback.attendee?.email && "cursor-pointer",
      )}
      onClick={copyEmailToClipboard}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            className={cn(
              "group/inner flex items-center gap-2",
              !feedback.attendee?.linkedin && "pointer-events-none",
            )}
            href={feedback.attendee?.linkedin ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3
              className={cn(
                "line-clamp-1 text-xl font-bold group-hover/inner:underline",
                !feedback.attendee?.name && "italic text-gray-500",
              )}
            >
              {feedback.attendee?.name ?? "Anonymous"}
            </h3>
            {feedback.attendee?.linkedin && (
              <ArrowUpRight
                size={24}
                strokeWidth={3}
                className="h-5 w-5 flex-none rounded-md bg-gray-300/50 p-[2px] text-gray-500 group-hover/inner:bg-gray-400/50 group-hover/inner:text-gray-700"
              />
            )}
          </Link>
          {feedback.attendee?.type && (
            <AttendeeTypeBadge type={feedback.attendee.type} />
          )}
        </div>
        <p
          className="pl-2 font-semibold text-gray-500"
          dangerouslySetInnerHTML={{ __html: summaryString }}
        />
      </div>
      {feedback.attendee?.email && (
        <p className="font-semibold text-gray-700 group-hover:underline">
          📬 {feedback.attendee.email}
        </p>
      )}
      {feedback.comment && (
        <p className="italic text-gray-700">{`"${feedback.comment}"`}</p>
      )}
    </div>
  );
}
