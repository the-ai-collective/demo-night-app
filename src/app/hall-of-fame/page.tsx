import { type Metadata } from "next";

import { getBrandingClient } from "~/lib/branding";
import { getBranding } from "~/lib/branding.server";
import { api } from "~/trpc/server";

import EventDisplay from "./components/EventDisplay";
import HofHeader from "./components/HofHeader";
import { LinkButton } from "~/components/Button";
import { LogoConfetti } from "~/components/Confetti";
import Logos from "~/components/Logos";

import { env } from "~/env";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();

  return {
    title: `${branding.appName} Hall of Fame 🏆`,
    description: `Browse past ${branding.appName} events and winning demos from our community.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function HallOfFamePage() {
  const events = await api.event.all();
  const branding = await getBranding();
  if (!events || events.length === 0)
    return <NoEventsPage branding={branding} />;

  return (
    <main className="m-auto flex size-full max-w-xl flex-col text-black">
      <HofHeader />
      <div className="flex size-full flex-col items-center justify-center gap-4 p-4 pt-20">
        <EventDisplay events={events} />
        <div className="pointer-events-none fixed inset-0">
          <LogoConfetti />
        </div>
      </div>
    </main>
  );
}

function NoEventsPage({
  branding,
}: {
  branding: Awaited<ReturnType<typeof getBranding>>;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center pb-16 font-kallisto text-black">
      <Logos size={120} logoPath={branding.logoPath} />
      <h1 className="pt-4 text-center text-2xl font-semibold">
        {branding.appName} App
      </h1>
      <LinkButton href={env.NEXT_PUBLIC_BASE_URL}>Learn more</LinkButton>
      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </main>
  );
}
