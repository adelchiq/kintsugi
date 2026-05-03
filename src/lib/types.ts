export type AssetCategory =
  | "Data Science"
  | "Engineering"
  | "Frontend Modules"
  | "Market Research";

export interface SalvagedAsset {
  id: string;
  title: string;
  description: string;
  category: AssetCategory;
  /** Estimated hours a team saves by reusing (for “Development Time Saved”) */
  devHoursSaved: number;
  contributorId: string;
  contributorName: string;
  technicalGoldSummary: string;
  postMortemSnippet: string;
  featuredPostMortem?: boolean;
  reuseCount: number;
  createdAt: string;
}

export type LedgerKind =
  | "earn_reuse"
  | "salvage_submitted"
  | "adjustment"
  | "marketplace_purchase";

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  delta: number;
  label: string;
  assetId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  mianziCredits: number;
  /** Community reuses across your salvaged assets */
  totalReusesReceived: number;
  salvagedAssetIds: string[];
  brilliantOriginal: boolean;
}

export const CREDITS_PER_REUSE = 10;
export const DEV_TIME_TARGET_PCT = 30;

/** Payload from Salvage Portal → POST /api/kintsugi/salvage */
export type SalvagePayload = Omit<
  SalvagedAsset,
  | "id"
  | "contributorId"
  | "contributorName"
  | "reuseCount"
  | "createdAt"
  | "featuredPostMortem"
> & {
  brilliantOriginal: boolean;
  /** Raw upload text for quality gate (not persisted) */
  fileContent?: string;
  fileName?: string;
};
