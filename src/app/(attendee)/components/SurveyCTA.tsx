"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "~/lib/utils";

export function SurveyCTA({
  surveyUrl,
  onSurveyClick,
  className,
}: {
  surveyUrl: string;
  onSurveyClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href={surveyUrl}
      target="_blank"
      onClick={onSurveyClick}
      className={cn(
        "group flex w-full items-center justify-between gap-4 rounded-lg bg-purple-300/50 p-4 shadow-xl backdrop-blur transition-all duration-200 hover:scale-[1.02] hover:bg-purple-300/60",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold leading-5 group-hover:underline">
          Help us improve! 🙌
        </h3>
        <p className="font-medium leading-5 text-gray-700">
          Share your feedback in a quick survey
        </p>
      </div>
      <ArrowUpRight
        className="h-5 w-5 flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </Link>
  );
}
