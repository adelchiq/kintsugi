"use client";

import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Row {
  rank: number;
  id: string;
  displayName: string;
  mianziCredits: number;
}

export function LeaderboardView() {
  const [entries, setEntries] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = (await res.json()) as { entries?: Row[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "failed");
        if (!cancelled) setEntries(data.entries ?? []);
      } catch {
        if (!cancelled) setError("Could not load leaderboard.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
          Global leaderboard
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Top contributors by Mianzi
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Rankings reflect Mianzi credits earned from community reuse of your salvages (and
          opening balances where seeded). Spend credits in the marketplace on API and cloud
          bundles.
        </p>
      </header>

      <Card className="border-[#d4af37]/25 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2">
          <Trophy className="text-[#d4af37] size-6" />
          <div>
            <CardTitle className="font-heading text-lg">Standings</CardTitle>
            <CardDescription>Top 50 · updated on each page load</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-muted-foreground text-sm">{error}</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No contributors yet.</p>
          ) : (
            <ol className="divide-y divide-[#d4af37]/15">
              {entries.map((e) => (
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
