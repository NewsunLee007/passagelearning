import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const workspaceDir = fileURLToPath(new URL("../..", import.meta.url));
const contentDir = join(rootDir, "public", "content");

const SOURCES = [
  {
    bookId: "g7b",
    bookLabel: "七年级下册",
    bookShortLabel: "7下",
    sourceLabel: "【上好课】七年级英语下册交互式动画（互动课文）（新教材外研版）-1",
    items: [
      {
        id: "u3-article",
        file: "Unit 1 Passage 1 Poor in things, rich in love（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Poor in things, rich in love",
        unitNumber: 1,
        unitTheme: "The secrets of happiness",
        unitLabel: "Unit 1 The secrets of happiness",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从《查理和巧克力工厂》里的家庭故事，理解“贫穷但充满爱”的幸福感。",
        bookOrder: 210
      },
      {
        id: "u4-article",
        file: "Unit 1 Passage 2 Growing happiness（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Growing happiness",
        unitNumber: 1,
        unitTheme: "The secrets of happiness",
        unitLabel: "Unit 1 The secrets of happiness",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "通过周健捐发做假发的故事，感受帮助他人带来的幸福。",
        bookOrder: 211
      },
      {
        id: "u6-article",
        file: "Unit 2 Passage 1 Last but not least（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Last but not least",
        unitNumber: 2,
        unitTheme: "Go for it!",
        unitLabel: "Unit 2 Go for it!",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "北京马拉松终点线前的坚持，展现永不放弃的体育精神。",
        bookOrder: 220
      },
      {
        id: "u7-article",
        file: "Unit 2 Passage 2 The Steel Roses of China（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "The Steel Roses of China",
        unitNumber: 2,
        unitTheme: "Go for it!",
        unitLabel: "Unit 2 Go for it!",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "回望中国女足逆转夺冠，理解荣誉背后的长期奋斗。",
        bookOrder: 221
      },
      {
        id: "u8-article",
        file: "Unit 3 Passage 1 Delicious memories（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Delicious memories",
        unitNumber: 3,
        unitTheme: "Food matters",
        unitLabel: "Unit 3 Food matters",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从家常食物唤起的记忆，理解食物与情感的联系。",
        bookOrder: 230
      },
      {
        id: "u9-article",
        file: "Unit 3 Passage 2 Food across borders（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Food across borders",
        unitNumber: 3,
        unitTheme: "Food matters",
        unitLabel: "Unit 3 Food matters",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "追溯冰淇淋、番茄和马铃薯的传播，理解食物跨文化流动。",
        bookOrder: 231
      },
      {
        id: "u10-article",
        file: "Unit 4 Passage 1 All work and no play makes Jack a dull boy（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "All work and no play makes Jack a dull boy",
        unitNumber: 4,
        unitTheme: "The art of having fun",
        unitLabel: "Unit 4 The art of having fun",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在孤岛想象和日常生活中讨论“休闲”的价值。",
        bookOrder: 240
      },
      {
        id: "u11-article",
        file: "Unit 4 Passage 2 The time-eating monster（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "The time-eating monster",
        unitNumber: 4,
        unitTheme: "The art of having fun",
        unitLabel: "Unit 4 The art of having fun",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "识别吞噬时间的娱乐陷阱，学习保持有节制的快乐。",
        bookOrder: 241
      },
      {
        id: "u12-article",
        file: "Unit 5 Passage 1 Colors of my hometown（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Colours of my hometown",
        unitNumber: 5,
        unitTheme: "Amazing nature",
        unitLabel: "Unit 5 Amazing nature",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "用色彩描绘青藏高原故乡景象，感受自然之美。",
        bookOrder: 250
      },
      {
        id: "u13-article",
        file: "Unit 5 Passage 2 Natural wonders crying aloud for help（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Natural wonders crying aloud for help",
        unitNumber: 5,
        unitTheme: "Amazing nature",
        unitLabel: "Unit 5 Amazing nature",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "借死海、马达加斯加雨林与冰川的第一人称“呼救”，理解生态危机。",
        bookOrder: 251
      },
      {
        id: "u14-article",
        file: "Unit 6 Passage 1 Hot and Cool（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Hot and cool",
        unitNumber: 6,
        unitTheme: "Hitting the road",
        unitLabel: "Unit 6 Hitting the road",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在成都与青城山之间切换，体验旅途中的冷热反差。",
        bookOrder: 260
      },
      {
        id: "u15-article",
        file: "Unit 6 Passage 2 Exploring the unexplored（互动课文教学动画）英语新教材外研版七年级下册.html",
        title: "Exploring the unexplored",
        unitNumber: 6,
        unitTheme: "Hitting the road",
        unitLabel: "Unit 6 Hitting the road",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从徐霞客的行走人生，理解探索未知的勇气与价值。",
        bookOrder: 261
      }
    ]
  },
  {
    bookId: "g8b",
    bookLabel: "八年级下册",
    bookShortLabel: "8下",
    sourceLabel: "【上好课】八年级英语下册交互式动画（互动课文）（新教材外研版）-1",
    items: [
      {
        id: "g8b-u1-p1",
        file: "Unit 1 Passage 1 Saying goodbye to my years up high（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "Saying goodbye to my years up high",
        unitNumber: 1,
        unitTheme: "成长与未来",
        unitLabel: "Unit 1 成长与未来",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在回望过往经历的告别演讲中梳理成长和幸福感。",
        bookOrder: 410
      },
      {
        id: "g8b-u1-p2",
        file: "Unit 1 Passage 2 From mouse catcher to space tour guide...（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "From mouse catcher to space tour guide...",
        unitNumber: 1,
        unitTheme: "成长与未来",
        unitLabel: "Unit 1 成长与未来",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从童年兴趣到职业想象，理解梦想是如何被慢慢打开的。",
        bookOrder: 411
      },
      {
        id: "g8b-u2-p1",
        file: "Unit 2 Passage 1 You just don't get me!（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "You just don't get me!",
        unitNumber: 2,
        unitTheme: "沟通与坚持",
        unitLabel: "Unit 2 沟通与坚持",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "围绕误解与沟通，学习如何理解他人与表达自己。",
        bookOrder: 420
      },
      {
        id: "g8b-u2-p2",
        file: "Unit 2 Passage 2 From Pain to Gain（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "From Pain to Gain",
        unitNumber: 2,
        unitTheme: "沟通与坚持",
        unitLabel: "Unit 2 沟通与坚持",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从疼痛到收获，理解坚持训练之后的成长和回报。",
        bookOrder: 421
      },
      {
        id: "g8b-u3-p1",
        file: "Unit 3 Passage 1 What can I do（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "What can I do",
        unitNumber: 3,
        unitTheme: "行动与团队",
        unitLabel: "Unit 3 行动与团队",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "面对真实问题时思考“我能做什么”，把责任转化为行动。",
        bookOrder: 430
      },
      {
        id: "g8b-u3-p2",
        file: "Unit 3 Passage 2 No I in team（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "No I in team",
        unitNumber: 3,
        unitTheme: "行动与团队",
        unitLabel: "Unit 3 行动与团队",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "通过团队故事理解合作、分工和共同目标的意义。",
        bookOrder: 431
      },
      {
        id: "g8b-u4-p1",
        file: "Unit 4 Passage 1 Adding some colour（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "Adding some colour",
        unitNumber: 4,
        unitTheme: "创意与善意",
        unitLabel: "Unit 4 创意与善意",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "通过色彩和创意表达，为日常生活增添温度与活力。",
        bookOrder: 440
      },
      {
        id: "g8b-u4-p2",
        file: "Unit 4 Passage 2 Circle of Goodwill（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "Circle of Goodwill",
        unitNumber: 4,
        unitTheme: "创意与善意",
        unitLabel: "Unit 4 创意与善意",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "在善意不断传递的循环中，理解帮助他人的价值。",
        bookOrder: 441
      },
      {
        id: "g8b-u5-p1",
        file: "Unit 5 Passage 1 Secrets caught in time（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "Secrets caught in time",
        unitNumber: 5,
        unitTheme: "时间与生命",
        unitLabel: "Unit 5 时间与生命",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在被时间保存下来的线索里，观察过去、记忆和变化。",
        bookOrder: 450
      },
      {
        id: "g8b-u5-p2",
        file: "Unit 5 Passage 2 Plants for life（互动课文教学动画）英语新教材外研版八年级下册.html",
        title: "Plants for life",
        unitNumber: 5,
        unitTheme: "时间与生命",
        unitLabel: "Unit 5 时间与生命",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从植物与生命之间的关系出发，理解自然的重要性。",
        bookOrder: 451
      }
    ]
  }
];

