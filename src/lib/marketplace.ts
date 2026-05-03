export type MarketplaceCategory = "ai" | "cloud" | "other";

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  /** Price in Mianzi credits */
  priceMianzi: number;
  /** Human-readable fulfillment note */
  fulfillment: string;
}

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: "openai-20",
    title: "OpenAI API · $20 equivalent",
    description:
      "Redeem Mianzi for platform-issued API credits toward GPT-class models. Fulfillment is manual or partner webhook in production.",
    category: "ai",
    priceMianzi: 420,
    fulfillment: "Voucher code emailed within 2 business days (demo: ledger + toast only).",
  },
  {
    id: "anthropic-20",
    title: "Anthropic API · $20 equivalent",
    description: "Claude-family tokens for research pipelines and Auto-Doc style workflows.",
    category: "ai",
    priceMianzi: 440,
    fulfillment: "Partner redemption queue (demo ledger entry).",
  },
  {
    id: "aws-50",
    title: "AWS credits · $50 bundle",
    description:
      "Applies to compute and storage for salvaged pipelines you redeploy. Issued as promo credit where eligible.",
    category: "cloud",
    priceMianzi: 780,
    fulfillment: "AWSMP or direct grant — ops confirms account (demo).",
  },
  {
    id: "azure-50",
    title: "Azure credits · $50 bundle",
    description: "For Functions, Container Apps, or Postgres used by adapted salvages.",
    category: "cloud",
    priceMianzi: 760,
    fulfillment: "Azure Cost Management grant workflow (demo).",
  },
  {
    id: "gcp-50",
    title: "Google Cloud · $50 credit",
    description: "BigQuery / Cloud Run hours for data-science salvages from the library.",
    category: "cloud",
    priceMianzi: 750,
    fulfillment: "Billing account credit — subject to eligibility (demo).",
  },
];

export function getListing(id: string): MarketplaceListing | undefined {
  return MARKETPLACE_LISTINGS.find((l) => l.id === id);
}
