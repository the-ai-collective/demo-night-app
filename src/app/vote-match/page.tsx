"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Test page for match voting
// Visit: http://localhost:3000/vote-match
export default function VoteMatchPage() {
  const eventId = "sf-demo";

  // Simple user selection (no auth required for testing)
  const [userEmail, setUserEmail] = useState("test@example.com");
  const [attendeeId, setAttendeeId] = useState("cmho8f90f0000wjmtkh8fz04t"); // test user ID
  const [isJudge, setIsJudge] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Get active matches
  const { data: matches, refetch: refetchMatches } = api.match.all.useQuery(
    { eventId },
    { refetchInterval: 3000 } // Refresh every 3 seconds
  );

  const activeMatch = matches?.find((m) => m.isActive);

  // Get votes for the active match
  const { data: matchVotes } = api.vote.getMatchVotes.useQuery(
    { matchId: activeMatch?.id ?? "" },
    {
      enabled: !!activeMatch,
      refetchInterval: 2000
    }
  );

  // Vote mutation
  const upsertVote = api.vote.upsert.useMutation({
    onSuccess: () => {
      refetchMatches();
    },
  });

  const handleUserSwitch = (email: string) => {
    setUserEmail(email);
    if (email === "judge@example.com") {
      setAttendeeId("cmi382a1900019n7p1rkv6jkf"); // judge user ID
      setIsJudge(true);
    } else {
      setAttendeeId("cmho8f90f0000wjmtkh8fz04t"); // test user ID
      setIsJudge(false);
    }
    setSelectedDemo(null);
  };

  const handleVote = (demoId: string) => {
    if (!activeMatch || !attendeeId) return;

    setSelectedDemo(demoId);

    // Use the match-vote-award we created
    upsertVote.mutate({
      eventId,
      attendeeId: attendeeId,
      awardId: "match-vote-award",
      demoId,
      matchId: activeMatch.id,
      voteType: isJudge ? "judge" : "audience",
    });
  };

  // Calculate vote counts
  const votesA = matchVotes?.filter((v) => v.demoId === activeMatch?.startupAId) ?? [];
  const votesB = matchVotes?.filter((v) => v.demoId === activeMatch?.startupBId) ?? [];

  const audienceVotesA = votesA.filter((v) => v.voteType === "audience").length;
  const audienceVotesB = votesB.filter((v) => v.voteType === "audience").length;
  const judgeVotesA = votesA.filter((v) => v.voteType === "judge").length;
  const judgeVotesB = votesB.filter((v) => v.voteType === "judge").length;

  if (!activeMatch) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No Active Match</h2>
            <p className="text-lg text-gray-500">
              Waiting for the next match to start...
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Check back soon or ask the admin to start a match!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔴 LIVE Match Voting</h1>

        {/* User Switcher for Testing */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={userEmail === "test@example.com" ? "default" : "outline"}
            onClick={() => handleUserSwitch("test@example.com")}
          >
            Vote as Regular User
          </Button>
          <Button
            variant={userEmail === "judge@example.com" ? "default" : "outline"}
            onClick={() => handleUserSwitch("judge@example.com")}
          >
            Vote as Judge
          </Button>
        </div>

        <p className="text-gray-600">
          Voting as: <span className="font-semibold">{userEmail}</span>
          {isJudge && (
            <span className="ml-2 rounded-full bg-purple-600 px-3 py-1 text-sm text-white">
              Judge
            </span>
          )}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {activeMatch.roundType ?? "Current Match"} • Vote for your favorite!
        </p>
      </div>

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
            <CardTitle className="text-center text-2xl">
              {activeMatch.startupA.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMatch.startupA.description && (
              <p className="mb-4 text-gray-600">
                {activeMatch.startupA.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="text-3xl font-bold text-center">
                {votesA.length} votes
              </div>
              <div className="text-sm text-gray-500 text-center">
                Audience: {audienceVotesA} • Judges: {judgeVotesA}
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              size="lg"
              variant={
                selectedDemo === activeMatch.startupAId ? "default" : "outline"
              }
              onClick={(e) => {
                e.stopPropagation();
                handleVote(activeMatch.startupAId);
              }}
            >
              {selectedDemo === activeMatch.startupAId ? "✓ Voted" : "Vote"}
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
            <CardTitle className="text-center text-2xl">
              {activeMatch.startupB.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMatch.startupB.description && (
              <p className="mb-4 text-gray-600">
                {activeMatch.startupB.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="text-3xl font-bold text-center">
                {votesB.length} votes
              </div>
              <div className="text-sm text-gray-500 text-center">
                Audience: {audienceVotesB} • Judges: {judgeVotesB}
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              size="lg"
              variant={
                selectedDemo === activeMatch.startupBId ? "default" : "outline"
              }
              onClick={(e) => {
                e.stopPropagation();
                handleVote(activeMatch.startupBId);
              }}
            >
              {selectedDemo === activeMatch.startupBId ? "✓ Voted" : "Vote"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedDemo && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-green-600">
            ✓ Your vote has been recorded!
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Live vote counts update every 2 seconds
          </p>
        </div>
      )}
    </div>
  );
}