function extractConstContext(source) {
  const context = {};
  const regex = /const\s+([A-Za-z_$][\w$]*)\s*=\s*(["'])(.*?)\2\s*;/gs;
  let match;

  while ((match = regex.exec(source))) {
    context[match[1]] = match[3];
  }

  return context;
}

function extractAssignment(source, marker, context = {}) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;

  const equalIndex = source.indexOf("=", markerIndex);
  if (equalIndex < 0) return null;

  let cursor = equalIndex + 1;
  while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;

  const opener = source[cursor];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  if (!closer) return null;

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let inLineComment = false;
  let inBlockComment = false;
  for (let index = cursor; index < source.length; index += 1) {
    const char = source[index];
    const prev = source[index - 1];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (prev === "*" && char === "/") inBlockComment = false;
      continue;
    }

    if (inString) {
      if (char === stringQuote && prev !== "\\") {
        inString = false;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === opener) depth += 1;
    if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(cursor, index + 1);
        return vm.runInNewContext(`(${literal})`, { ...context });
      }
    }
  }

  return null;
}

function parseSpecialWordAudio(source) {
  const overrides = new Map();
  const regex = /if\(w === '([^']+)'\)\s*\{\s*document\.getElementById\('w-audio'\)\.onclick = \(\) => new Audio\('([^']+)'\)\.play\(\);\s*\}/g;
  let match;
  while ((match = regex.exec(source))) {
    overrides.set(normalizeWord(match[1]), match[2]);
  }
  return overrides;
}

