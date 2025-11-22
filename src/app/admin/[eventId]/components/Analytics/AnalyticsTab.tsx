"use client";

import {
  BarChart3,
  ClapperboardIcon,
  Mail,
  MailCheck,
  MessageSquare,
  Send,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useDashboardContext } from "../../contexts/DashboardContext";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

export default function AnalyticsTab() {
  const { event } = useDashboardContext();
  const [selectedDemoIds, setSelectedDemoIds] = useState<string[]>([]);
  const [sendingDigest, setSendingDigest] = useState(false);

  const { data: analytics, isLoading } = api.event.getAnalytics.useQuery(
    event?.id ?? "",
    { enabled: !!event?.id },
  );

  const sendDigestMutation = api.event.sendDigestEmails.useMutation();
  const utils = api.useUtils();

  const handleSendDigest = async (demoIds?: string[]) => {
    if (!event?.id) return;
    setSendingDigest(true);
    try {
      const result = await sendDigestMutation.mutateAsync({
        eventId: event.id,
        demoIds: demoIds?.length ? demoIds : undefined,
      });

      if (result.totalSent > 0) {
        toast.success(
          `Sent ${result.totalSent} digest email${result.totalSent > 1 ? "s" : ""}`,
        );
      }
      if (result.totalFailed > 0) {
        toast.error(`Failed to send ${result.totalFailed} email(s)`);
      }

      // Refresh analytics to update digestSentAt timestamps
      await utils.event.getAnalytics.invalidate(event.id);
      setSelectedDemoIds([]);
    } catch {
      toast.error("Failed to send digest emails");
    } finally {
      setSendingDigest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No analytics data available</div>
      </div>
    );
  }

  const demosWithEmail = analytics.demoAnalytics.filter((d) => d.email);
  const demosNotSent = demosWithEmail.filter((d) => !d.digestSentAt);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Post-Event Analytics</h2>
            <p className="text-muted-foreground">
              Event performance overview and feedback summaries
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Attendees"
            value={analytics.overview.totalAttendees}
            icon={Users}
          />
          <StatCard
            title="Total Feedback"
            value={analytics.overview.totalFeedback}
            icon={MessageSquare}
          />
          <StatCard
            title="Engagement Rate"
            value={`${analytics.overview.engagementRate}%`}
            icon={TrendingUp}
          />
          <StatCard
            title="Average Rating"
            value={
              analytics.overview.averageRating?.toFixed(1) ?? "N/A"
            }
            icon={Star}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Claps"
            value={analytics.overview.totalClaps}
            icon={ClapperboardIcon}
          />
          <StatCard
            title="Tell Me More"
            value={analytics.overview.totalTellMeMore}
            icon={Mail}
          />
          <StatCard
            title="Quick Actions"
            value={Object.values(analytics.quickActionBreakdown).reduce(
              (a, b) => a + b,
              0,
            )}
            icon={BarChart3}
          />
        </div>

        {/* Quick Action Breakdown */}
        {Object.keys(analytics.quickActionBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Action Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.quickActionBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([action, count]) => (
                    <div
                      key={action}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium">{action}</span>
                      <span className="text-muted-foreground">
                        {count} attendee{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Awards */}
        {analytics.awards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Award Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.awards.map((award) => (
                  <div
                    key={award.id}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{award.name}</span>
                    <span className="text-muted-foreground">
                      {award.winnerName ?? "No winner yet"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Demos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Demo Rankings
            </CardTitle>
            <CardDescription>
              Demos ranked by average rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.rankedDemos.map((demo, index) => (
                <div
                  key={demo.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium">{demo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {demo.stats.feedbackCount} feedback •{" "}
                        {demo.stats.totalClaps} claps •{" "}
                        {demo.stats.tellMeMoreCount} interested
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {demo.stats.averageRating?.toFixed(1) ?? "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Digest Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Feedback Digest to Demoists
            </CardTitle>
            <CardDescription>
              Send post-event feedback summaries to demo presenters via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demosWithEmail.length === 0 ? (
              <p className="text-muted-foreground">
                No demos have email addresses configured.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleSendDigest()}
                    disabled={sendingDigest || demosNotSent.length === 0}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send to All ({demosNotSent.length} pending)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSendDigest(selectedDemoIds)}
                    disabled={sendingDigest || selectedDemoIds.length === 0}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to Selected ({selectedDemoIds.length})
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  {analytics.demoAnalytics.map((demo) => (
                    <div
                      key={demo.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedDemoIds.includes(demo.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDemoIds([...selectedDemoIds, demo.id]);
                            } else {
                              setSelectedDemoIds(
                                selectedDemoIds.filter((id) => id !== demo.id),
                              );
                            }
                          }}
                          disabled={!demo.email}
                        />
                        <div>
                          <div className="font-medium">{demo.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {demo.email ?? "No email"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {demo.digestSentAt ? (
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <MailCheck className="h-4 w-4" />
                            Sent{" "}
                            {new Date(demo.digestSentAt).toLocaleDateString()}
                          </span>
                        ) : demo.email ? (
                          <span className="text-sm text-muted-foreground">
                            Not sent
                          </span>
                        ) : (
                          <span className="text-sm text-red-500">
                            No email
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Demo Feedback Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Details by Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.demoAnalytics.map((demo) => (
                <div key={demo.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{demo.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {demo.stats.averageRating?.toFixed(1) ?? "N/A"}
                      </span>
                      <span>{demo.stats.feedbackCount} feedback</span>
                      <span>{demo.stats.totalClaps} claps</span>
                    </div>
                  </div>

                  {demo.comments.length > 0 && (
                    <div className="space-y-2 pl-4">
                      {demo.comments.slice(0, 3).map((comment, idx) => (
                        <div
                          key={idx}
                          className="rounded border-l-2 border-primary/30 bg-muted/50 p-2 text-sm"
                        >
                          <span className="italic">&ldquo;{comment.text}&rdquo;</span>
                          {comment.attendeeName && (
                            <span className="ml-2 text-muted-foreground">
                              — {comment.attendeeName}
                            </span>
                          )}
                        </div>
                      ))}
                      {demo.comments.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{demo.comments.length - 3} more comments
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
