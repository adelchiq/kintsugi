import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONTRIBUTORS = [
  {
    id: "seed_okonkwo",
    name: "M. Okonkwo",
    email: "seed.okonkwo@kintsugi.invalid",
  },
  {
    id: "seed_reyes",
    name: "S. Reyes",
    email: "seed.reyes@kintsugi.invalid",
  },
  {
    id: "seed_demo_owner",
    name: "Demo salvage owner",
    email: "seed.demo.owner@kintsugi.invalid",
  },
  {
    id: "seed_lindqvist",
    name: "K. Lindqvist",
    email: "seed.lindqvist@kintsugi.invalid",
  },
] as const;

async function main() {
  for (const c of CONTRIBUTORS) {
    await prisma.user.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        mianziCredits: c.id === "seed_demo_owner" ? 120 : 40,
        totalReusesReceived: c.id === "seed_demo_owner" ? 4 : 0,
        contributorPercentile: c.id === "seed_demo_owner" ? 88 : 72,
      },
      update: { name: c.name },
    });
  }

  const assets = [
    {
      title: "Retail churn — feature pipeline",
      description:
        "End-to-end sklearn + SQL feature store stubs from a sunsetted loyalty analytics sprint.",
      category: "DATA_SCIENCE" as const,
      devHoursSaved: 42,
      contributorId: "seed_okonkwo",
      technicalGoldSummary:
        "Reusable transformation steps for RFM-style aggregates and leakage-safe CV splits.",
      postMortemSnippet:
        "Goal was predictive churn for a pilot region; sunsetted after retailer withdrew data share.",
      reuseCount: 18,
      featuredPostMortem: false,
    },
    {
      title: "Postgres schema — inventory microservice",
      description:
        "Migrations and constraints from a cancelled omnichannel rollout; production-hardened naming.",
      category: "ENGINEERING" as const,
      devHoursSaved: 28,
      contributorId: "seed_reyes",
      technicalGoldSummary:
        "Clear separation of stock reservations vs. committed orders; helpful CHECK patterns.",
      postMortemSnippet:
        "Scoped down when vendor integration slipped; schema remained the cleanest artifact.",
      reuseCount: 31,
      featuredPostMortem: true,
    },
    {
      title: "Accessible dashboard shell (React)",
      description:
        "Layout primitives and chart wrappers built for an academic cohort planner that never shipped.",
      category: "FRONTEND_MODULES" as const,
      devHoursSaved: 36,
      contributorId: "seed_demo_owner",
      technicalGoldSummary:
        "Keyboard-first navigation regions, sensible defaults for chart color contrast.",
      postMortemSnippet:
        "Funding ended after usability study; components were stable enough to open-source internally.",
      reuseCount: 4,
      featuredPostMortem: false,
    },
    {
      title: "EU mobility — TAM memo pack",
      description:
        "Structured interview guide + sizing workbook from a discontinued mobility marketplace thesis.",
      category: "MARKET_RESEARCH" as const,
      devHoursSaved: 22,
      contributorId: "seed_lindqvist",
      technicalGoldSummary:
        "Repeatable bottom-up market model with sensitivity tabs; strong citations template.",
      postMortemSnippet:
        "Partners chose a different vertical; research quality was cited by two later cohort projects.",
      reuseCount: 12,
      featuredPostMortem: true,
    },
  ];

  const titles = new Set(await prisma.salvagedAsset.findMany({ select: { title: true } }).then((rows) => rows.map((r) => r.title)));

  for (const a of assets) {
    if (titles.has(a.title)) continue;
    await prisma.salvagedAsset.create({
      data: {
        title: a.title,
        description: a.description,
        category: a.category,
        devHoursSaved: a.devHoursSaved,
        contributorId: a.contributorId,
        technicalGoldSummary: a.technicalGoldSummary,
        postMortemSnippet: a.postMortemSnippet,
        featuredPostMortem: a.featuredPostMortem,
        reuseCount: a.reuseCount,
      },
    });
  }

  const demoOwner = await prisma.user.findUnique({ where: { id: "seed_demo_owner" } });
  if (demoOwner && (await prisma.ledgerEntry.count({ where: { userId: demoOwner.id } })) === 0) {
    await prisma.ledgerEntry.createMany({
      data: [
        {
          userId: demoOwner.id,
          kind: "earn_reuse",
          delta: 30,
          label: "Community reuses on “Accessible dashboard shell”",
        },
        {
          userId: demoOwner.id,
          kind: "adjustment",
          delta: 90,
          label: "Opening balance — verified salvage history",
        },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
