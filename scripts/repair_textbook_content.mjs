import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = fileURLToPath(new URL("../public/content/", import.meta.url));

const textbookUnits = [
  {
    unitNumber: 1,
    theme: "The secrets of happiness",
    overview: "从家庭温度与助人经历中理解幸福的来源。",
    articles: [
      {
        id: "u3-article",
        title: "Poor in things, rich in love",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从《查理和巧克力工厂》里的家庭故事，理解“贫穷但充满爱”的幸福感。"
      },
      {
        id: "u4-article",
        title: "Growing happiness",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "通过周健捐发做假发的故事，感受帮助他人带来的幸福。"
      }
    ]
  },
  {
    unitNumber: 2,
    theme: "Go for it!",
    overview: "从坚持与拼搏中理解运动精神和团队力量。",
    articles: [
      {
        id: "u6-article",
        title: "Last but not least",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "北京马拉松终点线前的坚持，展现永不放弃的体育精神。"
      },
      {
        id: "u7-article",
        title: "The Steel Roses of China",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "回望中国女足逆转夺冠，理解荣誉背后的长期奋斗。"
      }
    ]
  },
  {
    unitNumber: 3,
    theme: "Food matters",
    overview: "从味觉记忆与食物流动中理解饮食与文化。",
    articles: [
      {
        id: "u8-article",
        title: "Delicious memories",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从家常食物唤起的记忆，理解食物与情感的联系。"
      },
      {
        id: "u9-article",
        title: "Food across borders",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "追溯冰淇淋、番茄和马铃薯的传播，理解食物跨文化流动。"
      }
    ]
  },
  {
    unitNumber: 4,
    theme: "The art of having fun",
    overview: "辨析娱乐、兴趣与时间管理之间的平衡。",
    articles: [
      {
        id: "u10-article",
        title: "All work and no play makes Jack a dull boy",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在孤岛想象和日常生活中讨论“休闲”的价值。"
      },
      {
        id: "u11-article",
        title: "The time-eating monster",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "识别吞噬时间的娱乐陷阱，学习保持有节制的快乐。"
      }
    ]
  },
  {
    unitNumber: 5,
    theme: "Amazing nature",
    overview: "先看见自然之美，再理解自然奇观正在遭遇的危机。",
    articles: [
      {
        id: "u12-article",
        title: "Colours of my hometown",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "用色彩描绘青藏高原故乡景象，感受自然之美。"
      },
      {
        id: "u13-article",
        title: "Natural wonders crying aloud for help",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "借死海、马达加斯加雨林与冰川的第一人称“呼救”，理解生态危机。"
      }
    ]
  },
  {
    unitNumber: 6,
    theme: "Hitting the road",
    overview: "从旅行体验与探险人生中理解“在路上”的意义。",
    articles: [
      {
        id: "u14-article",
        title: "Hot and cool",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在成都与青城山之间切换，体验旅途中的冷热反差。"
      },
      {
        id: "u15-article",
        title: "Exploring the unexplored",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从徐霞客的行走人生，理解探索未知的勇气与价值。"
      }
    ]
  }
];

const articleMetaMap = new Map(
  textbookUnits.flatMap((unit) =>
    unit.articles.map((article, index) => [
      article.id,
      {
        ...article,
        unitNumber: unit.unitNumber,
        unitTheme: unit.theme,
        unitLabel: `Unit ${unit.unitNumber} ${unit.theme}`,
        overview: unit.overview,
        bookOrder: unit.unitNumber * 10 + index
      }
    ])
  )
);

function rebuildParagraphs(sentences) {
  const paragraphs = [];
  let current = null;

  for (const sentence of sentences) {
    if (!current || current.id !== sentence.paragraphId) {
      current = { id: sentence.paragraphId, sentenceIds: [] };
      paragraphs.push(current);
    }
    current.sentenceIds.push(sentence.id);
  }

  return paragraphs;
}

for (const file of readdirSync(contentDir).filter((name) => name.endsWith(".json") && name !== "index.json")) {
  const filePath = join(contentDir, file);
  const json = JSON.parse(readFileSync(filePath, "utf8"));
  const meta = articleMetaMap.get(json.article?.id);
  const paragraphs = rebuildParagraphs(json.sentences ?? []);

  if (meta) {
    json.article = {
      ...json.article,
      title: meta.title,
      unit: meta.unitLabel,
      stage: meta.stage,
      stageLabel: meta.stageLabel,
      unitNumber: meta.unitNumber,
      unitTheme: meta.unitTheme,
      bookOrder: meta.bookOrder,
      summary: meta.summary,
      paragraphs
    };
  } else if (paragraphs.length) {
    json.article = {
      ...json.article,
      paragraphs
    };
  }

  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
}

const index = textbookUnits.flatMap((unit) =>
  unit.articles.map((article, index) => ({
    id: article.id,
    title: article.title,
    unit: `Unit ${unit.unitNumber} ${unit.theme}`,
    unitNumber: unit.unitNumber,
    unitTheme: unit.theme,
    stage: article.stage,
    stageLabel: article.stageLabel,
    summary: article.summary,
    order: unit.unitNumber * 10 + index
  }))
);

writeFileSync(join(contentDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
