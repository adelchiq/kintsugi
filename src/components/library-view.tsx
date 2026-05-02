"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { SmartBridgeExport } from "@/components/smart-bridge-export";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";
import type { AssetCategory, SalvagedAsset } from "@/lib/types";
import { CREDITS_PER_REUSE, DEV_TIME_TARGET_PCT } from "@/lib/types";

const ALL = "All categories" as const;

export function LibraryView() {
  const { assets, profile, recordReuse } = useApp();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<AssetCategory | typeof ALL>(ALL);
  const [minHours, setMinHours] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assets.filter((a) => {
      if (category !== ALL && a.category !== category) return false;
      if (a.devHoursSaved < minHours) return false;
      if (!needle) return true;
      const blob =
        `${a.title} ${a.description} ${a.technicalGoldSummary} ${a.postMortemSnippet}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [assets, category, minHours, q]);

  const cohortHours = useMemo(
    () => filtered.reduce((s, a) => s + a.devHoursSaved, 0),
    [filtered],
  );

  /** Illustrative progress: reuse intensity vs. nominal baseline hours */
  const baseline = Math.max(cohortHours * 2.2, 120);
  const devTimeRatio = Math.round(
    Math.min(100, (cohortHours / baseline) * 100 * (DEV_TIME_TARGET_PCT / 45)),
  );

  const onReuse = async (asset: SalvagedAsset) => {
    if (profile.id === "guest") {
      setToast("Sign in with GitHub to record community reuse.");
      window.setTimeout(() => setToast(null), 5000);
      return;
    }

    const result = await recordReuse(asset.id);
    if (!result.ok) {
      if (result.error === "self_reuse") {
        setToast("Community reuse only — pick another contributor’s salvage.");
      } else {
        setToast("Could not record reuse. Try again.");
      }
      window.setTimeout(() => setToast(null), 5000);
      return;
    }

    if (asset.contributorId === profile.id) {
      setToast(
        `+${CREDITS_PER_REUSE} Mianzi credited — community reused your salvage.`,
      );
    } else {
      setToast(
        `Reuse logged · ${asset.contributorName} earns +${CREDITS_PER_REUSE} Mianzi.`,
      );
    }
    window.setTimeout(() => setToast(null), 4200);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
          Legacy Library
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Discover verified technical gold
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Filter by category and estimated hours reclaimed. Every clone or download feeds the
          Mianzi ledger—failure becomes a measurable signal of mastery.
        </p>
      </header>

      <Card className="border-[#d4af37]/25">
        <CardHeader className="gap-2 pb-2">
          <CardTitle className="font-heading text-base">
            Development time saved — cohort view
          </CardTitle>
          <CardDescription>
            Aggregated hours across matching assets ({cohortHours}h surfaced). Target narrative:
            ~{DEV_TIME_TARGET_PCT}% faster assembly for teams that compose from salvaged modules.
          </CardDescription>
          <Progress value={devTimeRatio} className="mt-2 h-2" />
          <p className="text-muted-foreground text-xs">
            Index intensity {devTimeRatio}% — illustrative vs. synthetic baseline ({baseline}h).
          </p>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search summaries, post-mortems, titles…"
            className="border-[#d4af37]/20 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs uppercase">
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as AssetCategory | typeof ALL)
              }
              className="border-input bg-background focus-visible:ring-ring h-8 rounded-lg border px-2 text-sm outline-none focus-visible:ring-3"
            >
              <option value={ALL}>{ALL}</option>
              {(
                [
                  "Data Science",
                  "Engineering",
                  "Frontend Modules",
                  "Market Research",
                ] as AssetCategory[]
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs uppercase">
              Min hours saved
            </label>
            <Input
              type="number"
              min={0}
              value={minHours}
              onChange={(e) => setMinHours(Number(e.target.value) || 0)}
              className="border-[#d4af37]/20 h-8 w-28"
            />
          </div>
        </div>
      </div>

      {toast ? (
        <p className="text-[#d4af37] text-sm animate-in fade-in">{toast}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((asset) => (
          <Card
            key={asset.id}
            className="flex flex-col border-[#d4af37]/20 shadow-none"
          >
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{asset.category}</Badge>
                {asset.featuredPostMortem ? (
                  <Badge className="border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37]">
                    Brilliant Original
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="font-heading text-lg leading-snug">
                {asset.title}
              </CardTitle>
              <CardDescription>{asset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Technical gold
                </p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">
                  {asset.technicalGoldSummary}
                </p>
              </div>
              <Separator className="bg-[#d4af37]/15" />
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Post-mortem
                </p>
                <p className="mt-1 leading-relaxed">{asset.postMortemSnippet}</p>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                <span>
                  ~{asset.devHoursSaved}h dev time saved
                </span>
                <span>{asset.reuseCount} community reuses</span>
                <span>by {asset.contributorName}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 border-t border-[#d4af37]/10">
              <Button type="button" variant="secondary" onClick={() => onReuse(asset)}>
                <Download />
                Clone / download (+10 Mianzi to contributor)
              </Button>
              <SmartBridgeExport asset={asset} exportLabel="Export" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No assets match these filters yet — widen search or salvage something new.
        </p>
      ) : null}
    </div>
  );
}
