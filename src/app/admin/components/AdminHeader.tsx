"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { getBrandingClient } from "~/lib/branding";

import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";

export function AdminHeader() {
  const { data: session } = useSession();
  const branding = getBrandingClient();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/60 shadow-sm backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-1 px-8 py-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 transition-opacity hover:opacity-80"
        >
          <Logos size={36} logoPath={branding.logoPath} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="line-clamp-1 font-marker text-xl font-bold leading-6 tracking-tight">
              {branding.appName} App
            </h1>
            <span className="font-marker text-sm font-bold text-muted-foreground">
              Admin Dashboard
            </span>
          </div>
        </Link>
        <div className="flex w-[108px] items-center justify-end">
          {session && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              data-testid="logout-button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

