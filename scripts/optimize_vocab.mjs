import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFiles = [
  "../外研版七年级下册_全册词表_导入版.csv",
  "../外研版八年级下册_全册词表_导入版.csv"
];

const targetVocab = new Map(); // lowercase_word -> row

for (const file of csvFiles) {
  const p = path.resolve(process.cwd(), file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, "utf-8");
    const records = parse(content, { columns: true, skip_empty_lines: true });
    for (const record of records) {
      const word = record["单词"];
      if (word) {
        targetVocab.set(word.trim().toLowerCase(), record);
      }
    }
  } else {
    console.warn(`CSV file not found: ${p}`);
  }
}

console.log(`Loaded ${targetVocab.size} core vocabulary words from CSVs.`);

const contentDir = path.join(process.cwd(), "public/content");
const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".json") && f !== "article-demo.json");

function normalizeWord(token) {
  return token.replace(/[.,!?;:—"“”'’()[\]{}*]+$/g, "").replace(/^[("“”'’]+/g, "").toLowerCase();
}

let updatedFiles = 0;

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 1. Collect all normalized tokens from the article
  const articleTokens = new Set();
  const tokenToSentenceId = new Map();

  if (!data.sentences) continue;

  for (const s of data.sentences) {
    const tokens = s.text.split(/\s+/);
    for (const t of tokens) {
      const w = normalizeWord(t);
      if (w) {
        articleTokens.add(w);
        if (!tokenToSentenceId.has(w)) {
          tokenToSentenceId.set(w, s.id);
        }
      }
    }
  }

  // 2. Find intersection with CSV target vocab
  const coreWordsInArticle = new Set();
  for (const w of articleTokens) {
    if (targetVocab.has(w)) coreWordsInArticle.add(w);
    // basic lemmatization matching
    else if (w.endsWith("s") && targetVocab.has(w.slice(0, -1))) coreWordsInArticle.add(w.slice(0, -1));
    else if (w.endsWith("es") && targetVocab.has(w.slice(0, -2))) coreWordsInArticle.add(w.slice(0, -2));
    else if (w.endsWith("ed") && targetVocab.has(w.slice(0, -2))) coreWordsInArticle.add(w.slice(0, -2));
    else if (w.endsWith("ing") && targetVocab.has(w.slice(0, -3))) coreWordsInArticle.add(w.slice(0, -3));
  }

  // 3. Keep existing phrases
  const existingPhrases = (data.vocabItems || []).filter(item => item.term.includes(" ") || item.term.includes("-"));
  
  // 4. Build new vocabItems
  const newVocabItems = [...existingPhrases];
  const addedSet = new Set(newVocabItems.map(x => x.term.toLowerCase()));

  for (const cw of coreWordsInArticle) {
    if (addedSet.has(cw)) continue;
    
    // Check if we already had it in the old vocabItems to reuse translation
    const oldItem = (data.vocabItems || []).find(x => x.term.toLowerCase() === cw);
    const csvRow = targetVocab.get(cw);
    
    // Find an example sentence ID (either from old item, or find a new one)
    let sid = oldItem?.exampleSentenceId;
    if (!sid) {
      // Find a sentence containing this word or its variant
      for (const s of data.sentences) {
        const tokens = s.text.split(/\s+/).map(normalizeWord);
        if (tokens.includes(cw) || tokens.includes(cw + "s") || tokens.includes(cw + "ed") || tokens.includes(cw + "ing")) {
          sid = s.id;
          break;
        }
      }
    }

    newVocabItems.push({
      term: cw,
      meaningZh: oldItem?.meaningZh || csvRow?.["中文释义"] || "",
      exampleSentenceId: sid
    });
    addedSet.add(cw);
  }

  data.vocabItems = newVocabItems;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  updatedFiles++;
}

console.log(`Successfully optimized vocabItems for ${updatedFiles} articles.`);
