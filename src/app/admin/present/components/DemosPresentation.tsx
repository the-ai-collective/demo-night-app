import { usePresentationContext } from "../contexts/PresentationContext";
import { type Feedback } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { feedbackScore } from "~/lib/feedback";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import AttendeeTypeBadge from "~/components/AttendeeTypeBadge";
import { LogoConfetti } from "~/components/Confetti";
import LoadingScreen from "~/components/loading/LoadingScreen";

import { env } from "~/env";

const REFRESH_INTERVAL =
  env.NEXT_PUBLIC_NODE_ENV === "development" ? 1_000 : 5_000;

export type FeedbackAndAttendee = Feedback & {
  attendee: { name: string | null; type: string | null };
};

export default function DemosPresentation() {
  const { currentEvent, event } = usePresentationContext();
  const { data: feedback } = api.demo.getFeedback.useQuery(
    currentEvent?.currentDemoId ?? "",
    {
      enabled: !!currentEvent?.currentDemoId,
      refetchInterval: REFRESH_INTERVAL,
    },
  );
  // const { feedback, refetch: refetchFeedback } = useMockFeedback();

  const demo = event.demos.find(
    (demo) => demo.id === currentEvent.currentDemoId,
  );

  if (!demo) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex size-full min-h-[calc(100vh-80px)] flex-col gap-2 pt-20">
      <div className="-mb-3 flex flex-col items-center">
        {demo.url ? (
          <Link
            href={demo.url}
            target="_blank"
            className="group flex items-center gap-3 transition-all"
          >
            <h1 className="line-clamp-1 font-kallisto text-4xl font-bold tracking-tight group-hover:underline">
              {demo.name}
            </h1>
          </Link>
        ) : (
          <h1 className="line-clamp-1 font-kallisto text-4xl font-bold tracking-tight">
            {demo.name}
          </h1>
        )}
        {demo.description && (
          <p className="min-h-[40px] px-2 text-center text-lg font-semibold italic leading-6 text-gray-500">
            {demo.description}
          </p>
        )}
      </div>
      <ul className="z-10 flex max-h-screen flex-col gap-4 overflow-auto p-8">
        <AnimatePresence>
          {feedback
            ?.sort((a, b) => feedbackScore(b) - feedbackScore(a))
            .map((feedback) => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))}
        </AnimatePresence>
      </ul>
      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </div>
  );
}

export function FeedbackItem({ feedback }: { feedback: FeedbackAndAttendee }) {
  const summaryString = useMemo(() => {
    const summary: string[] = [];
    // if (feedback.rating) {
    //   summary.push(String.fromCodePoint(48 + feedback.rating, 65039, 8419));
    // }
    if (feedback.claps) {
      summary.push(`👏<span class="text-xs"> x${feedback.claps}</span>`);
    }
    // if (feedback.tellMeMore) {
    //   summary.push("📬");
    // }
    // for (const [id, action] of Object.entries(QuickActions.actions)) {
    //   if (feedback.quickActions.includes(id)) {
    //     summary.push(action.icon);
    //   }
    // }
    return summary.join(" • ");
  }, [feedback]);

  // const name =
  //   feedback.attendee.name?.length ?? 0 > 0
  //     ? feedback.attendee.name
  //     : "Anonymous";
  const name = "Anonymous";

  return (
    <motion.li
      className="flex flex-1 flex-col gap-1 rounded-xl bg-gray-300/50 p-4 shadow-xl backdrop-blur"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-row items-center gap-1">
        <p
          className={cn(
            "font-semibold",
            name === "Anonymous" ? "italic text-gray-400" : "text-black",
          )}
        >
          {name}
        </p>
        <AttendeeTypeBadge type={feedback.attendee.type} />
        <p
          className="font-semibold text-gray-400"
          dangerouslySetInnerHTML={{
            __html: `${summaryString ? `• ${summaryString}` : ""}`,
          }}
        />
      </div>
      {feedback.comment && (
        <p className="font-medium italic">{`"${feedback.comment}"`}</p>
      )}
    </motion.li>
  );
}
