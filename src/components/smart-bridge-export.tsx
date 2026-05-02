"use client";

import { ExternalLink } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildDocMarkdown,
  buildPersonalizationPrompt,
  GOOGLE_DOCS_NEW,
  NOTION_NEW_PAGE,
} from "@/lib/export";
import type { SalvagedAsset } from "@/lib/types";

interface SmartBridgeExportProps {
  asset: SalvagedAsset;
  exportLabel?: string;
}

export function SmartBridgeExport({
  asset,
  exportLabel = "Smart Bridge export",
}: SmartBridgeExportProps) {
  const doc = buildDocMarkdown(asset);
  const prompt = buildPersonalizationPrompt(asset);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        {exportLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] border-[#d4af37]/35 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Smart Bridge</DialogTitle>
          <DialogDescription>
            Push documentation into Notion or Google Docs, then use the bundled AI helper prompt
            to personalize the salvage for your next project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <a
            href={NOTION_NEW_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "secondary",
              className: "inline-flex gap-1.5",
            })}
          >
            Open Notion
            <ExternalLink className="size-4" />
          </a>
          <a
            href={GOOGLE_DOCS_NEW}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "secondary",
              className: "inline-flex gap-1.5",
            })}
          >
            New Google Doc
            <ExternalLink className="size-4" />
          </a>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Documentation bundle
          </p>
          <ScrollArea className="max-h-36 rounded-md border border-[#d4af37]/25 bg-muted/40 p-3 text-xs">
            <pre className="whitespace-pre-wrap font-mono">{doc}</pre>
          </ScrollArea>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => copy(doc)}
          >
            Copy markdown
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            AI helper prompt (paste into your LLM)
          </p>
          <ScrollArea className="max-h-44 rounded-md border border-[#d4af37]/25 bg-muted/40 p-3 text-xs">
            <pre className="whitespace-pre-wrap font-mono">{prompt}</pre>
          </ScrollArea>
          <Button className="w-full" onClick={() => copy(prompt)}>
            Copy personalization prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
