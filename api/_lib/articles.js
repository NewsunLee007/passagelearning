export function mergeArticleContent(row, versionContent) {
  const content = versionContent || row.content_json || {};
  const article = content.article || {};
  return {
    ...content,
    article: {
      ...article,
      id: row.id,
      title: row.title,
      unit: row.unit || article.unit || "",
      coverUrl: row.cover_url || article.coverUrl || ""
    }
  };
}

export function hasArticleSupport(content) {
  const sentences = content?.sentences ?? [];
  const lexicon = content?.lexicon ?? {};
  if (!sentences.length) return false;
  const supportedSentences = sentences.filter((sentence) => sentence?.tr && sentence?.g && sentence?.d).length;
  return supportedSentences >= Math.ceil(sentences.length * 0.8) && Object.keys(lexicon).length > 0;
}

export function mergeArticleSupport(content, support) {
  if (!support) return content;

  const supportSentences = new Map((support.sentences ?? []).map((sentence) => [sentence.id, sentence]));
  const mergedSentences = (content.sentences ?? []).map((sentence) => {
    const next = supportSentences.get(sentence.id);
    return next
      ? {
          ...sentence,
          tr: next.tr ?? sentence.tr,
          g: next.g ?? sentence.g,
          d: next.d ?? sentence.d,
          audioUrl: next.audioUrl ?? sentence.audioUrl
        }
      : sentence;
  });

  return {
    ...content,
    meta: {
      ...(content.meta ?? {}),
      ...(support.meta ?? {})
    },
    sentences: mergedSentences,
    lexicon: {
      ...(content.lexicon ?? {}),
      ...(support.lexicon ?? {})
    }
  };
}

export function pickArticleSupport(content) {
  return {
    meta: {
      supportGeneratedAt: content?.meta?.supportGeneratedAt ?? null
    },
    sentences: (content?.sentences ?? []).map((sentence) => ({
      id: sentence.id,
      tr: sentence.tr ?? "",
      g: sentence.g ?? "",
      d: sentence.d ?? "",
      audioUrl: sentence.audioUrl ?? ""
    })),
    lexicon: content?.lexicon ?? {}
  };
}

export async function generateArticleSupport(content) {
  const apiKey = process.env.DEEPSEEK_API_KEY || "";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY.");
  }

  const sentences = (content.sentences ?? []).map((sentence) => ({
    id: sentence.id,
    text: sentence.text,
    paragraphId: sentence.paragraphId
  }));

  const vocabHints = (content.vocabItems ?? []).map((item) => ({
    term: item.term,
    meaningZh: item.meaningZh,
    exampleSentenceId: item.exampleSentenceId ?? ""
  }));

  const systemPrompt = `You are an expert English textbook editor. Return valid JSON only.
The JSON shape must be:
{
  "meta": { "supportGeneratedAt": "ISO string" },
  "sentences": [
    { "id": "s1", "tr": "简明自然的中文译文", "g": "简洁句式标签", "d": "用中文解释这句的结构重点和表达作用，50字以内" }
  ],
  "lexicon": {
    "word or phrase": {
      "phonetic": "/.../",
      "pos": "词性缩写",
      "meaningZh": "中文义项",
      "usageZh": "中文用法提示，30字以内",
      "example": "英文例句"
    }
  }
}
Rules:
- Cover every sentence id provided.
- Keep translations concise and natural for middle-school students.
- g should be brief labels like "主系表" "复合句" "祈使句" "主谓宾".
- d must explain the sentence, not repeat the translation.
- Use the provided vocabulary hints first, and add other high-value words only when necessary.
- Do not include markdown fences or commentary.`;

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
        {
          role: "user",
          content: JSON.stringify(
            {
              article: {
                id: content.article?.id,
                title: content.article?.title,
                unit: content.article?.unit
              },
              sentences,
              vocabHints
            },
            null,
            2
          )
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek request failed: ${detail}`);
  }

  const data = await response.json();
  const generated = data?.choices?.[0]?.message?.content;
  if (!generated) {
    throw new Error("DeepSeek returned an empty response.");
  }

  return JSON.parse(generated);
}
