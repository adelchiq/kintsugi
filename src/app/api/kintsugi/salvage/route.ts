import { auth } from "@/auth";
import { categoryToDb } from "@/lib/db/map-enums";
import { prisma } from "@/lib/prisma";
import { assessSalvageQuality } from "@/lib/salvage-quality";
import type { SalvagePayload } from "@/lib/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SalvagePayload;
  try {
    body = (await req.json()) as SalvagePayload;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    !body?.title?.trim() ||
    !body?.technicalGoldSummary?.trim() ||
    !body?.postMortemSnippet?.trim()
  ) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const quality = assessSalvageQuality({
    fileName: body.fileName ?? "upload.txt",
    fileContent: body.fileContent ?? "",
    technicalGoldSummary: body.technicalGoldSummary,
    postMortemSnippet: body.postMortemSnippet,
  });

  if (!quality.ok) {
    return Response.json(
      { error: "low_quality", reasons: quality.reasons },
      { status: 422 },
    );
  }

  const brilliantOriginal = !!body.brilliantOriginal;

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const asset = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          brilliantOriginalFlag:
            user.brilliantOriginalFlag || brilliantOriginal,
        },
      });

      const created = await tx.salvagedAsset.create({
        data: {
          title: body.title.trim(),
          description: body.description.trim().slice(0, 2000),
          category: categoryToDb(body.category),
          devHoursSaved: Math.max(1, Math.round(Number(body.devHoursSaved)) || 1),
          technicalGoldSummary: body.technicalGoldSummary.trim(),
          postMortemSnippet: body.postMortemSnippet.trim(),
          featuredPostMortem: brilliantOriginal,
          contributorId: session.user.id,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          userId: session.user.id,
          kind: "salvage_submitted",
          delta: 0,
          label: `Salvage submitted — “${created.title}” pending library indexing`,
          assetId: created.id,
        },
      });

      return created;
    });

    return Response.json({ ok: true, assetId: asset.id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "salvage_failed" }, { status: 503 });
  }
}
