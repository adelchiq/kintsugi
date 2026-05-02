import type { AssetCategory as DbCategory, LedgerKind as DbLedgerKind } from "@prisma/client";

import type { AssetCategory, LedgerKind } from "@/lib/types";

const CATEGORY_TO_DB: Record<AssetCategory, DbCategory> = {
  "Data Science": "DATA_SCIENCE",
  Engineering: "ENGINEERING",
  "Frontend Modules": "FRONTEND_MODULES",
  "Market Research": "MARKET_RESEARCH",
};

const DB_TO_CATEGORY: Record<DbCategory, AssetCategory> = {
  DATA_SCIENCE: "Data Science",
  ENGINEERING: "Engineering",
  FRONTEND_MODULES: "Frontend Modules",
  MARKET_RESEARCH: "Market Research",
};

export function categoryToDb(c: AssetCategory): DbCategory {
  return CATEGORY_TO_DB[c];
}

export function categoryFromDb(c: DbCategory): AssetCategory {
  return DB_TO_CATEGORY[c];
}

export function ledgerKindFromDb(k: DbLedgerKind): LedgerKind {
  return k as LedgerKind;
}
