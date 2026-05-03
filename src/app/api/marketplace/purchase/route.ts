import { auth } from "@/auth";
import { getListing } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let listingId: string | undefined;
  try {
    const body = (await req.json()) as { listingId?: string };
    listingId = body.listingId;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const listing = listingId ? getListing(listingId) : undefined;
  if (!listing) {
    return Response.json({ error: "unknown_listing" }, { status: 400 });
  }

  const price = listing.priceMianzi;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      if (user.mianziCredits < price) {
        throw Object.assign(new Error("insufficient"), { code: "insufficient" });
      }

      await tx.user.update({
        where: { id: userId },
        data: { mianziCredits: { decrement: price } },
      });

      await tx.ledgerEntry.create({
        data: {
          userId,
          kind: "marketplace_purchase",
          delta: -price,
          label: `Marketplace · ${listing.title}`,
        },
      });
    });

    return Response.json({
      ok: true,
      fulfillment: listing.fulfillment,
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "insufficient") {
      return Response.json(
        { error: "insufficient", message: "Not enough Mianzi credits for this listing." },
        { status: 400 },
      );
    }
    console.error(e);
    return Response.json({ error: "purchase_failed" }, { status: 503 });
  }
}
