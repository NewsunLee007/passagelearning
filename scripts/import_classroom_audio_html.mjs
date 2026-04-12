import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const [, , htmlPathArg, articleIdArg] = process.argv;

if (!htmlPathArg) {
  console.error("Usage: node scripts/import_classroom_audio_html.mjs <html-path> [article-id]");
  process.exit(1);
}

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const htmlPath = join(process.cwd(), htmlPathArg);
const contentDir = join(rootDir, "public", "content");
const html = readFileSync(htmlPath, "utf8");

const dataMatch = html.match(/const data = (\{[\s\S]*?\n\s*\});\n\n\s*let state =/);
if (!dataMatch) {
  console.error("Unable to locate `const data = {...}` block in html.");
  process.exit(1);
}

const classroomData = vm.runInNewContext(`(${dataMatch[1]})`);

function normalizeText(value) {
  return String(value)
    .replace(/[“”"']/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*([,.!?;:])\s*/g, "$1")
    .trim()
    .toLowerCase();
}

function normalizeWord(value) {
  return String(value).trim().toLowerCase();
}

function parseSpecialWordAudio(source) {
  const overrides = new Map();
  const regex = /if\(w === '([^']+)'\)\s*\{\s*document\.getElementById\('w-audio'\)\.onclick = \(\) => new Audio\('([^']+)'\)\.play\(\);\s*\}/g;
  let match;
  while ((match = regex.exec(source))) {
    overrides.set(match[1], match[2]);
  }
  return overrides;
}

function findBestArticleId() {
  let best = { id: "", score: -1 };
  const sourceSentenceSet = new Set(classroomData.sentences.map((sentence) => normalizeText(sentence.text)));

  for (const file of readdirSync(contentDir).filter((name) => name.endsWith(".json") && name !== "index.json")) {
    const payload = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
    const score = (payload.sentences ?? []).reduce((count, sentence) => count + Number(sourceSentenceSet.has(normalizeText(sentence.text))), 0);
    if (score > best.score) {
      best = { id: payload.article?.id ?? file.replace(/\.json$/, ""), score };
    }
  }

  return best.id;
}

const articleId = articleIdArg || findBestArticleId();
const articlePath = join(contentDir, `${articleId}.json`);
const article = JSON.parse(readFileSync(articlePath, "utf8"));

const sentenceAudioMap = new Map(classroomData.sentences.map((sentence) => [normalizeText(sentence.text), sentence.a]));
const specialWordAudio = parseSpecialWordAudio(html);

let matchedCount = 0;
article.sentences = (article.sentences ?? []).map((sentence) => {
  const audioUrl = sentenceAudioMap.get(normalizeText(sentence.text));
  if (audioUrl) {
    matchedCount += 1;
    return { ...sentence, audioUrl };
  }
  return sentence;
});

const nextLexicon = { ...(article.lexicon ?? {}) };
for (const [word, info] of Object.entries(classroomData.vocabulary ?? {})) {
  nextLexicon[normalizeWord(word)] = {
    phonetic: info.p,
    pos: info.pos,
    meaningZh: info.m,
    ...(specialWordAudio.has(word) ? { audioUrlOverride: specialWordAudio.get(word) } : {})
  };
}

article.lexicon = nextLexicon;
article.meta = {
  ...(article.meta ?? {}),
  audioImportedFrom: htmlPathArg
};

writeFileSync(articlePath, `${JSON.stringify(article, null, 2)}\n`);

console.log(`Imported classroom audio into ${articleId}. Matched ${matchedCount}/${article.sentences.length} sentences.`);
