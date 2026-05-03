/**
 * Server-side salvage quality gate: rejects empty noise, gibberish, and non-substantive uploads
 * so the Legacy Library stays high-signal.
 */

export interface SalvageQualityInput {
  fileName: string;
  fileContent: string;
  technicalGoldSummary: string;
  postMortemSnippet: string;
}

export interface SalvageQualityResult {
  ok: boolean;
  reasons: string[];
}

const PLACEHOLDER = /\b(lorem ipsum|asdf|test test test|xxxx|aaa+)\b/i;

export function assessSalvageQuality(input: SalvageQualityInput): SalvageQualityResult {
  const reasons: string[] = [];
  const file = input.fileContent.trim();
  const gold = input.technicalGoldSummary.trim();
  const pm = input.postMortemSnippet.trim();
  const name = (input.fileName || "upload").toLowerCase();

  if (gold.length < 90) {
    reasons.push(
      "Technical gold summary is too thin — run Auto-Doc or describe concrete reusable patterns.",
    );
  }

  if (pm.length < 50) {
    reasons.push("Post-mortem is too brief to contextualize the salvage.");
  }

  if (PLACEHOLDER.test(gold) || PLACEHOLDER.test(pm)) {
    reasons.push("Placeholder or filler language detected.");
  }

  const noUpload = !/\S/.test(file);

  if (noUpload) {
    if (gold.length < 280 || gold.split(/\n/).filter(Boolean).length < 3) {
      reasons.push(
        "No source file was uploaded — provide a richer Auto-Doc summary (multiple concrete bullets) or attach the artifact.",
      );
    }
  } else {
    if (file.length < 120) {
      reasons.push(
        "Source text is too short to represent a real artifact (min ~120 characters).",
      );
    }

    if (PLACEHOLDER.test(file)) {
      reasons.push("Placeholder or filler language detected in the uploaded source.");
    }

    const sample = file.slice(0, 2500);
    if (sample.length > 80) {
      const unique = new Set(sample.replace(/\s/g, "")).size;
      if (unique < 10) {
        reasons.push("Very low character diversity — likely gibberish or filler.");
      }
    }

    if (/(.)\1{30,}/m.test(file)) {
      reasons.push("Extreme character repetition suggests junk rather than a real artifact.");
    }

    const ext = name.includes(".") ? name.split(".").pop() ?? "" : "";
    const codeLike = new Set([
      "py",
      "sql",
      "ts",
      "tsx",
      "js",
      "jsx",
      "rs",
      "go",
      "java",
      "r",
      "ipynb",
    ]);
    if (codeLike.has(ext) && file.length > 200) {
      const hasStructure =
        /\b(def |class |import |from |SELECT|CREATE|TABLE|function |export |const |async )\b/i.test(
          file,
        );
      if (!hasStructure) {
        reasons.push(
          "Code-like extension but no recognizable structure (imports, defs, queries, exports).",
        );
      }
    }
  }

  return { ok: reasons.length === 0, reasons };
}
