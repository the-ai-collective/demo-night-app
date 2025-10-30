import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { getBranding } from "~/lib/branding.server";

import Presentations from "./components/Presentations";

export async function generateMetadata() {
  const currentEvent = await api.event.getCurrent();
  const branding = await getBranding();
  return { title: currentEvent?.name ?? branding.appName };
}

export default async function AdminPresentPage() {
  const currentEvent = await api.event.getCurrent();
  if (!currentEvent) {
    redirect("/admin");
  }

  return (
    <main className="m-auto flex size-full max-w-xl flex-col text-black">
      <Presentations currentEvent={currentEvent} />
    </main>
  );
}
