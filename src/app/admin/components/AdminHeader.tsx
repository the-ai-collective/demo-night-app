"use client";

import Link from "next/link";
import Logos from "~/components/Logos";

import { getBrandingClient } from "~/lib/branding";

export function AdminHeader() {

    const branding = getBrandingClient();

    return (
        <header className="sticky top-0 z-10 border-b bg-white/60 shadow-sm backdrop-blur">
            <div className="container mx-auto flex items-center justify-between gap-1 px-8 py-2">
                <Link href="/admin"><Logos size={36} logoPath={branding.logoPath} /></Link>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="line-clamp-1 font-marker text-xl font-bold leading-6 tracking-tight">
                        {branding.appName} App
                    </h1>
                    <span className="font-marker text-sm font-bold text-muted-foreground">
                        Admin Dashboard
                    </span>
                </div>
                <div className="flex w-[108px] items-center justify-end" />
            </div>
        </header>
    )
}