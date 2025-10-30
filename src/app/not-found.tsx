import { getBrandingClient } from "~/lib/branding";

import { LinkButton } from "~/components/Button";
import { LogoConfetti } from "~/components/Confetti";
import Logos from "~/components/Logos";

export default async function NotFoundPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const branding = getBrandingClient();
  let title = "URL not found 🥲";
  let message = "(hang with us!) ";
  if (searchParams?.type === "invalid-secret") {
    title = "Invalid secret 😬";
    message = "You need a valid secret to access this page";
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 pb-16 text-center font-kallisto text-black">
      <Logos size={120} logoPath={branding.logoPath} />
      <h1 className="pt-4 text-center text-2xl font-bold">{title}</h1>
      <p className="text-lg font-semibold italic text-gray-500">{message}</p>
      <LinkButton href="/">Back to home</LinkButton>
      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </main>
  );
}
