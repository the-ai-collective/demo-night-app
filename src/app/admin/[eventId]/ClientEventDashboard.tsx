"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import { useEffect } from "react";

import { type CurrentEvent } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";
import { eventConfigSchema } from "~/lib/types/eventConfig";

import { AdminSidebar, AdminTab } from "./components/AdminSidebar";
import AnalyticsTab from "./components/Analytics/AnalyticsTab";
import AttendeesTab from "./components/Attendees/AttendeesTab";
import { AwardsTab } from "./components/Awards/AwardsTab";
import { ConfigurationTab } from "./components/Configuration/ConfigurationTab";
import ControlCenterTab from "./components/ControlCenter/ControlCenterTab";
import { DemosTab } from "./components/Demos/DemosTab";
import EventFeedbackTab from "./components/EventFeedback/EventFeedbackTab";
import SubmissionsTab from "./components/Submissions/SubmissionsTab";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

import { type AdminEvent, DashboardContext } from "./contexts/DashboardContext";
import { useEventAdmin } from "./hooks/useEventAdmin";

export function ClientEventDashboard({
  event: initialEvent,
  currentEvent: initialCurrentEvent,
}: {
  event: AdminEvent;
  currentEvent: CurrentEvent | null;
}) {
  const { event, currentEvent, refetch } = useEventAdmin({
    initialEvent,
    initialCurrentEvent,
  });
  const [config, setConfig] = useState<EventConfig>(
    eventConfigSchema.parse(event?.config),
  );
  const [selectedTab, setSelectedTab] = useQueryState<AdminTab>("tab", {
    defaultValue: AdminTab.DemosAndFeedback,
    parse: (value) => value as AdminTab,
    serialize: (value) => value,
  });

  useEffect(() => {
    if (event) {
      setConfig(eventConfigSchema.parse(event.config));
    }
  }, [event]);

  function dashboard() {
    switch (selectedTab) {
      case AdminTab.Submissions:
        return <SubmissionsTab />;
      case AdminTab.Demos:
        return <DemosTab />;
      case AdminTab.Awards:
        return <AwardsTab />;
      case AdminTab.Configuration:
        return <ConfigurationTab />;
      case AdminTab.DemosAndFeedback:
      case AdminTab.AwardsAndVoting:
        return (
          <ControlCenterTab
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        );
      case AdminTab.Attendees:
        return <AttendeesTab />;
      case AdminTab.EventFeedback:
        return <EventFeedbackTab />;
      case AdminTab.Analytics:
        return <AnalyticsTab />;
    }
  }

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContext.Provider
      value={{
        event: event,
        currentEvent: currentEvent,
        refetchEvent: refetch,
        config,
      }}
    >
      <SidebarProvider defaultOpen>
        <div className="flex h-screen w-full">
          <AdminSidebar
            event={event}
            config={config}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <SidebarInset className="flex-1 p-4">{dashboard()}</SidebarInset>
        </div>
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
