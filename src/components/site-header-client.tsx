"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

export function HeaderMianziBadge() {
  const { profile, masterReformer } = useApp();

  if (profile.id === "guest") {
    return null;
  }

  return (
    <Link
      href="/mianzi"
      className={cn(
        "hidden shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium sm:flex",
        masterReformer
          ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_0_1px_rgba(212,175,55,0.35)]"
          : "border-[#d4af37]/30 text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="text-[#d4af37]/80">Mianzi</span>
      <span className="ml-2 tabular-nums text-foreground">{profile.mianziCredits}</span>
    </Link>
  );
}

export function HeaderAuth({
  githubAuthConfigured,
}: {
  githubAuthConfigured: boolean;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-muted-foreground w-14 text-center text-[10px]">…</span>
    );
  }

  if (session?.user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      title={
        githubAuthConfigured
          ? "Sign in with GitHub"
          : "Configure GitHub OAuth (see .env.example)"
      }
    >
      Sign in
    </Link>
  );
}