function normalizeWord(value) {
  return String(value)
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim()
    .toLowerCase();
}

function normalizeParagraphGroups(paragraphs, rawSentences) {
  if (!Array.isArray(paragraphs) || !paragraphs.length) return null;

  const indexedGroups = paragraphs
    .filter((group) => group && typeof group === "object" && Array.isArray(group.indices))
    .map((group) => group.indices)
    .filter((group) => group.length);
  if (indexedGroups.length) {
    return indexedGroups;
  }

  const idGroups = paragraphs
    .filter((group) => group && typeof group === "object" && Array.isArray(group.ids))
    .map((group) => group.ids)
    .filter((group) => group.length);
  if (idGroups.length) {
    return idGroups;
  }

  const sentenceGroups = paragraphs
    .filter((group) => group && typeof group === "object" && Array.isArray(group.sentences))
    .map((group) => group.sentences)
    .filter((group) => group.length);
  if (sentenceGroups.length) {
    return sentenceGroups;
  }

  if (paragraphs.every((group) => Array.isArray(group) && group.every((item) => typeof item === "number"))) {
    return paragraphs;
  }

  const sentenceIndexByText = new Map(
    rawSentences.map((sentence, index) => [normalizeWord(sentence.text ?? sentence.en ?? ""), index])
  );

  const mapped = paragraphs
    .map((group) => {
      if (!Array.isArray(group)) return [];
      return group
        .map((item) => {
          if (typeof item === "number") return item;
          if (typeof item === "object" && item) {
            if (typeof item.id === "number") return item.id;
            const key = normalizeWord(item.text ?? item.en ?? "");
            return sentenceIndexByText.get(key);
          }
          if (typeof item === "string") return sentenceIndexByText.get(normalizeWord(item));
          return undefined;
        })
        .filter((value) => Number.isInteger(value));
    })
    .filter((group) => group.length);

  return mapped.length ? mapped : null;
}

function groupByRole(rawSentences) {
  if (!rawSentences.length || !rawSentences.some((sentence) => sentence.role)) return null;

  const groups = [];
  let currentRole = rawSentences[0]?.role ?? "__default__";
  let currentGroup = [];

  rawSentences.forEach((sentence, index) => {
    const role = sentence.role ?? "__default__";
    if (currentGroup.length && role !== currentRole) {
      groups.push(currentGroup);
      currentGroup = [];
    }
    currentRole = role;
    currentGroup.push(index);
  });

  if (currentGroup.length) groups.push(currentGroup);
  return groups.length ? groups : null;
}

