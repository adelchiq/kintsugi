import { serializeAsset } from "@/lib/db/serialize";
import { preferPrototypeData } from "@/lib/prototype-mode";
import { PROTOTYPE_LIBRARY } from "@/lib/prototype-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (preferPrototypeData()) {
    return Response.json({
      assets: PROTOTYPE_LIBRARY,
      source: "prototype" as const,
    });
  }

  try {
    const rows = await prisma.salvagedAsset.findMany({
      include: { contributor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (rows.length === 0) {
      return Response.json({
        assets: PROTOTYPE_LIBRARY,
        source: "prototype" as const,
      });
    }

    return Response.json({
      assets: rows.map(serializeAsset),
      source: "database" as const,
    });
  } catch (e) {
    console.error(e);
    return Response.json({
      assets: PROTOTYPE_LIBRARY,
      source: "prototype" as const,
    });
  }
}
