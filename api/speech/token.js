import { methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return methodNotAllowed(res, ["GET", "POST"]);
  }

  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!subscriptionKey || !region) {
    return sendError(res, 500, "Server is not configured for Azure Speech. Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION.");
  }

  try {
    const response = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Azure returned ${response.status}: ${text}`);
    }

    const token = await response.text();
    return sendJson(res, 200, { token, region });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to generate speech token");
  }
}
