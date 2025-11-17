"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface MatchViewProps {
  match: any;
  onUpdate: () => void;
}

export function MatchView({ match, onUpdate }: MatchViewProps) {
  const [showResults, setShowResults] = useState(false);

  const startMatch = api.match.start.useMutation({
    onSuccess: onUpdate,
  });

  const closeVoting = api.match.closeVoting.useMutation({
    onSuccess: () => {
      onUpdate();
      setShowResults(true);
    },
  });

  const deleteMatch = api.match.delete.useMutation({
    onSuccess: onUpdate,
  });

  const { data: results } = api.match.getResults.useQuery(
    { matchId: match.id },
    { enabled: showResults || !match.isActive },
  );

  const { data: votes } = api.vote.getMatchVotes.useQuery(
    { matchId: match.id },
    { enabled: match.isActive, refetchInterval: 2000 },
  );

  const votesA = votes?.filter((v) => v.demoId === match.startupAId) ?? [];
  const votesB = votes?.filter((v) => v.demoId === match.startupBId) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {match.roundType ?? "Match"} - {match.isActive ? "🔴 LIVE" : ""}
            {match.winnerId ? "✓ Complete" : ""}
          </CardTitle>
          <div className="space-x-2">
            {!match.isActive && !match.winnerId && (
              <Button
                onClick={() => startMatch.mutate({ matchId: match.id })}
                variant="default"
              >
                Start Match
              </Button>
            )}
            {match.isActive && (
              <Button
                onClick={() => closeVoting.mutate({ matchId: match.id })}
                variant="destructive"
              >
                Close Voting
              </Button>
            )}
            {!match.isActive && (
              <Button
                onClick={() => deleteMatch.mutate({ matchId: match.id })}
                variant="outline"
                size="sm"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          {/* Startup A */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{match.startupA.name}</h3>
            {match.isActive && (
              <div className="text-2xl font-bold">
                {votesA.length} votes
                <div className="text-sm text-gray-500">
                  Audience: {votesA.filter((v) => v.voteType === "audience").length} |
                  Judges: {votesA.filter((v) => v.voteType === "judge").length}
                </div>
              </div>
            )}
            {results && (
              <div className="space-y-1">
                <div className="text-sm">
                  Total Votes: {results.votesA.total}
                </div>
                <div className="text-sm text-gray-500">
                  Audience: {results.votesA.audience} | Judges:{" "}
                  {results.votesA.judge}
                </div>
                <div className="text-2xl font-bold">
                  Score: {(results.finalScoreA * 100).toFixed(1)}%
                </div>
                {results.winnerId === match.startupAId && (
                  <div className="text-lg font-bold text-green-600">🏆 WINNER</div>
                )}
              </div>
            )}
          </div>

          {/* Startup B */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{match.startupB.name}</h3>
            {match.isActive && (
              <div className="text-2xl font-bold">
                {votesB.length} votes
                <div className="text-sm text-gray-500">
                  Audience: {votesB.filter((v) => v.voteType === "audience").length} |
                  Judges: {votesB.filter((v) => v.voteType === "judge").length}
                </div>
              </div>
            )}
            {results && (
              <div className="space-y-1">
                <div className="text-sm">
                  Total Votes: {results.votesB.total}
                </div>
                <div className="text-sm text-gray-500">
                  Audience: {results.votesB.audience} | Judges:{" "}
                  {results.votesB.judge}
                </div>
                <div className="text-2xl font-bold">
                  Score: {(results.finalScoreB * 100).toFixed(1)}%
                </div>
                {results.winnerId === match.startupBId && (
                  <div className="text-lg font-bold text-green-600">🏆 WINNER</div>
                )}
              </div>
            )}
          </div>
        </div>

        {match.isActive && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Live voting in progress... Refreshing every 2 seconds
          </div>
        )}
      </CardContent>
    </Card>
  );
}
