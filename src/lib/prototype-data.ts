import type { SalvagedAsset } from "@/lib/types";

/** Curated demo library — always available in prototype mode. */
export const PROTOTYPE_LIBRARY: SalvagedAsset[] = [
  {
    id: "proto-a1",
    title: "Retail churn — feature pipeline",
    description:
      "End-to-end sklearn + SQL feature store stubs from a sunsetted loyalty analytics sprint.",
    category: "Data Science",
    devHoursSaved: 42,
    contributorId: "proto-okonkwo",
    contributorName: "M. Okonkwo",
    technicalGoldSummary:
      "Reusable transformation steps for RFM-style aggregates and leakage-safe CV splits.",
    postMortemSnippet:
      "Goal was predictive churn for a pilot region; sunsetted after retailer withdrew data share.",
    featuredPostMortem: false,
    reuseCount: 18,
    createdAt: "2025-11-02",
  },
  {
    id: "proto-a2",
    title: "Postgres schema — inventory microservice",
    description:
      "Migrations and constraints from a cancelled omnichannel rollout; production-hardened naming.",
    category: "Engineering",
    devHoursSaved: 28,
    contributorId: "proto-reyes",
    contributorName: "S. Reyes",
    technicalGoldSummary:
      "Clear separation of stock reservations vs. committed orders; helpful CHECK patterns.",
    postMortemSnippet:
      "Scoped down when vendor integration slipped; schema remained the cleanest artifact.",
    featuredPostMortem: true,
    reuseCount: 31,
    createdAt: "2025-09-18",
  },
  {
    id: "proto-a3",
    title: "Accessible dashboard shell (React)",
    description:
      "Layout primitives and chart wrappers built for an academic cohort planner that never shipped.",
    category: "Frontend Modules",
    devHoursSaved: 36,
    contributorId: "proto-demo",
    contributorName: "Demo salvage owner",
    technicalGoldSummary:
      "Keyboard-first navigation regions, sensible defaults for chart color contrast.",
    postMortemSnippet:
      "Funding ended after usability study; components were stable enough to open-source internally.",
    featuredPostMortem: false,
    reuseCount: 4,
    createdAt: "2026-01-05",
  },
  {
    id: "proto-a4",
    title: "EU mobility — TAM memo pack",
    description:
      "Structured interview guide + sizing workbook from a discontinued mobility marketplace thesis.",
    category: "Market Research",
    devHoursSaved: 22,
    contributorId: "proto-lindqvist",
    contributorName: "K. Lindqvist",
    technicalGoldSummary:
      "Repeatable bottom-up market model with sensitivity tabs; strong citations template.",
    postMortemSnippet:
      "Partners chose a different vertical; research quality was cited by two later cohort projects.",
    featuredPostMortem: true,
    reuseCount: 12,
    createdAt: "2025-12-01",
  },
  {
    id: "proto-a5",
    title: "FastAPI auth middleware (JWT + refresh)",
    description:
      "Drop-in middleware and rotation helpers from a paused B2B API rewrite.",
    category: "Engineering",
    devHoursSaved: 18,
    contributorId: "proto-chen",
    contributorName: "A. Chen",
    technicalGoldSummary:
      "Token refresh flow with rotation hooks; useful patterns for cookie vs. header clients.",
    postMortemSnippet:
      "Client chose a managed auth vendor; code was archived but patterns remain sound.",
    featuredPostMortem: false,
    reuseCount: 9,
    createdAt: "2025-10-14",
  },
  {
    id: "proto-a6",
    title: "Notebook — cohort survival curves",
    description:
      "Clean Kaplan–Meier + Cox PH starter notebook with plotting defaults for student labs.",
    category: "Data Science",
    devHoursSaved: 14,
    contributorId: "proto-patel",
    contributorName: "R. Patel",
    technicalGoldSummary:
      "Documented assumptions, censoring rules, and exportable SVG figures for reports.",
    postMortemSnippet:
      "Course scope changed; notebook still used in two follow-on seminars.",
    featuredPostMortem: false,
    reuseCount: 7,
    createdAt: "2025-08-22",
  },
];

export interface PrototypeLeaderboardRow {
  id: string;
  displayName: string;
  mianziCredits: number;
}

/** Base standings before any client-side prototype interactions. */
export const PROTOTYPE_LEADERBOARD: PrototypeLeaderboardRow[] = [
  { id: "proto-reyes", displayName: "S. Reyes", mianziCredits: 310 },
  { id: "proto-okonkwo", displayName: "M. Okonkwo", mianziCredits: 220 },
  { id: "proto-lindqvist", displayName: "K. Lindqvist", mianziCredits: 180 },
  { id: "proto-chen", displayName: "A. Chen", mianziCredits: 140 },
  { id: "proto-patel", displayName: "R. Patel", mianziCredits: 95 },
  { id: "proto-demo", displayName: "Demo salvage owner", mianziCredits: 120 },
];

export function buildPrototypeLeaderboard(
  creditBonus: Record<string, number> = {},
  extraRows: PrototypeLeaderboardRow[] = [],
): { rank: number; id: string; displayName: string; mianziCredits: number }[] {
  const baseIds = new Set(PROTOTYPE_LEADERBOARD.map((r) => r.id));
  const merged = [
    ...PROTOTYPE_LEADERBOARD.map((row) => ({
      ...row,
      mianziCredits: row.mianziCredits + (creditBonus[row.id] ?? 0),
    })),
    ...extraRows.filter((r) => !baseIds.has(r.id)),
  ];
  merged.sort((a, b) => b.mianziCredits - a.mianziCredits);
  return merged.map((row, i) => ({ rank: i + 1, ...row }));
}

export function mergePrototypeLibrary(
  userAssets: SalvagedAsset[],
): SalvagedAsset[] {
  const byId = new Map<string, SalvagedAsset>();
  for (const a of PROTOTYPE_LIBRARY) byId.set(a.id, a);
  for (const a of userAssets) byId.set(a.id, a);
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
