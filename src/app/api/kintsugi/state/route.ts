import { auth } from "@/auth";
import { serializeLedger, serializeProfile } from "@/lib/db/serialize";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        assets: { select: { id: true } },
        ledgerEntries: { orderBy: { createdAt: "desc" }, take: 80 },
      },
    });

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = serializeProfile(user, user.assets.map((a) => a.id));
    const ledger = user.ledgerEntries.map(serializeLedger);

    return Response.json({ profile, ledger });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "state_unavailable" }, { status: 503 });
  }
}
