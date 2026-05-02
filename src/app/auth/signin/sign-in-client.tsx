"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SignInInner({ githubAuthConfigured }: { githubAuthConfigured: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/library";

  return (
    <Card className="mx-auto w-full max-w-md border-[#d4af37]/25">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in with GitHub to salvage assets, earn Mianzi on community reuse, and open your
          ledger.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {githubAuthConfigured ? (
          <Button
            className="w-full"
            type="button"
            onClick={() => signIn("github", { callbackUrl })}
          >
            Continue with GitHub
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm leading-relaxed">
            GitHub OAuth is not configured. Add{" "}
            <code className="text-foreground text-xs">AUTH_GITHUB_ID</code> and{" "}
            <code className="text-foreground text-xs">AUTH_GITHUB_SECRET</code> to{" "}
            <code className="text-foreground text-xs">.env</code>, restart the dev server, and
            reload this page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SignInClient({
  githubAuthConfigured,
}: {
  githubAuthConfigured: boolean;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-center text-sm">Loading…</p>
      }
    >
      <SignInInner githubAuthConfigured={githubAuthConfigured} />
    </Suspense>
  );
}
