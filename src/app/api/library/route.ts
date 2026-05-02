import { prisma } from "@/lib/prisma";
import { serializeAsset } from "@/lib/db/serialize";

export async function GET() {
  try {
    const rows = await prisma.salvagedAsset.findMany({
      include: { contributor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({
      assets: rows.map(serializeAsset),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "library_unavailable" }, { status: 503 });
  }
}
