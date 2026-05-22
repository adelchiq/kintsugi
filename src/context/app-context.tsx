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

import { assessSalvageQuality } from "@/lib/salvage-quality";
import {
  addPrototypeSalvage,
  getMergedLeaderboard,
  getMergedLibrary,
  getPrototypeUserProfile,
  recordPrototypeReuse,
  spendPrototypeCredits,
} from "@/lib/prototype-store.client";
import type {
  LedgerEntry,
  SalvagedAsset,
  SalvagePayload,
  UserProfile,
} from "@/lib/types";

export type { SalvagePayload } from "@/lib/types";

const GUEST_PROFILE: UserProfile = {
  id: "guest",
  displayName: "Guest",
  mianziCredits: 0,
  totalReusesReceived: 0,
  salvagedAssetIds: [],
  brilliantOriginal: false,
};

interface AppContextValue {
  assets: SalvagedAsset[];
  profile: UserProfile;
  ledger: LedgerEntry[];
  loading: boolean;
  isPrototype: boolean;
  leaderboard: { rank: number; id: string; displayName: string; mianziCredits: number }[];
  dispatchSalvage: (payload: SalvagePayload) => Promise<void>;
  recordReuse: (assetId: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  purchaseMarketplace: (listingId: string, price: number, label: string) => Promise<{ ok: boolean; error?: string; fulfillment?: string }>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [assets, setAssets] = useState<SalvagedAsset[]>([]);
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<
    AppContextValue["leaderboard"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isPrototype, setIsPrototype] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [libRes, lbRes] = await Promise.all([
        fetch("/api/library"),
        fetch("/api/leaderboard"),
      ]);

      const libJson = (await libRes.json().catch(() => ({}))) as {
        assets?: SalvagedAsset[];
        source?: string;
      };
      const lbJson = (await lbRes.json().catch(() => ({}))) as {
        entries?: AppContextValue["leaderboard"];
        source?: string;
      };

      const apiAssets = Array.isArray(libJson.assets) ? libJson.assets : [];
      const apiEntries = Array.isArray(lbJson.entries) ? lbJson.entries : [];

      const proto =
        libJson.source === "prototype" ||
        lbJson.source === "prototype" ||
        !libRes.ok ||
        !lbRes.ok ||
        apiAssets.length === 0 ||
        apiEntries.length === 0;

      setIsPrototype(proto);

      if (proto) {
        setAssets(getMergedLibrary());
        setLeaderboard(getMergedLeaderboard());
      } else {
        setAssets(apiAssets);
        setLeaderboard(apiEntries);
      }

      if (session?.user?.id) {
        if (!proto) {
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
          const p = getPrototypeUserProfile(
            session.user.id,
            session.user.name ?? session.user.email ?? "You",
          );
          setProfile({
            id: p.id,
            displayName: p.displayName,
            mianziCredits: p.mianziCredits,
            totalReusesReceived: p.totalReusesReceived,
            salvagedAssetIds: p.salvagedAssetIds,
            brilliantOriginal: p.brilliantOriginal,
          });
          setLedger(p.ledger);
        }
      } else {
        setProfile(GUEST_PROFILE);
        setLedger([]);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

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

      if (res.ok) {
        await refresh();
        return;
      }

      const err = (await res.json().catch(() => ({}))) as {
        error?: string;
        reasons?: string[];
      };

      if (err.error === "low_quality" && err.reasons?.length) {
        throw new Error(err.reasons.join(" "));
      }

      if (!session?.user?.id) {
        throw new Error(err.error ?? "salvage_failed");
      }

      const quality = assessSalvageQuality({
        fileName: payload.fileName ?? "upload.txt",
        fileContent: payload.fileContent ?? "",
        technicalGoldSummary: payload.technicalGoldSummary,
        postMortemSnippet: payload.postMortemSnippet,
      });
      if (!quality.ok) {
        throw new Error(quality.reasons.join(" "));
      }

      addPrototypeSalvage(
        session.user.id,
        session.user.name ?? session.user.email ?? "You",
        payload,
      );
      await refresh();
    },
    [refresh, session?.user?.email, session?.user?.id, session?.user?.name],
  );

  const recordReuse = useCallback(
    async (assetId: string) => {
      const res = await fetch("/api/kintsugi/reuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (res.ok) {
        await refresh();
        return { ok: true as const };
      }

      if (!session?.user?.id) {
        return { ok: false as const, error: data.error ?? "Unauthorized" };
      }

      const sim = recordPrototypeReuse(session.user.id, assetId);
      if (!sim.ok) {
        return { ok: false as const, error: sim.error };
      }
      await refresh();
      return { ok: true as const, message: sim.message };
    },
    [refresh, session?.user?.id],
  );

  const purchaseMarketplace = useCallback(
    async (listingId: string, price: number, label: string) => {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        fulfillment?: string;
        message?: string;
        error?: string;
      };

      if (res.ok) {
        await refresh();
        return { ok: true as const, fulfillment: data.fulfillment };
      }

      if (!session?.user?.id) {
        return { ok: false as const, error: "Unauthorized" };
      }

      const spent = spendPrototypeCredits(session.user.id, price, label);
      if (!spent.ok) {
        return { ok: false as const, error: spent.error };
      }
      await refresh();
      return {
        ok: true as const,
        fulfillment: "Prototype redemption recorded — partner fulfillment is simulated.",
      };
    },
    [refresh, session?.user?.id],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      assets,
      profile,
      ledger,
      loading,
      isPrototype,
      leaderboard,
      dispatchSalvage,
      recordReuse,
      purchaseMarketplace,
      refresh,
    }),
    [
      assets,
      dispatchSalvage,
      isPrototype,
      leaderboard,
      ledger,
      loading,
      profile,
      purchaseMarketplace,
      recordReuse,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
