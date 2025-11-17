"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { MatchView } from "./MatchView";

interface MatchModeTabProps {
  eventId: string;
}

export function MatchModeTab({ eventId }: MatchModeTabProps) {
  const [selectedDemoA, setSelectedDemoA] = useState<string>("");
  const [selectedDemoB, setSelectedDemoB] = useState<string>("");
  const [roundType, setRoundType] = useState<string>("Round 1");

  const { data: demos } = api.demo.all.useQuery({ eventId });
  const { data: matches, refetch: refetchMatches } = api.match.all.useQuery({
    eventId,
  });
  const createMatch = api.match.create.useMutation({
    onSuccess: () => {
      refetchMatches();
      setSelectedDemoA("");
      setSelectedDemoB("");
    },
  });

  const handleCreateMatch = () => {
    if (!selectedDemoA || !selectedDemoB) return;
    if (selectedDemoA === selectedDemoB) {
      alert("Please select different startups");
      return;
    }

    createMatch.mutate({
      eventId,
      startupAId: selectedDemoA,
      startupBId: selectedDemoB,
      roundType,
      votingWindow: 300, // 5 minutes default
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Startup A
              </label>
              <Select value={selectedDemoA} onValueChange={setSelectedDemoA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select startup A" />
                </SelectTrigger>
                <SelectContent>
                  {demos?.map((demo) => (
                    <SelectItem key={demo.id} value={demo.id}>
                      {demo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Startup B
              </label>
              <Select value={selectedDemoB} onValueChange={setSelectedDemoB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select startup B" />
                </SelectTrigger>
                <SelectContent>
                  {demos?.map((demo) => (
                    <SelectItem key={demo.id} value={demo.id}>
                      {demo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Round</label>
              <Select value={roundType} onValueChange={setRoundType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Round 1">Round 1</SelectItem>
                  <SelectItem value="Round 2">Round 2</SelectItem>
                  <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreateMatch}
            disabled={!selectedDemoA || !selectedDemoB}
            className="w-full"
          >
            Create Match
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Matches</h2>
        {matches?.map((match) => (
          <MatchView
            key={match.id}
            match={match}
            onUpdate={() => refetchMatches()}
          />
        ))}
      </div>
    </div>
  );
}
