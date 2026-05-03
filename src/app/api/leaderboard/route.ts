import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const entries = rows.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      displayName: u.name ?? "Contributor",
      mianziCredits: u.mianziCredits,
    }));

    return Response.json({ entries });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "leaderboard_unavailable" }, { status: 503 });
  }
}
