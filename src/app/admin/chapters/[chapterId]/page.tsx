"use client";

import { ArrowLeft, TrendingUp, Users, Calendar, Award } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

import { AdminHeader } from "../../components/AdminHeader";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function ChapterStatsPage({
  params,
}: {
  params: { chapterId: string };
}) {
  const router = useRouter();
  const { data: stats, isLoading } = api.chapter.getStats.useQuery(
    params.chapterId,
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto max-w-6xl p-8">
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading chapter statistics...
          </div>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto max-w-6xl p-8">
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Chapter not found</p>
            <Button onClick={() => router.push("/admin/chapters")}>
              Back to Chapters
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const { chapter, stats: metrics, topDemos, rankings } = stats;

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="container mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/chapters")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <span className="text-4xl">{chapter.emoji}</span>
                {chapter.name}
              </h1>
              {chapter.city && (
                <p className="text-muted-foreground">{chapter.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ranking Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Chapter Ranking</CardDescription>
              <CardTitle className="text-3xl">
                #{rankings.attendeeRank} of {rankings.totalChapters}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                By attendee engagement (last 30 days)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Event Activity</CardDescription>
              <CardTitle className="text-3xl">
                #{rankings.eventRank} of {rankings.totalChapters}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                By number of events (last 30 days)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 30-Day Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Events
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {metrics.last30Days.eventsLast30Days}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Attendees
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {metrics.last30Days.attendeesLast30Days}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Avg per Event
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {metrics.last30Days.avgAttendeesPerEvent}
                </div>
                <div className="text-xs text-muted-foreground">attendees</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {metrics.last30Days.votesLast30Days}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All-Time Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All-Time Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-5">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Events
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {metrics.allTime.totalEvents}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Attendees
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {metrics.allTime.totalAttendees}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Demos
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {metrics.allTime.totalDemos}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {metrics.allTime.totalVotes}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Feedback
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {metrics.allTime.totalFeedback}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Demos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Demos
            </CardTitle>
            <CardDescription>
              Best-rated demos from this chapter (minimum 1 rating)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topDemos.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No demos with ratings yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Demo</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-center">Avg Rating</TableHead>
                    <TableHead className="text-center">Feedback</TableHead>
                    <TableHead className="text-center">Votes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDemos.map((demo, index) => (
                    <TableRow key={demo.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{demo.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{demo.eventName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(demo.eventDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1">
                          <span className="font-bold text-yellow-800">
                            {demo.avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-yellow-600">/ 5</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {demo.feedbackCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {demo.voteCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

