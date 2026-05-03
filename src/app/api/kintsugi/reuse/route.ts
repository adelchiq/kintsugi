import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CREDITS_PER_REUSE } from "@/lib/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let assetId: string | undefined;
  try {
    const body = (await req.json()) as { assetId?: string };
    assetId = body.assetId;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!assetId?.trim()) {
    return Response.json({ error: "missing assetId" }, { status: 400 });
  }

  const sessionUserId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const asset = await tx.salvagedAsset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw Object.assign(new Error("not_found"), { code: "not_found" });
      }

      if (asset.contributorId === sessionUserId) {
        throw Object.assign(new Error("self_reuse"), { code: "self_reuse" });
      }

      const contributor = await tx.user.findUnique({
        where: { id: asset.contributorId },
      });

      if (!contributor) {
        throw Object.assign(new Error("contributor_missing"), {
          code: "contributor_missing",
        });
      }

      const newTotal = contributor.totalReusesReceived + 1;

      await tx.salvagedAsset.update({
        where: { id: asset.id },
        data: { reuseCount: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: asset.contributorId },
        data: {
          mianziCredits: { increment: CREDITS_PER_REUSE },
          totalReusesReceived: newTotal,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          userId: asset.contributorId,
          kind: "earn_reuse",
          delta: CREDITS_PER_REUSE,
          label: `Reuse recorded — “${asset.title}” (+${CREDITS_PER_REUSE} Mianzi)`,
          assetId: asset.id,
        },
      });
    });

    return Response.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "not_found") {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    if (err.code === "self_reuse") {
      return Response.json(
        { error: "self_reuse", message: "Community reuse only — pick another salvage." },
        { status: 400 },
      );
    }
    console.error(e);
    return Response.json({ error: "reuse_failed" }, { status: 503 });
  }
}