function buildParagraphGroups(source, sentenceCount, rawSentences, articleData, context = {}) {
  const paragraphs = extractAssignment(source, "const paragraphs", context);
  const normalizedParagraphs = normalizeParagraphGroups(paragraphs, rawSentences);
  if (normalizedParagraphs) {
    return normalizedParagraphs;
  }

  if (Array.isArray(paragraphs) && paragraphs.length) {
    return paragraphs;
  }

  const structure = extractAssignment(source, "const structure", context);
  const normalizedStructure = normalizeParagraphGroups(structure, rawSentences);
  if (normalizedStructure) {
    return normalizedStructure;
  }

  if (Array.isArray(structure) && structure.length) {
    const result = [];
    let index = 0;
    for (const count of structure) {
      const group = [];
      for (let offset = 0; offset < count && index < sentenceCount; offset += 1) {
        group.push(index);
        index += 1;
      }
      if (group.length) result.push(group);
    }
    if (index < sentenceCount) {
      result.push(Array.from({ length: sentenceCount - index }, (_, delta) => index + delta));
    }
    return result;
  }

  if (Array.isArray(articleData?.emails) && articleData.emails.length) {
    const emailGroups = articleData.emails
      .map((entry) =>
        Array.from({ length: entry.endIdx - entry.startIdx + 1 }, (_, delta) => entry.startIdx + delta)
      )
      .filter((group) => group.length);
    if (emailGroups.length) return emailGroups;
  }

  const roleGroups = groupByRole(rawSentences);
  if (roleGroups) return roleGroups;

  return [Array.from({ length: sentenceCount }, (_, index) => index)];
}

function normalizeSentence(raw) {
  return {
    text: raw.text ?? raw.en ?? "",
    tr: raw.translation ?? raw.tr ?? raw.cn ?? "",
    g: raw.grammar?.structure ?? raw.g ?? "",
    d: raw.grammar?.explanation ?? raw.grammar?.analysis ?? raw.d ?? "",
    audioUrl: raw.audio ?? raw.a ?? ""
  };
}

function normalizeLexicon(vocabulary, wordAudioMap, specialOverrides) {
  const entries = {};
  for (const [term, info] of Object.entries(vocabulary ?? {})) {
    const key = normalizeWord(term);
    const audioUrl = specialOverrides.get(key) ?? wordAudioMap[key] ?? wordAudioMap[term] ?? info.audio ?? info.a ?? "";
    entries[key] = {
      phonetic: info.phonetic ?? info.ipa ?? info.p ?? "",
      pos: info.pos ?? "",
      meaningZh: info.meaning ?? info.cn ?? info.m ?? "",
      usageZh: info.usage ?? info.u ?? "",
      example: info.example ?? info.e ?? "",
      ...(audioUrl ? { audioUrlOverride: audioUrl } : {})
    };
  }
  return entries;
}

function sentenceIdFor(articleId, index) {
  return `${articleId}-s${index + 1}`;
}

function paragraphIdFor(articleId, index) {
  return `${articleId}-p${index + 1}`;
}

function findExampleSentenceId(sentences, term, articleId) {
  const lower = normalizeWord(term);
  const hit = sentences.findIndex((sentence) => normalizeWord(sentence.text).includes(lower));
  return hit >= 0 ? sentenceIdFor(articleId, hit) : undefined;
}

function normalizeQuestions(rawQuestions) {
  return (rawQuestions ?? []).map((entry, index) => {
    const options = entry.options ?? entry.o ?? [];
    const answerIndex = Number(entry.answer ?? entry.a ?? entry.correctAnswer ?? -1);
    return {
      id: `reading-q${index + 1}`,
      type: "single_choice",
      stem: entry.question ?? entry.q ?? entry.stem ?? "",
      options,
      answer: options[answerIndex] ?? "",
      rationaleZh: entry.explanation ?? entry.explain ?? entry.p ?? ""
    };
  });
}

function parseHtmlArticle(source) {
  const context = extractConstContext(source);
  const articleData = extractAssignment(source, "const articleData", context) ?? extractAssignment(source, "const data", context);
  if (!articleData) {
    throw new Error("Unable to locate article data.");
  }

  const wordAudioMap = extractAssignment(source, "const wordAudioMap", context) ?? {};
  const specialOverrides = parseSpecialWordAudio(source);
  const vocabulary =
    articleData.vocabulary ??
    extractAssignment(source, "const vocabulary", context) ??
    {};
  const rawQuestions =
    articleData.quiz ??
    articleData.exercises ??
    articleData.questions ??
    extractAssignment(source, "const quizData", context) ??
    extractAssignment(source, "const questions", context) ??
    extractAssignment(source, "const exercises", context) ??
    [];
  const rawSentences = Array.isArray(articleData) ? articleData : articleData.sentences ?? [];
  const sentences = rawSentences.map(normalizeSentence);
  const paragraphGroups = buildParagraphGroups(source, sentences.length, rawSentences, articleData, { ...context, articleData });

  return {
    sentences,
    paragraphs: paragraphGroups,
    lexicon: normalizeLexicon(vocabulary, wordAudioMap, specialOverrides),
    readingQuestions: normalizeQuestions(rawQuestions)
  };
}

