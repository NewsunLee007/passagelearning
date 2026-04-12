import { ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";
import { requireTeacher } from "../_lib/teacherAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireTeacher(req, res)) return;

  try {
    const { text = "", title = "", unit = "" } = await ensureBody(req);
    if (String(text).trim().length < 50) {
      return sendError(res, 400, "Text is too short.");
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || "";
    const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    if (!apiKey) return sendError(res, 500, "Missing DEEPSEEK_API_KEY.");

    const systemPrompt = `You are an expert English teacher. Return valid JSON only.
The top-level JSON shape must be:
{
  "article": { "title": "...", "unit": "...", "paragraphs": [{ "id": "p1", "sentenceIds": ["s1"] }] },
  "sentences": [{ "id": "s1", "text": "...", "paragraphId": "p1", "tr": "...", "g": "...", "d": "...", "audioUrl": "" }],
  "lexicon": { "word": { "phonetic": "...", "pos": "...", "meaningZh": "..." } },
  "readingQuestions": [{ "id": "rq1", "type": "single_choice", "stem": "...", "options": ["A", "B", "C", "D"], "answer": "A", "rationaleZh": "...", "evidenceSentenceIds": ["s1"] }]
}
Keep IDs stable and references valid. Include 5-10 lexicon entries and 3-5 reading questions.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Title: ${title}\nUnit: ${unit}\n\nText:\n${text}` }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return sendError(res, 502, `DeepSeek request failed: ${detail}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return sendError(res, 502, "DeepSeek returned an empty response.");

    return sendJson(res, 200, { data: JSON.parse(content) });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to generate article.");
  }
}

