import { heuristicTechnicalGold } from "@/lib/auto-doc-heuristic";

export const runtime = "nodejs";

async function summarizeWithOpenAI(content: string, fileName: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing key");

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You write concise technical documentation for salvaged code and research artifacts. Output 3–6 bullets titled 'Technical Gold' describing reusable patterns, APIs, schemas, or methodology. No fluff.",
        },
        {
          role: "user",
          content: `File name: ${fileName}\n\n---\n${content.slice(0, 24000)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty completion");
  return text;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { content?: string; fileName?: string };
    const content = typeof body.content === "string" ? body.content : "";
    const fileName = typeof body.fileName === "string" ? body.fileName : "upload.txt";

    if (!content.trim()) {
      return Response.json(
        { error: "content required", summary: heuristicTechnicalGold("", fileName) },
        { status: 400 },
      );
    }

    try {
      const summary = await summarizeWithOpenAI(content, fileName);
      return Response.json({ summary, source: "openai" });
    } catch {
      const summary = heuristicTechnicalGold(content, fileName);
      return Response.json({ summary, source: "heuristic", fallback: true });
    }
  } catch {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
}
