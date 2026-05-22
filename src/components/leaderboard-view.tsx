"use client";

import { Trophy } from "lucide-react";

import { PrototypeBanner } from "@/components/prototype-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/context/app-context";

export function LeaderboardView() {
  const { leaderboard, loading, isPrototype } = useApp();

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
          Global leaderboard
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Top contributors by Mianzi
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Rankings reflect Mianzi credits—mostly from community reuse of salvaged assets. In
          prototype mode, clone/download in the library updates standings in your browser.
        </p>
        {isPrototype ? <PrototypeBanner /> : null}
      </header>

      <Card className="border-[#d4af37]/25 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2">
          <Trophy className="text-[#d4af37] size-6" />
          <div>
            <CardTitle className="font-heading text-lg">Standings</CardTitle>
            <CardDescription>
              {isPrototype
                ? "Demo contributors + your simulated activity"
                : "Top 50 · from database"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading && leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-sm">No contributors yet.</p>
          ) : (
            <ol className="divide-y divide-[#d4af37]/15">
              {leaderboard.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-muted-foreground w-8 shrink-0 font-mono text-sm">
                      {e.rank}
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/25 bg-muted text-xs font-medium">
                      {e.displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{e.displayName}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-[#d4af37]">
                    {e.mianziCredits} Mianzi
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