function buildContentPayload(item, parsed, sourceLabel) {
  const sentenceToParagraph = new Map();
  const paragraphs = parsed.paragraphs.map((group, paragraphIndex) => {
    const paragraphId = paragraphIdFor(item.id, paragraphIndex);
    for (const sentenceIndex of group) {
      sentenceToParagraph.set(sentenceIndex, paragraphId);
    }
    return {
      id: paragraphId,
      sentenceIds: group.map((sentenceIndex) => sentenceIdFor(item.id, sentenceIndex))
    };
  });

  const sentences = parsed.sentences.map((sentence, sentenceIndex) => ({
    id: sentenceIdFor(item.id, sentenceIndex),
    text: sentence.text,
    paragraphId: sentenceToParagraph.get(sentenceIndex) ?? paragraphIdFor(item.id, 0),
    ...(sentence.tr ? { tr: sentence.tr } : {}),
    ...(sentence.g ? { g: sentence.g } : {}),
    ...(sentence.d ? { d: sentence.d } : {}),
    ...(sentence.audioUrl ? { audioUrl: sentence.audioUrl } : {})
  }));

  const vocabItems = Object.entries(parsed.lexicon).map(([term, info], index) => ({
    id: `${item.id}-v${index + 1}`,
    term,
    meaningZh: info.meaningZh || "暂无词义",
    exampleSentenceId: findExampleSentenceId(sentences, term, item.id)
  }));

  return {
    meta: {
      schemaVersion: "2.0",
      source: `${item.bookLabel}互动课文`,
      importedFrom: sourceLabel,
      importedAt: new Date().toISOString()
    },
    article: {
      id: item.id,
      title: item.title,
      unit: item.unitLabel,
      paragraphs,
      stage: item.stage,
      stageLabel: item.stageLabel,
      unitNumber: item.unitNumber,
      unitTheme: item.unitTheme,
      bookId: item.bookId,
      bookLabel: item.bookLabel,
      bookShortLabel: item.bookShortLabel,
      bookOrder: item.bookOrder,
      summary: item.summary
    },
    sentences,
    vocabItems,
    sentenceTasks: [],
    readingQuestions: parsed.readingQuestions,
    quoteCandidates: [],
    lexicon: parsed.lexicon
  };
}

function writeArticleContent(item, payload) {
  const outputPath = join(contentDir, `${item.id}.json`);
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeIndex(entries) {
  const indexPath = join(contentDir, "index.json");
  const payload = entries
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      unit: entry.unitLabel,
      unitNumber: entry.unitNumber,
      unitTheme: entry.unitTheme,
      bookId: entry.bookId,
      bookLabel: entry.bookLabel,
      bookShortLabel: entry.bookShortLabel,
      stage: entry.stage,
      stageLabel: entry.stageLabel,
      summary: entry.summary,
      order: entry.bookOrder
    }));
  writeFileSync(indexPath, `${JSON.stringify(payload, null, 2)}\n`);
}

const allEntries = [];

for (const source of SOURCES) {
  for (const item of source.items) {
    const scopedItem = {
      bookId: source.bookId,
      bookLabel: source.bookLabel,
      bookShortLabel: source.bookShortLabel,
      ...item
    };
    const htmlPath = join(workspaceDir, source.sourceLabel, item.file);
    const html = readFileSync(htmlPath, "utf8");
    const parsed = parseHtmlArticle(html);
    const payload = buildContentPayload(scopedItem, parsed, item.file);
    writeArticleContent(scopedItem, payload);
    allEntries.push(scopedItem);
    console.log(`Synced ${scopedItem.id} from ${scopedItem.file} (${parsed.sentences.length} sentences, ${Object.keys(parsed.lexicon).length} words)`);
  }
}

writeIndex(allEntries);

console.log(`Updated ${allEntries.length} article files and content index.`);
