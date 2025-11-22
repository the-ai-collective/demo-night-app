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
                <SidebarMenuButton className="h-14">
                  <div className="flex items-center gap-2">
                    <Image
                      src={branding.logoPath}
                      alt="logo"
                      width={40}
                      height={40}
                      className="-ml-1"
                    />
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        {event.chapters?.map((chapter) => (
                          <span key={chapter.id} title={chapter.name}>
                            {chapter.emoji}
                          </span>
                        ))}
                        <div className="line-clamp-1 text-base font-bold leading-6">
                          {event.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <time>
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
                  <ChevronsUpDown className="ml-auto" />
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
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 line-clamp-1 font-bold leading-6">
                          {e.chapters?.map((chapter) => (
                            <span key={chapter.id}>{chapter.emoji}</span>
                          ))}
                          <span>{e.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
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

      <div className="flex flex-col gap-2 px-4 py-2">
        <Button
          onClick={() => window.open(event.url, "_blank")}
          variant="outline"
          className="w-full"
        >
          <ExternalLink className="size-4" />
          View event
        </Button>
        <Button
          onClick={async () => {
            await updateCurrentMutation.mutateAsync(
              currentEvent?.id === event.id ? null : event.id ?? null,
            );
            void refetchEvent();
          }}
          variant={currentEvent?.id === event.id ? "destructive" : "default"}
          className="w-full"
        >
          {currentEvent?.id === event.id ? (
            <OctagonPause className="size-4" />
          ) : (
            <CirclePlay className="size-4" />
          )}
          {currentEvent?.id === event.id
            ? "Stop live event"
            : "Start live event"}
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
                          ? "bg-accent"
                          : ""
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
                          ? "bg-accent"
                          : ""
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