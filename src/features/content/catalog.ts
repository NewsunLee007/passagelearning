export type TextbookArticleMeta = {
  id: string;
  title: string;
  unitNumber: number;
  unitTheme: string;
  unitLabel: string;
  stage: "Understanding ideas" | "Reading for writing";
  stageLabel: "理解篇" | "写作篇";
  summary: string;
  bookOrder: number;
};

export type TextbookUnit = {
  unitNumber: number;
  theme: string;
  unitLabel: string;
  overview: string;
  articles: TextbookArticleMeta[];
};

export const TEXTBOOK_UNITS: TextbookUnit[] = [
  {
    unitNumber: 1,
    theme: "The secrets of happiness",
    unitLabel: "Unit 1 The secrets of happiness",
    overview: "从家庭温度与助人经历中理解幸福的来源。",
    articles: [
      {
        id: "u3-article",
        title: "Poor in things, rich in love",
        unitNumber: 1,
        unitTheme: "The secrets of happiness",
        unitLabel: "Unit 1 The secrets of happiness",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从《查理和巧克力工厂》里的家庭故事，理解“贫穷但充满爱”的幸福感。",
        bookOrder: 10
      },
      {
        id: "u4-article",
        title: "Growing happiness",
        unitNumber: 1,
        unitTheme: "The secrets of happiness",
        unitLabel: "Unit 1 The secrets of happiness",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "通过周健捐发做假发的故事，感受帮助他人带来的幸福。",
        bookOrder: 11
      }
    ]
  },
  {
    unitNumber: 2,
    theme: "Go for it!",
    unitLabel: "Unit 2 Go for it!",
    overview: "从坚持与拼搏中理解运动精神和团队力量。",
    articles: [
      {
        id: "u6-article",
        title: "Last but not least",
        unitNumber: 2,
        unitTheme: "Go for it!",
        unitLabel: "Unit 2 Go for it!",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "北京马拉松终点线前的坚持，展现永不放弃的体育精神。",
        bookOrder: 20
      },
      {
        id: "u7-article",
        title: "The Steel Roses of China",
        unitNumber: 2,
        unitTheme: "Go for it!",
        unitLabel: "Unit 2 Go for it!",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "回望中国女足逆转夺冠，理解荣誉背后的长期奋斗。",
        bookOrder: 21
      }
    ]
  },
  {
    unitNumber: 3,
    theme: "Food matters",
    unitLabel: "Unit 3 Food matters",
    overview: "从味觉记忆与食物流动中理解饮食与文化。",
    articles: [
      {
        id: "u8-article",
        title: "Delicious memories",
        unitNumber: 3,
        unitTheme: "Food matters",
        unitLabel: "Unit 3 Food matters",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "从家常食物唤起的记忆，理解食物与情感的联系。",
        bookOrder: 30
      },
      {
        id: "u9-article",
        title: "Food across borders",
        unitNumber: 3,
        unitTheme: "Food matters",
        unitLabel: "Unit 3 Food matters",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "追溯冰淇淋、番茄和马铃薯的传播，理解食物跨文化流动。",
        bookOrder: 31
      }
    ]
  },
  {
    unitNumber: 4,
    theme: "The art of having fun",
    unitLabel: "Unit 4 The art of having fun",
    overview: "辨析娱乐、兴趣与时间管理之间的平衡。",
    articles: [
      {
        id: "u10-article",
        title: "All work and no play makes Jack a dull boy",
        unitNumber: 4,
        unitTheme: "The art of having fun",
        unitLabel: "Unit 4 The art of having fun",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在孤岛想象和日常生活中讨论“休闲”的价值。",
        bookOrder: 40
      },
      {
        id: "u11-article",
        title: "The time-eating monster",
        unitNumber: 4,
        unitTheme: "The art of having fun",
        unitLabel: "Unit 4 The art of having fun",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "识别吞噬时间的娱乐陷阱，学习保持有节制的快乐。",
        bookOrder: 41
      }
    ]
  },
  {
    unitNumber: 5,
    theme: "Amazing nature",
    unitLabel: "Unit 5 Amazing nature",
    overview: "先看见自然之美，再理解自然奇观正在遭遇的危机。",
    articles: [
      {
        id: "u12-article",
        title: "Colours of my hometown",
        unitNumber: 5,
        unitTheme: "Amazing nature",
        unitLabel: "Unit 5 Amazing nature",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "用色彩描绘青藏高原故乡景象，感受自然之美。",
        bookOrder: 50
      },
      {
        id: "u13-article",
        title: "Natural wonders crying aloud for help",
        unitNumber: 5,
        unitTheme: "Amazing nature",
        unitLabel: "Unit 5 Amazing nature",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "借死海、马达加斯加雨林与冰川的第一人称“呼救”，理解生态危机。",
        bookOrder: 51
      }
    ]
  },
  {
    unitNumber: 6,
    theme: "Hitting the road",
    unitLabel: "Unit 6 Hitting the road",
    overview: "从旅行体验与探险人生中理解“在路上”的意义。",
    articles: [
      {
        id: "u14-article",
        title: "Hot and cool",
        unitNumber: 6,
        unitTheme: "Hitting the road",
        unitLabel: "Unit 6 Hitting the road",
        stage: "Understanding ideas",
        stageLabel: "理解篇",
        summary: "在成都与青城山之间切换，体验旅途中的冷热反差。",
        bookOrder: 60
      },
      {
        id: "u15-article",
        title: "Exploring the unexplored",
        unitNumber: 6,
        unitTheme: "Hitting the road",
        unitLabel: "Unit 6 Hitting the road",
        stage: "Reading for writing",
        stageLabel: "写作篇",
        summary: "从徐霞客的行走人生，理解探索未知的勇气与价值。",
        bookOrder: 61
      }
    ]
  }
];

export const TEXTBOOK_ARTICLES = TEXTBOOK_UNITS.flatMap((unit) => unit.articles);

const textbookArticleMap = new Map(TEXTBOOK_ARTICLES.map((article) => [article.id, article]));

export function getTextbookArticle(articleId?: string | null) {
  if (!articleId) return undefined;
  return textbookArticleMap.get(articleId);
}

export function getAdjacentArticles(articleId?: string | null) {
  if (!articleId) {
    return { previous: undefined, next: undefined };
  }

  const currentIndex = TEXTBOOK_ARTICLES.findIndex((article) => article.id === articleId);
  if (currentIndex < 0) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: TEXTBOOK_ARTICLES[currentIndex - 1],
    next: TEXTBOOK_ARTICLES[currentIndex + 1]
  };
}
