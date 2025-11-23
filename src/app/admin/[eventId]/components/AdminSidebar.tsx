"use client";

import { type AdminEvent } from "../contexts/DashboardContext";
import {
  CalendarIcon,
  ChevronDown,
  ChevronsUpDown,
  CirclePlay,
  ClipboardListIcon,
  ExternalLink,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  OctagonPause,
  PresentationIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { EventPhase } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";
import { api } from "~/trpc/react";
import { getBrandingClient } from "~/lib/branding";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";

import { LiveIndicator } from "./LiveIndicator";

export enum AdminTab {
  Submissions = "submissions",
  Demos = "demos",
  Awards = "awards",
  Configuration = "configuration",
  DemosAndFeedback = "demos-and-feedback",
  AwardsAndVoting = "awards-and-voting",
  Attendees = "attendees",
  EventFeedback = "event-feedback",
}

interface AdminSidebarProps {
  event: AdminEvent;
  config: EventConfig;
  selectedTab: AdminTab;
  setSelectedTab: (tab: AdminTab) => void;
}

export function AdminSidebar({
  event,
  config,
  selectedTab,
  setSelectedTab,
}: AdminSidebarProps) {
  const branding = getBrandingClient(config?.isPitchNight);
  const router = useRouter();
  const { data: events } = api.event.allAdmin.useQuery();
  const { data: currentEvent, refetch: refetchEvent } =
    api.event.getCurrent.useQuery();
  const currentPhase =
    currentEvent?.id === event.id ? currentEvent.phase : null;
  const updateCurrentMutation = api.event.updateCurrent.useMutation();

  const { data: submissionCount } = api.submission.count.useQuery({
    eventId: event.id,
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto p-0 hover:bg-transparent">
                  <div className="group relative w-full overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-background via-background to-accent/5 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
                    {/* Decorative corner accent */}
                    <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative flex items-start gap-3">
                      <div className="relative mt-0.5">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                        <Image
                          src={branding.logoPath}
                          alt="logo"
                          width={44}
                          height={44}
                          className="relative rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-foreground transition-colors">
                            {event.name}
                          </h2>
                          <ChevronsUpDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {event.chapter && (
                            <div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1 shadow-sm transition-all duration-200 hover:shadow dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-teal-950/40">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
                                {event.chapter.emoji} {event.chapter.name}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <time className="font-medium">
                              {event.date.toLocaleDateString("en-US", {
                                timeZone: "UTC",
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ChevronDown className="rotate-90" />
                    <span>Back to Admin Dashboard</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {events?.map((e) => (
                    <DropdownMenuItem
                      key={e.id}
                      onClick={() => router.push(`/admin/${e.id}`)}
                    >
                      <div className="flex flex-col items-start gap-1 py-1">
                        <div className="line-clamp-1 font-semibold leading-tight">
                          {e.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <time>
                            {e.date.toLocaleDateString("en-US", {
                              timeZone: "UTC",
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="flex flex-col gap-2 px-4 py-3">
        <Button
          onClick={() => window.open(event.url, "_blank")}
          variant="outline"
          className="group w-full border-border/60 bg-background/50 shadow-sm transition-all duration-200 hover:bg-accent/50 hover:shadow hover:border-border"
        >
          <ExternalLink className="size-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="font-medium">View event</span>
        </Button>
        <Button
          onClick={async () => {
            await updateCurrentMutation.mutateAsync(
              currentEvent?.id === event.id ? null : event.id ?? null,
            );
            void refetchEvent();
          }}
          variant={currentEvent?.id === event.id ? "destructive" : "default"}
          className="group w-full shadow-sm transition-all duration-200 hover:shadow"
        >
          {currentEvent?.id === event.id ? (
            <OctagonPause className="size-4 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <CirclePlay className="size-4 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span className="font-medium">
            {currentEvent?.id === event.id
              ? "Stop live event"
              : "Start live event"}
          </span>
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Setup</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setSelectedTab(AdminTab.Submissions);
                  }}
                  className={
                    selectedTab === AdminTab.Submissions ? "bg-accent" : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <ClipboardListIcon className="h-4 w-4" />
                    <span>Submissions</span>
                  </div>
                </SidebarMenuButton>
                {submissionCount !== undefined ? (
                  <SidebarMenuBadge>{submissionCount}</SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedTab(AdminTab.Demos)}
                  className={selectedTab === AdminTab.Demos ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2">
                    <PresentationIcon className="h-4 w-4" />
                    <span>Demos</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuBadge>{event.demos.length}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedTab(AdminTab.Awards)}
                  className={selectedTab === AdminTab.Awards ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-4 w-4" />
                    <span>Awards</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuBadge>{event.awards.length}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedTab(AdminTab.Configuration)}
                  className={
                    selectedTab === AdminTab.Configuration ? "bg-accent" : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Configuration</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {config.quickActions.length}
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() =>
                    setSelectedTab(
                      selectedTab === AdminTab.DemosAndFeedback
                        ? AdminTab.AwardsAndVoting
                        : AdminTab.DemosAndFeedback,
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboardIcon className="h-4 w-4" />
                    <span>Control Center</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => setSelectedTab(AdminTab.DemosAndFeedback)}
                      className={
                        selectedTab === AdminTab.DemosAndFeedback
                          ? "bg-accent cursor-pointer"
                          : "cursor-pointer"
                      }
                    >
                      <div className="flex items-center gap-2">
                        <PresentationIcon className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">
                          {branding.isPitchNight ? "Pitches & Feedback" : "Demos & Feedback"}
                        </span>
                        {currentPhase === EventPhase.Demos && <LiveIndicator />}
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => setSelectedTab(AdminTab.AwardsAndVoting)}
                      className={
                        selectedTab === AdminTab.AwardsAndVoting
                          ? "bg-accent cursor-pointer"
                          : "cursor-pointer"
                      }
                    >
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">
                          {branding.isPitchNight ? "Awards & Investing" : "Awards & Voting"}
                        </span>
                        {currentPhase === EventPhase.Voting ||
                        currentPhase === EventPhase.Results ? (
                          <LiveIndicator />
                        ) : null}
                      </div>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedTab(AdminTab.Attendees)}
                  className={
                    selectedTab === AdminTab.Attendees ? "bg-accent" : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Attendees</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuBadge>{event.attendees.length}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedTab(AdminTab.EventFeedback)}
                  className={
                    selectedTab === AdminTab.EventFeedback ? "bg-accent" : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <MessageSquareTextIcon className="h-4 w-4" />
                    <span>Event Feedback</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {event.eventFeedback.length}
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
