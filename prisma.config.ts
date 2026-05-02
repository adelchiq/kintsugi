import "dotenv/config";
import path from "node:path";

import { defineConfig } from "prisma/config";

/** Prisma CLI config (replaces deprecated `package.json#prisma`). */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
});
