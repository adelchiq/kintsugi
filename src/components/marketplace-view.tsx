"use client";

import { Cloud, Cpu, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { MARKETPLACE_LISTINGS, type MarketplaceCategory } from "@/lib/marketplace";

function categoryIcon(c: MarketplaceCategory) {
  if (c === "ai") return <Cpu className="size-5 text-[#d4af37]" />;
  if (c === "cloud") return <Cloud className="size-5 text-[#d4af37]" />;
  return <ShoppingCart className="size-5 text-[#d4af37]" />;
}

export function MarketplaceView() {
  const { data: session } = useSession();
  const { profile, refresh } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const buy = async (listingId: string) => {
    if (!session?.user) {
      setToast("Sign in to spend Mianzi credits.");
      window.setTimeout(() => setToast(null), 4000);
      return;
    }
    setBusyId(listingId);
    setToast(null);
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        fulfillment?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setToast(data.message ?? data.error ?? "Purchase failed.");
        return;
      }
      setToast(data.fulfillment ?? "Purchase recorded in your ledger.");
      await refresh();
    } catch {
      setToast("Network error.");
    } finally {
      setBusyId(null);
      window.setTimeout(() => setToast(null), 8000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-[#d4af37]/85 text-xs font-medium tracking-[0.25em] uppercase">
          Mianzi marketplace
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Trade credits for AI and cloud capacity
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          Redeem Mianzi for partner-issued API bundles and cloud credit blocks. Fulfillment is
          described per listing (production would connect billing webhooks). Your balance:{" "}
          <span className="text-[#d4af37]">{profile.mianziCredits}</span> Mianzi
          {profile.id === "guest" ? " (sign in to purchase)" : ""}.
        </p>
      </header>

      {toast ? (
        <p className="text-muted-foreground animate-in fade-in text-sm">{toast}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {MARKETPLACE_LISTINGS.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col border-[#d4af37]/20 shadow-none"
          >
            <CardHeader className="gap-2">
              <div className="flex items-center gap-2">
                {categoryIcon(item.category)}
                <CardTitle className="font-heading text-lg leading-snug">
                  {item.title}
                </CardTitle>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 text-sm">
              <p className="text-muted-foreground text-xs uppercase">Fulfillment</p>
              <p className="leading-relaxed">{item.fulfillment}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d4af37]/10">
              <span className="font-heading text-lg text-[#d4af37]">
                {item.priceMianzi} Mianzi
              </span>
              <Button
                type="button"
                disabled={busyId === item.id || profile.id === "guest"}
                onClick={() => void buy(item.id)}
              >
                {busyId === item.id ? "Processing…" : "Redeem"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
