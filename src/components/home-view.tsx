"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/app-context";

export function HomeView() {
  const { assets, loading } = useApp();
  const featured = assets.filter((a) => a.featuredPostMortem).slice(0, 3);

  if (loading && assets.length === 0) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Loading library…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-[#d4af37]/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-[#d4af37]/90 text-xs font-medium tracking-[0.35em] uppercase">
              Kintsugi · salvage intelligence
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Repair the narrative around unfinished work.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Upload orphaned artifacts, document honest post-mortems, and let Mianzi credits
              quantify how others reclaim your technical gold. Built for students and builders who
              treat sunsetted projects as curriculum—not embarrassment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/salvage" className={cn(buttonVariants())}>
                Open Salvage Portal
              </Link>
              <Link
                href="/library"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Browse Legacy Library
              </Link>
              <Link
                href="/leaderboard"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Global leaderboard
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-sm border-[#d4af37]/35 bg-[#1f1f1f]/80 shadow-none backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading text-base">
                Ritual of repair
              </CardTitle>
              <CardDescription>
                Successful salvages animate gold fractures—your asset fuses into the shared
                library, visible to peers searching by time saved and domain.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-14">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Featured post-mortems
          </h2>
          <p className="text-muted-foreground text-sm">
            Strong narratives and reusable artifacts surface here first—discover them before you
            build from scratch.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((asset) => (
            <Card
              key={asset.id}
              className="flex flex-col border-[#d4af37]/25 shadow-none"
            >
              <CardHeader className="gap-2">
                <Badge className="w-fit border-[#d4af37]/45 bg-[#d4af37]/12 text-[#d4af37]">
                  {asset.category}
                </Badge>
                <CardTitle className="font-heading text-lg leading-snug">
                  {asset.title}
                </CardTitle>
                <CardDescription className="line-clamp-4">
                  {asset.postMortemSnippet}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link
                  href="/library"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  View in library
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d4af37]/15 bg-[#141414]/80">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Global leaderboard
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Rankings are by Mianzi credits—mostly from community reuse of your salvages. Open
                the leaderboard anytime to see who is contributing the most durable technical gold.
              </p>
            </div>
            <Link href="/leaderboard" className={cn(buttonVariants(), "w-fit shrink-0")}>
              View leaderboard
            </Link>
          </div>
          <Separator className="bg-[#d4af37]/15" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
              Every export from the Legacy Library opens the Smart Bridge: markdown documentation,
              Notion / Google Docs jump links, and an AI helper prompt so the next student can
              personalize the salvage in minutes—not days.
            </p>
            <Link
              href="/marketplace"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit shrink-0")}
            >
              Mianzi marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
