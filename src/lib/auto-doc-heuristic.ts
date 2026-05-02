/** Fallback summary when no LLM key is configured. */
export function heuristicTechnicalGold(content: string, fileName: string): string {
  const trimmed = content.trim().slice(0, 8000);
  const lines = trimmed.split(/\r?\n/).filter(Boolean).slice(0, 40);
  const bullets: string[] = [];

  const mentionsSql =
    /\b(SELECT|FROM|WHERE|CREATE\s+TABLE|INSERT\s+INTO|JOIN)\b/i.test(trimmed);
  const mentionsPy =
    /\.py$/i.test(fileName) ||
    /\b(def |import |class |pandas|numpy|torch|sklearn)\b/.test(trimmed);
  const mentionsReact =
    /\.(tsx|jsx)$/i.test(fileName) ||
    /\b(useState|useEffect|export\s+default\s+function|React)\b/.test(trimmed);

  if (mentionsSql) {
    bullets.push("Contains SQL-shaped structure — candidate tables, joins, or migrations to harvest.");
  }
  if (mentionsPy) {
    bullets.push("Python signals detected — note functions, imports, and data flow for reuse.");
  }
  if (mentionsReact) {
    bullets.push("UI component patterns may be extractable (hooks, composition, accessibility props).");
  }

  const snippet =
    lines.slice(0, 6).join("\n").slice(0, 420) +
    (trimmed.length > 420 ? "\n…" : "");

  const tail =
    bullets.length > 0
      ? bullets.map((b) => `• ${b}`).join("\n")
      : "• Scan manually for modular boundaries, naming discipline, and test stubs.";

  return [
    `Auto-scan of “${fileName}” (${trimmed.length} chars analyzed).`,
    "",
    "Preview:",
    "```",
    snippet,
    "```",
    "",
    tail,
    "",
    "Tip: Replace this stub by configuring OPENAI_API_KEY for full AI Auto-Doc.",
  ].join("\n");
}
