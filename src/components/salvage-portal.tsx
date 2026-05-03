"use client";

import { Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";

import { KintsugiFractureOverlay } from "@/components/kintsugi-fracture";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/app-context";
import type { SalvagePayload } from "@/lib/types";
import type { AssetCategory } from "@/lib/types";
import { DEV_TIME_TARGET_PCT } from "@/lib/types";

const CATEGORIES: AssetCategory[] = [
  "Data Science",
  "Engineering",
  "Frontend Modules",
  "Market Research",
];

const BRILLIANT_POST_MORTEM_MIN = 220;

export function SalvagePortal() {
  const { dispatchSalvage } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Engineering");
  const [originalGoal, setOriginalGoal] = useState("");
  const [sunsetReason, setSunsetReason] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [technicalGold, setTechnicalGold] = useState("");
  const [devHoursSaved, setDevHoursSaved] = useState(24);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [fracture, setFracture] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const postMortemSnippet = [originalGoal.trim(), sunsetReason.trim()]
    .filter(Boolean)
    .join("\n\n");

  const brilliantOriginal =
    sunsetReason.trim().length >= BRILLIANT_POST_MORTEM_MIN;

  const runAutoDoc = useCallback(async () => {
    setLoadingAi(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/auto-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: fileText,
          fileName: fileName || "salvage-upload.txt",
        }),
      });
      const data = (await res.json()) as {
        summary?: string;
        fallback?: boolean;
        error?: string;
      };
      if (data.summary) {
        setTechnicalGold(data.summary);
        setAiNote(
          data.fallback
            ? "Heuristic summary (add OPENAI_API_KEY for full LLM scan)."
            : "AI Auto-Doc attached.",
        );
      } else {
        setAiNote(data.error ?? "Could not generate summary.");
      }
    } catch {
      setAiNote("Network error running Auto-Doc.");
    } finally {
      setLoadingAi(false);
    }
  }, [fileName, fileText]);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    const text = await f.text();
    setFileText(text);
  };

  const submit = async () => {
    if (!title.trim() || !technicalGold.trim() || !postMortemSnippet.trim()) {
      return;
    }
    const payload: SalvagePayload = {
      title: title.trim(),
      description: technicalGold.slice(0, 280),
      category,
      devHoursSaved: Math.max(1, Math.round(devHoursSaved)),
      technicalGoldSummary: technicalGold.trim(),
      postMortemSnippet: postMortemSnippet.trim(),
      brilliantOriginal,
      fileContent: fileText,
      fileName: fileName || undefined,
    };
    setSubmitError(null);
    try {
      await dispatchSalvage(payload);
      setFracture(true);
      setTitle("");
      setOriginalGoal("");
      setSunsetReason("");
      setFileText("");
      setFileName("");
      setTechnicalGold("");
      setAiNote(null);
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "Could not save salvage. Ensure Postgres is running and try again.";
      setSubmitError(msg);
    }
  };

  const narrativeQuality = Math.min(
    100,
    Math.round((sunsetReason.trim().length / BRILLIANT_POST_MORTEM_MIN) * 100),
  );

  return (
    <>
      <KintsugiFractureOverlay
        open={fracture}
        onComplete={() => setFracture(false)}
      />
      <div className="mx-auto max-w-3xl space-y-8 py-10">
        <header className="space-y-2">
          <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
            Salvage Portal
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Upload orphaned assets
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Publish SQL schemas, functional Python scripts, structured research, or UI modules that
            outlived their product. The AI scans your files to surface real{" "}
            <span className="text-foreground/90">technical gold</span>—reusable patterns peers can
            trust. A concise post-mortem turns sunset into a credential.
          </p>
          <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
            If someone uploads random junk (empty files, gibberish, or non-functional fragments),
            the quality gate flags it as low-utility and blocks the salvage so the Legacy Library
            stays high-signal.
          </p>
        </header>

        <Card className="border-[#d4af37]/25 shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Asset intake</CardTitle>
            <CardDescription>
              Attach plaintext sources (practical limit ~200KB). Run{" "}
              <strong className="text-foreground/90">AI Auto-Doc</strong> to extract bullets; the
              same payload is checked server-side for substance. With{" "}
              <code className="text-foreground/80">OPENAI_API_KEY</code> set, scans use your LLM;
              otherwise heuristics apply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Working title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Loyalty churn — feature pipeline"
                  className="border-[#d4af37]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as AssetCategory)
                  }
                  className="border-input bg-background focus-visible:ring-ring flex h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-offset-0"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">
                  Est. development time saved (hours)
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  value={devHoursSaved}
                  onChange={(e) =>
                    setDevHoursSaved(Number(e.target.value) || 1)
                  }
                  className="border-[#d4af37]/20"
                />
                <p className="text-muted-foreground text-xs">
                  Library metrics benchmark reuse toward ~{DEV_TIME_TARGET_PCT}% faster builds.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload</Label>
              <label className="border-input hover:border-[#d4af37]/45 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-8 transition-colors">
                <Upload className="text-muted-foreground size-6" />
                <span className="text-muted-foreground text-sm">
                  Drop or choose a file ({fileName || "none yet"})
                </span>
                <input
                  id="file"
                  type="file"
                  className="sr-only"
                  onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal">Original goal</Label>
                <Textarea
                  id="goal"
                  value={originalGoal}
                  onChange={(e) => setOriginalGoal(e.target.value)}
                  placeholder="What problem was this artifact meant to solve?"
                  rows={4}
                  className="border-[#d4af37]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sunset">Why it sunsetted</Label>
                <Textarea
                  id="sunset"
                  value={sunsetReason}
                  onChange={(e) => setSunsetReason(e.target.value)}
                  placeholder="Budget, pivot, data access, scope cut — be specific."
                  rows={4}
                  className="border-[#d4af37]/20"
                />
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Post-mortem depth
                    </span>
                    <span className="text-[#d4af37]/90">
                      {brilliantOriginal
                        ? "Eligible · Brilliant Original"
                        : `${sunsetReason.trim().length}/${BRILLIANT_POST_MORTEM_MIN} chars`}
                    </span>
                  </div>
                  <Progress value={narrativeQuality} className="h-1.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!fileText.trim() || loadingAi}
                  onClick={() => void runAutoDoc()}
                >
                  {loadingAi ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Scanning…
                    </>
                  ) : (
                    "Run AI Auto-Doc"
                  )}
                </Button>
                {aiNote ? (
                  <span className="text-muted-foreground text-xs">{aiNote}</span>
                ) : null}
              </div>
              <Label htmlFor="gold">Technical gold summary</Label>
              <Textarea
                id="gold"
                value={technicalGold}
                onChange={(e) => setTechnicalGold(e.target.value)}
                placeholder="Generated bullets appear here — edit freely."
                rows={8}
                className="border-[#d4af37]/20 font-mono text-xs leading-relaxed"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-[#d4af37]/15 sm:flex-row sm:justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">
                After a successful save, the gold-fracture ritual plays as your salvage enters the
                shared library.
              </p>
              {submitError ? (
                <p className="text-destructive text-xs">{submitError}</p>
              ) : null}
            </div>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={
                !title.trim() ||
                !technicalGold.trim() ||
                !postMortemSnippet.trim()
              }
            >
              Salvage to library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
