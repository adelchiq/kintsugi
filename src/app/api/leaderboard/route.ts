import { buildPrototypeLeaderboard } from "@/lib/prototype-data";
import { preferPrototypeData } from "@/lib/prototype-mode";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (preferPrototypeData()) {
    return Response.json({
      entries: buildPrototypeLeaderboard(),
      source: "prototype" as const,
    });
  }

  try {
    const rows = await prisma.user.findMany({
      orderBy: { mianziCredits: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        mianziCredits: true,
      },
    });

    if (rows.length === 0) {
      return Response.json({
        entries: buildPrototypeLeaderboard(),
        source: "prototype" as const,
      });
    }

    const entries = rows.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      displayName: u.name ?? "Contributor",
      mianziCredits: u.mianziCredits,
    }));

    return Response.json({ entries, source: "database" as const });
  } catch (e) {
    console.error(e);
    return Response.json({
      entries: buildPrototypeLeaderboard(),
      source: "prototype" as const,
    });
  }
}
