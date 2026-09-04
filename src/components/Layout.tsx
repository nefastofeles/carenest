"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Portal" },
  { href: "/", label: "Family" },
  { href: "/calendar", label: "Calendar" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname === "/portal";

  return (
    <div className="min-h-screen bg-nest-cream text-nest-ink">
      <header className="relative z-20 border-b border-nest-peach/80 bg-white/90 print:hidden backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={isPortal ? "/portal" : "/"} className="flex items-center gap-3">
            <Image
              src="/carenest-logo.png"
              alt="CareNest"
              width={160}
              height={160}
              className="h-16 w-16 rounded-2xl bg-white object-contain shadow-sm ring-1 ring-nest-peach/60"
              priority
            />
            <span>
              <span className="block text-lg font-semibold tracking-tight text-nest-ink">
                CareNest
              </span>
              <span className="block text-xs text-slate-500">Family health in one place</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-nest-magenta",
                  pathname === item.href && "font-medium text-nest-magenta"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {!isPortal && (
          <p className="border-t border-nest-peach bg-gradient-to-r from-nest-peach/50 via-white to-nest-gold/20 px-4 py-1.5 text-center text-xs text-nest-ink">
            CareNest organises evidence and actions. It does not diagnose or replace clinical
            judgement. Synthetic demo family. Due dates use 3 Sep 2026.
          </p>
        )}
      </header>
      {isPortal ? (
        <main>{children}</main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      )}
    </div>
  );
}
