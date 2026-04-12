import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized user");
    }

    // 2. Check if user is teacher
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "teacher") {
      throw new Error("Only teachers can generate articles");
    }

    // 3. Parse request body
    const { text, title, unit } = await req.json();

    if (!text || text.length < 50) {
      throw new Error("Text is too short or empty.");
    }

    // 4. Call DeepSeek API
    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekKey) {
      throw new Error("DeepSeek API key is not configured.");
    }

    const systemPrompt = `You are an expert English teacher. Your task is to process an English article and return a JSON object with the following structure:
{
  "article": { "title": "...", "unit": "..." },
  "sentences": [
    {
      "en": "English sentence.",
      "tr": "Chinese translation.",
      "g": "Grammar analysis.",
      "d": "Detailed explanation.",
      "audioUrl": ""
    }
  ],
  "lexicon": {
    "word": {
      "phonetic": "/wɜːd/",
      "pos": "n.",
      "meaningZh": "词"
    }
  },
  "readingQuestions": [
    {
      "id": "q1",
      "type": "single_choice",
      "question": "What is the main idea?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "...",
      "quoteReference": "English sentence."
    }
  ]
}

Please provide 2-3 reading comprehension questions and 5-10 words for the lexicon.`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${deepseekKey}\`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: \`Title: \${title}\\nUnit: \${unit}\\n\\nText:\\n\${text}\` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`DeepSeek API error: \${errorText}\`);
    }

    const aiData = await response.json();
    const contentText = aiData.choices[0].message.content;
    const resultJson = JSON.parse(contentText);

    return new Response(JSON.stringify({ success: true, data: resultJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
