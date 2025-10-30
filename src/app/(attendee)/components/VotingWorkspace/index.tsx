import { useWorkspaceContext } from "../../contexts/WorkspaceContext";
import {
  type FeedbackByDemoId,
  useFeedback,
} from "../DemosWorkspace/hooks/useFeedback";
import { SurveyCTA } from "../SurveyCTA";
import { type Award } from "@prisma/client";

import { type EventConfig } from "~/lib/types/eventConfig";
import { type PublicDemo } from "~/server/api/routers/event";
import { api } from "~/trpc/react";

import AwardVoteSelect from "./AwardVoteSelect";
import InvestmentAmountSelect from "./InvestmentAmountSelect";
import { type VoteByAwardId, useVotes } from "./hooks/useVotes";

export default function VotingWorkspace() {
  const { currentEvent, event, attendee } = useWorkspaceContext();
  const { feedbackByDemoId } = useFeedback(
    currentEvent.id,
    attendee,
    event.demos[0]!,
  );
  const { votes, setVote } = useVotes(currentEvent.id, attendee);
  const config = event.config as EventConfig;
  const isPitchNight = config?.isPitchNight ?? false;
  const surveyUrl = config?.surveyUrl;

  const votableAwards = event.awards.filter((award) => award.votable);

  const markSurveyOpenedMutation =
    api.eventFeedback.markSurveyOpened.useMutation();

  const handleSurveyClick = () => {
    markSurveyOpenedMutation.mutate({
      eventId: currentEvent.id,
      attendeeId: attendee.id,
    });
  };

  return (
    <div className="absolute bottom-0 max-h-[calc(100dvh-120px)] w-full max-w-xl">
      <div className="flex size-full flex-col items-center justify-center gap-4 p-4">
        <div>
          <h1 className="text-center font-kallisto text-4xl font-bold tracking-tight">
            {isPitchNight ? "Investing Time! 💰" : "Voting Time! 🗳️"}
          </h1>
          <p className="text-md max-w-[330px] pt-2 text-center font-medium leading-5 text-gray-500">
            {isPitchNight
              ? "You have $100k to invest across the companies that pitched tonight. Allocate your funds to your favorites!"
              : "Who gets immortalized in the Demo Night Hall of Fame? You decide! Note that you can only vote for each demoist once so choose wisely!"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-8">
          {isPitchNight
            ? // Pitch Night: Show investment interface for the crowd favorite award
              votableAwards.map((award) => (
                <InvestmentAmountSelect
                  key={award.id}
                  award={award}
                  demos={event.demos}
                  eventId={currentEvent.id}
                  attendeeId={attendee.id}
                />
              ))
            : // Demo Night: Show traditional voting interface
              votableAwards.map((award) => (
                <AwardVoteItem
                  key={award.id}
                  award={award}
                  demos={event.demos}
                  votes={votes}
                  setVote={setVote}
                  feedbackByDemoId={feedbackByDemoId}
                />
              ))}
        </div>
        {surveyUrl && (
          <SurveyCTA
            surveyUrl={surveyUrl}
            onSurveyClick={handleSurveyClick}
            className="z-10"
          />
        )}
      </div>
    </div>
  );
}

function AwardVoteItem({
  award,
  demos,
  votes,
  setVote,
  feedbackByDemoId,
}: {
  award: Award;
  demos: PublicDemo[];
  votes: VoteByAwardId;
  setVote: (awardId: string, demoId: string | null) => void;
  feedbackByDemoId: FeedbackByDemoId;
}) {
  return (
    <div className="flex flex-col font-medium">
      <h2 className="text-2xl font-bold">{award.name}</h2>
      <p className="text-md pb-2 pl-[2px] text-lg font-semibold italic leading-6 text-gray-500">
        {award.description}
      </p>
      <AwardVoteSelect
        award={award}
        demos={demos}
        votes={votes}
        onSelect={setVote}
        feedbackByDemoId={feedbackByDemoId}
      />
    </div>
  );
}
