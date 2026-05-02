import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { HeaderAuth, HeaderMianziBadge } from "./site-header-client";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/salvage", label: "Salvage Portal" },
  { href: "/library", label: "Legacy Library" },
  { href: "/mianzi", label: "Mianzi Ledger" },
];

export function SiteHeader({
  githubAuthConfigured,
}: {
  githubAuthConfigured: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/25 bg-[#1a1a1a]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className={cn(
              "font-heading inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d4af37]/50 text-sm font-semibold text-[#d4af37]",
              "transition-colors group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10",
            )}
          >
            K
          </span>
          <span className="font-heading hidden text-sm font-semibold tracking-tight sm:inline">
            Kintsugi
          </span>
          <Badge variant="outline" className="hidden border-[#d4af37]/40 text-[10px] text-[#d4af37]/90 lg:inline">
            academic-tech salvage
          </Badge>
        </Link>
        <nav className="flex flex-1 items-center justify-end gap-1 sm:justify-center sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderMianziBadge />
          <HeaderAuth githubAuthConfigured={githubAuthConfigured} />
        </div>
      </div>
    </header>
  );
}
