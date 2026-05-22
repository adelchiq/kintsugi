"use client";

import {
  buildPrototypeLeaderboard,
  mergePrototypeLibrary,
  PROTOTYPE_LEADERBOARD,
  type PrototypeLeaderboardRow,
} from "@/lib/prototype-data";
import type { LedgerEntry, SalvagedAsset, SalvagePayload } from "@/lib/types";
import { CREDITS_PER_REUSE } from "@/lib/types";

const STORAGE_KEY = "kintsugi-prototype-v1";

interface UserPrototypeState {
  displayName?: string;
  mianziCredits: number;
  totalReusesReceived: number;
  salvagedAssetIds: string[];
  brilliantOriginal: boolean;
  ledger: LedgerEntry[];
}

interface PrototypeStore {
  userAssets: SalvagedAsset[];
  creditBonus: Record<string, number>;
  reuseCounts: Record<string, number>;
  users: Record<string, UserPrototypeState>;
}

function defaultUserState(): UserPrototypeState {
  return {
    mianziCredits: 48,
    totalReusesReceived: 0,
    salvagedAssetIds: [],
    brilliantOriginal: false,
    ledger: [
      {
        id: "proto-led-open",
        kind: "adjustment",
        delta: 48,
        label: "Prototype opening balance",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function loadStore(): PrototypeStore {
  if (typeof window === "undefined") {
    return { userAssets: [], creditBonus: {}, reuseCounts: {}, users: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { userAssets: [], creditBonus: {}, reuseCounts: {}, users: {} };
    }
    return JSON.parse(raw) as PrototypeStore;
  } catch {
    return { userAssets: [], creditBonus: {}, reuseCounts: {}, users: {} };
  }
}

function saveStore(store: PrototypeStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getMergedLibrary(): SalvagedAsset[] {
  const store = loadStore();
  const withReuse = mergePrototypeLibrary(store.userAssets).map((a) => ({
    ...a,
    reuseCount: a.reuseCount + (store.reuseCounts[a.id] ?? 0),
  }));
  return withReuse;
}

export function getMergedLeaderboard() {
  const store = loadStore();
  const baseIds = new Set(PROTOTYPE_LEADERBOARD.map((r) => r.id));
  const extras: { id: string; displayName: string; mianziCredits: number }[] = [];
  for (const [id, user] of Object.entries(store.users)) {
    if (baseIds.has(id)) continue;
    extras.push({
      id,
      displayName: user.displayName ?? "You",
      mianziCredits: user.mianziCredits,
    });
  }
  return buildPrototypeLeaderboard(store.creditBonus, extras);
}

export function getPrototypeUserProfile(
  userId: string,
  displayName: string,
): UserPrototypeState & { id: string; displayName: string; salvagedAssetIds: string[] } {
  const store = loadStore();
  let user = store.users[userId];
  if (!user) {
    user = defaultUserState();
    user.displayName = displayName;
    store.users[userId] = user;
    saveStore(store);
  } else if (!user.displayName) {
    user.displayName = displayName;
    store.users[userId] = user;
    saveStore(store);
  }
  return {
    id: userId,
    displayName: user.displayName ?? displayName,
    ...user,
  };
}

export function addPrototypeSalvage(
  userId: string,
  displayName: string,
  payload: SalvagePayload,
): SalvagedAsset {
  const store = loadStore();
  const id = uid("proto-user-asset");
  const asset: SalvagedAsset = {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    devHoursSaved: payload.devHoursSaved,
    contributorId: userId,
    contributorName: displayName,
    technicalGoldSummary: payload.technicalGoldSummary,
    postMortemSnippet: payload.postMortemSnippet,
    featuredPostMortem: payload.brilliantOriginal,
    reuseCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.userAssets = [asset, ...store.userAssets];
  const user = store.users[userId] ?? defaultUserState();
  user.displayName = displayName;
  user.salvagedAssetIds = [...user.salvagedAssetIds, id];
  user.brilliantOriginal = user.brilliantOriginal || payload.brilliantOriginal;
  user.ledger = [
    {
      id: uid("led"),
      kind: "salvage_submitted",
      delta: 0,
      label: `Salvage submitted — “${asset.title}” (prototype)`,
      assetId: id,
      createdAt: new Date().toISOString(),
    },
    ...user.ledger,
  ];
  store.users[userId] = user;
  saveStore(store);
  return asset;
}

export function recordPrototypeReuse(
  actorUserId: string,
  assetId: string,
): { ok: true; message: string } | { ok: false; error: string } {
  const store = loadStore();
  const library = getMergedLibrary();
  const asset = library.find((a) => a.id === assetId);
  if (!asset) {
    return { ok: false, error: "not_found" };
  }
  if (asset.contributorId === actorUserId) {
    return { ok: false, error: "self_reuse" };
  }

  store.reuseCounts[assetId] = (store.reuseCounts[assetId] ?? 0) + 1;
  store.creditBonus[asset.contributorId] =
    (store.creditBonus[asset.contributorId] ?? 0) + CREDITS_PER_REUSE;

  const contributor = store.users[asset.contributorId];
  if (contributor) {
    contributor.mianziCredits += CREDITS_PER_REUSE;
    contributor.totalReusesReceived += 1;
    contributor.ledger = [
      {
        id: uid("led"),
        kind: "earn_reuse",
        delta: CREDITS_PER_REUSE,
        label: `Reuse recorded — “${asset.title}” (+${CREDITS_PER_REUSE} Mianzi, prototype)`,
        assetId,
        createdAt: new Date().toISOString(),
      },
      ...contributor.ledger,
    ];
    store.users[asset.contributorId] = contributor;
  }

  saveStore(store);
  return {
    ok: true,
    message: `${asset.contributorName} earns +${CREDITS_PER_REUSE} Mianzi (simulated).`,
  };
}

export function spendPrototypeCredits(
  userId: string,
  amount: number,
  label: string,
): { ok: true } | { ok: false; error: string } {
  const store = loadStore();
  const user = store.users[userId] ?? defaultUserState();
  user.displayName = user.displayName ?? "You";
  if (user.mianziCredits < amount) {
    return { ok: false, error: "insufficient" };
  }
  user.mianziCredits -= amount;
  user.ledger = [
    {
      id: uid("led"),
      kind: "marketplace_purchase",
      delta: -amount,
      label,
      createdAt: new Date().toISOString(),
    },
    ...user.ledger,
  ];
  store.users[userId] = user;
  saveStore(store);
  return { ok: true };
}

export type { PrototypeLeaderboardRow };
