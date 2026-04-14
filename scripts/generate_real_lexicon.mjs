import fs from "fs";
import path from "path";

const apiKey = "sk-4ba39acf4f014ea78677a6d55571d023";
const baseUrl = "https://api.deepseek.com";
const contentDir = path.join(process.cwd(), "public/content");
const files = fs.readdirSync(contentDir).filter(f => f.endsWith("-article.json"));

async function processFiles() {
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!data.vocabItems || data.vocabItems.length === 0) continue;

    const wordsToFetch = {};
    for (const item of data.vocabItems) {
      // Skip if it already looks like it has real generated data (not the mock "暂无" text)
      if (data.lexicon && data.lexicon[item.term] && !data.lexicon[item.term].usageZh?.includes("暂无")) {
        continue;
      }
      wordsToFetch[item.term] = item.meaningZh;
    }

    if (Object.keys(wordsToFetch).length === 0) {
      console.log(`Skipping ${file}, all words already have real lexicon data.`);
      continue;
    }

    console.log(`Fetching real lexicon for ${file} (${Object.keys(wordsToFetch).length} words)...`);

    const prompt = `You are a middle school English teacher. Provide phonetic, part of speech (pos), usageZh (collocations/grammar, in Chinese, concise), and an example sentence (with Chinese translation) for the following words.
    Return ONLY a valid JSON object where keys are the words.
    Example output:
    {
      "chocolate": {
        "phonetic": "/ˈtʃɒklət/",
        "pos": "n.",
        "meaningZh": "巧克力",
        "usageZh": "常见搭配：a bar of chocolate (一块巧克力)",
        "example": "She bought a box of chocolates. (她买了一盒巧克力。)"
      }
    }
    Input words:
    ${JSON.stringify(wordsToFetch, null, 2)}`;

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }]
        })
      });

      const resData = await res.json();
      const content = resData.choices[0].message.content;
      const parsed = JSON.parse(content);

      if (!data.lexicon) data.lexicon = {};
      for (const [word, info] of Object.entries(parsed)) {
        data.lexicon[word] = {
          ...(data.lexicon[word] || {}),
          ...info
        };
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`Updated ${file} successfully.`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  console.log("All done!");
}

processFiles();
