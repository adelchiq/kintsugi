import type { SalvagedAsset } from "./types";

export function buildDocMarkdown(asset: SalvagedAsset): string {
  return [
    `# ${asset.title}`,
    "",
    `**Category:** ${asset.category}`,
    `**Development time saved (est.):** ~${asset.devHoursSaved} hours`,
    "",
    "## Technical gold",
    asset.technicalGoldSummary,
    "",
    "## Post-mortem",
    asset.postMortemSnippet,
    "",
    "---",
    `_Exported from Kintsugi · ${asset.id}_`,
  ].join("\n");
}

export function buildPersonalizationPrompt(asset: SalvagedAsset): string {
  return [
    "You are helping a student adapt a salvaged asset for a new course or internship project.",
    "",
    `Asset title: "${asset.title}"`,
    `Domain: ${asset.category}`,
    "",
    "Technical gold (what is reusable):",
    asset.technicalGoldSummary,
    "",
    "Lesson from sunset / post-mortem:",
    asset.postMortemSnippet,
    "",
    "Task: Produce (1) a 5-bullet adaptation plan for my stack and timeline,",
    "(2) a minimal integration checklist, and (3) three risks to validate early.",
    "Ask clarifying questions only if blocking.",
  ].join("\n");
}

export const NOTION_NEW_PAGE = "https://www.notion.so/new";
export const GOOGLE_DOCS_NEW = "https://docs.google.com/document/create";
