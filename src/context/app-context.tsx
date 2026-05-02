"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MASTER_REFORMER_THRESHOLD,
  type LedgerEntry,
  type SalvagedAsset,
  type SalvagePayload,
  type UserProfile,
} from "@/lib/types";

export type { SalvagePayload } from "@/lib/types";

const GUEST_PROFILE: UserProfile = {
  id: "guest",
  displayName: "Guest",
  mianziCredits: 0,
  totalReusesReceived: 0,
  salvagedAssetIds: [],
  brilliantOriginal: false,
  contributorPercentile: 0,
};

interface AppContextValue {
  assets: SalvagedAsset[];
  profile: UserProfile;
  ledger: LedgerEntry[];
  loading: boolean;
  dispatchSalvage: (payload: SalvagePayload) => Promise<void>;
  recordReuse: (assetId: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  masterReformer: boolean;
  brilliantOriginal: boolean;
  fsiVerified: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [assets, setAssets] = useState<SalvagedAsset[]>([]);
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const libRes = await fetch("/api/library");
      const libJson = (await libRes.json().catch(() => ({}))) as {
        assets?: SalvagedAsset[];
      };
      if (libRes.ok && Array.isArray(libJson.assets)) {
        setAssets(libJson.assets);
      } else {
        setAssets([]);
      }

      if (session?.user?.id) {
        const stRes = await fetch("/api/kintsugi/state");
        if (stRes.ok) {
          const st = (await stRes.json()) as {
            profile: UserProfile;
            ledger: LedgerEntry[];
          };
          setProfile(st.profile);
          setLedger(st.ledger);
        }
      } else {
        setProfile(GUEST_PROFILE);
        setLedger([]);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "loading") return;
    const t = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(t);
  }, [status, refresh]);

  const dispatchSalvage = useCallback(
    async (payload: SalvagePayload) => {
      const res = await fetch("/api/kintsugi/salvage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.error === "string" ? err.error : "salvage_failed",
        );
      }
      await refresh();
    },
    [refresh],
  );

  const recordReuse = useCallback(
    async (assetId: string) => {
      const res = await fetch("/api/kintsugi/reuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        await refresh();
        return { ok: true as const };
      }
      return { ok: false as const, error: data.error };
    },
    [refresh],
  );

  const value = useMemo<AppContextValue>(() => {
    const masterReformer =
      profile.totalReusesReceived >= MASTER_REFORMER_THRESHOLD;
    const fsiVerified = profile.contributorPercentile >= 90;
    return {
      assets,
      profile,
      ledger,
      loading,
      dispatchSalvage,
      recordReuse,
      refresh,
      masterReformer,
      brilliantOriginal: profile.brilliantOriginal,
      fsiVerified,
    };
  }, [
    assets,
    dispatchSalvage,
    ledger,
    loading,
    profile,
    recordReuse,
    refresh,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
