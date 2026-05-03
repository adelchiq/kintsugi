"use client";

import Link from "next/link";
import { Award, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";
import {
  CREDITS_PER_REUSE,
  MASTER_REFORMER_THRESHOLD,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function MianziDashboard() {
  const {
    ledger,
    profile,
    masterReformer,
    brilliantOriginal,
    refresh,
    loading,
  } = useApp();

  const reformerProgress = Math.min(
    100,
    Math.round((profile.totalReusesReceived / MASTER_REFORMER_THRESHOLD) * 100),
  );

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
          Mianzi turns sunsets into social proof. Each reuse of your salvage yields{" "}
          <span className="text-[#d4af37]">{CREDITS_PER_REUSE}</span> credits—a ledger-backed
          credential that reframes failure as disciplined craft.
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

      <Card
        className={`overflow-hidden border-[#d4af37]/30 shadow-none ${
          masterReformer
            ? "ring-2 ring-[#d4af37]/55 shadow-[0_0_40px_rgba(212,175,55,0.12)]"
            : ""
        }`}
      >
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
          <div>
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-muted-foreground">
                Master Reformer ({MASTER_REFORMER_THRESHOLD}+ reuses)
              </span>
              <span>{profile.totalReusesReceived} recorded</span>
            </div>
            <Progress value={reformerProgress} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge
              variant="outline"
              className={
                masterReformer
                  ? "gap-1 border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                  : "gap-1 opacity-60"
              }
            >
              <Sparkles className="size-3.5" />
              Master Reformer
              {masterReformer ? " · gold profile border" : ""}
            </Badge>
            <Badge
              variant="outline"
              className={
                brilliantOriginal
                  ? "gap-1 border-[#d4af37]/70 bg-[#d4af37]/10 text-[#d4af37]"
                  : "gap-1 opacity-60"
              }
            >
              <Award className="size-3.5" />
              Brilliant Original
              {brilliantOriginal ? " · homepage feature eligible" : ""}
            </Badge>
          </div>

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
