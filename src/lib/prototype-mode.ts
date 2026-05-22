/**
 * When true, library + leaderboard serve curated demo data (no Postgres required).
 * Default: prototype unless explicitly disabled or a database URL is configured.
 */
export function preferPrototypeData(): boolean {
  if (process.env.KINTSUGI_PROTOTYPE === "false") return false;
  if (process.env.KINTSUGI_PROTOTYPE === "true") return true;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return true;
  // Vercel demo deploys often set DATABASE_URL before seeding — still show demo data.
  if (process.env.VERCEL === "1" && process.env.KINTSUGI_PROTOTYPE !== "false") {
    return true;
  }
  return false;
}
