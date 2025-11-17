"use client";

import { useState, useEffect } from "react";
import { type Attendee } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface MatchVotingProps {
  eventId: string;
  attendee: Attendee;
  isJudge?: boolean;
}

export function MatchVoting({
  eventId,
  attendee,
  isJudge = false,
}: MatchVotingProps) {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const { data: matches, refetch } = api.match.all.useQuery(
    { eventId },
    { refetchInterval: 3000 },
  );

  const { data: myVotes } = api.vote.all.useQuery(
    {
      eventId,
      attendeeId: attendee.id,
    },
    { refetchInterval: 2000 },
  );

  const upsertVote = api.vote.upsert.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const activeMatch = matches?.find((m) => m.isActive);

  useEffect(() => {
    if (!activeMatch) {
      setSelectedDemo(null);
      return;
    }

    // Check if user already voted in this match
    const existingVote = myVotes?.find((v) => v.matchId === activeMatch.id);
    if (existingVote) {
      setSelectedDemo(existingVote.demoId);
    }
  }, [activeMatch, myVotes]);

  if (!activeMatch) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-gray-500">
            No active match at the moment. Please wait for the next round!
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleVote = (demoId: string) => {
    if (!activeMatch) return;

    setSelectedDemo(demoId);

    // For match voting, we need to use a default award or create one
    // In this minimal implementation, we'll use the first available award
    // or you could create a special "Match Vote" award
    upsertVote.mutate({
      eventId,
      attendeeId: attendee.id,
      awardId: "match-vote", // You may need to adjust this based on your award setup
      demoId,
      matchId: activeMatch.id,
      voteType: isJudge ? "judge" : "audience",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              🔴 LIVE MATCH: {activeMatch.roundType ?? "Current Match"}
            </span>
            {isJudge && (
              <span className="rounded-full bg-purple-600 px-3 py-1 text-sm text-white">
                Judge
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-sm text-gray-600">
            Vote for your favorite startup in this head-to-head match!
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Startup A */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedDemo === activeMatch.startupAId
                  ? "ring-4 ring-blue-500"
                  : "hover:shadow-lg"
              }`}
              onClick={() => handleVote(activeMatch.startupAId)}
            >
              <CardHeader>
                <CardTitle className="text-center">
                  {activeMatch.startupA.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeMatch.startupA.description && (
                  <p className="text-sm text-gray-600">
                    {activeMatch.startupA.description}
                  </p>
                )}
                <Button
                  className="mt-4 w-full"
                  variant={
                    selectedDemo === activeMatch.startupAId
                      ? "default"
                      : "outline"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(activeMatch.startupAId);
                  }}
                >
                  {selectedDemo === activeMatch.startupAId
                    ? "✓ Voted"
                    : "Vote"}
                </Button>
              </CardContent>
            </Card>

            {/* Startup B */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedDemo === activeMatch.startupBId
                  ? "ring-4 ring-blue-500"
                  : "hover:shadow-lg"
              }`}
              onClick={() => handleVote(activeMatch.startupBId)}
            >
              <CardHeader>
                <CardTitle className="text-center">
                  {activeMatch.startupB.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeMatch.startupB.description && (
                  <p className="text-sm text-gray-600">
                    {activeMatch.startupB.description}
                  </p>
                )}
                <Button
                  className="mt-4 w-full"
                  variant={
                    selectedDemo === activeMatch.startupBId
                      ? "default"
                      : "outline"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(activeMatch.startupBId);
                  }}
                >
                  {selectedDemo === activeMatch.startupBId
                    ? "✓ Voted"
                    : "Vote"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {selectedDemo && (
            <p className="mt-4 text-center text-sm text-green-600">
              Your vote has been recorded!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
