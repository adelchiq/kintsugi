"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

export function MianziDashboard() {
  const { ledger, profile, refresh, loading } = useApp();

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
          Mianzi reputation engine
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Credits ledger
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Mianzi credits accrue when others reuse your salvages. Spend them in the marketplace on
          AI and cloud bundles, or climb the global leaderboard.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/leaderboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Global leaderboard
          </Link>
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Mianzi marketplace
          </Link>
        </div>
      </header>

      <Card className="overflow-hidden border-[#d4af37]/30 shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading text-xl">
              {profile.displayName}
            </CardTitle>
            <CardDescription>
              Salvages indexed: {profile.salvagedAssetIds.length}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs uppercase">Balance</p>
            <p className="font-heading text-4xl font-semibold tracking-tight text-[#d4af37]">
              {profile.mianziCredits}
            </p>
            <p className="text-muted-foreground text-xs">Mianzi credits</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator className="bg-[#d4af37]/15" />

          <div className="space-y-3">
            <h2 className="text-sm font-medium tracking-wide uppercase">
              Ledger
            </h2>
            <ul className="space-y-3">
              {ledger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[#d4af37]/12 bg-muted/20 px-3 py-2 text-sm"
                >
                  <div>
                    <p>{entry.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={
                      entry.delta > 0
                        ? "font-medium text-[#d4af37]"
                        : entry.delta < 0
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    {entry.delta === 0 ? "—" : `${entry.delta > 0 ? "+" : ""}${entry.delta}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button variant="ghost" size="sm" disabled={loading} onClick={() => void refresh()}>
            Refresh ledger
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
