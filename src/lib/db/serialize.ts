import type { LedgerEntry as DbLedger, SalvagedAsset as DbAsset, User } from "@prisma/client";

import { categoryFromDb, ledgerKindFromDb } from "@/lib/db/map-enums";
import type { LedgerEntry, SalvagedAsset, UserProfile } from "@/lib/types";

export function serializeAsset(row: DbAsset & { contributor: Pick<User, "id" | "name"> }): SalvagedAsset {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: categoryFromDb(row.category),
    devHoursSaved: row.devHoursSaved,
    contributorId: row.contributorId,
    contributorName: row.contributor.name ?? "Contributor",
    technicalGoldSummary: row.technicalGoldSummary,
    postMortemSnippet: row.postMortemSnippet,
    featuredPostMortem: row.featuredPostMortem,
    reuseCount: row.reuseCount,
    createdAt: row.createdAt.toISOString().slice(0, 10),
  };
}

export function serializeLedger(row: DbLedger): LedgerEntry {
  return {
    id: row.id,
    kind: ledgerKindFromDb(row.kind),
    delta: row.delta,
    label: row.label,
    assetId: row.assetId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeProfile(user: User, salvagedAssetIds: string[]): UserProfile {
  return {
    id: user.id,
    displayName: user.name ?? user.email ?? "Contributor",
    mianziCredits: user.mianziCredits,
    totalReusesReceived: user.totalReusesReceived,
    salvagedAssetIds,
    brilliantOriginal: user.brilliantOriginalFlag,
    contributorPercentile: user.contributorPercentile,
  };
}
