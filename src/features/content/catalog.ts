export type TextbookArticleMeta = {
  id: string;
  title: string;
  bookId: string;
  bookLabel: string;
  bookShortLabel: string;
  unitNumber: number;
  unitTheme: string;
  unitLabel: string;
  stage: "Understanding ideas" | "Reading for writing";
  stageLabel: "理解篇" | "写作篇";
  summary: string;
  bookOrder: number;
};

export type TextbookUnit = {
  bookId: string;
  unitNumber: number;
  theme: string;
  unitLabel: string;
  overview: string;
  articles: TextbookArticleMeta[];
};

export type TextbookBook = {
  id: string;
  label: string;
  shortLabel: string;
  gradeLabel: string;
  semesterLabel: string;
  overview: string;
  loaded: boolean;
  order: number;
  units: TextbookUnit[];
};

const BOOKS: TextbookBook[] = [
  {
    id: "g7a",
    label: "七年级上册",
    shortLabel: "7上",
    gradeLabel: "七年级",
    semesterLabel: "上册",
    overview: "预留给七年级上册整册语篇、词句和朗读资源。",
    loaded: false,
    order: 1,
    units: []
  },
  {
    id: "g7b",
    label: "七年级下册",
    shortLabel: "7下",
    gradeLabel: "七年级",
    semesterLabel: "下册",
    overview: "已接入 6 个单元的 12 篇核心语篇，并可同步真人句音频。",
    loaded: true,
    order: 2,
    units: [
      {
        bookId: "g7b",
        unitNumber: 1,
        theme: "The secrets of happiness",
        unitLabel: "Unit 1 The secrets of happiness",
        overview: "从家庭温度与助人经历中理解幸福的来源。",
        articles: [
          {
            id: "u3-article",
            title: "Poor in things, rich in love",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "Growing happiness",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 1,
            unitTheme: "The secrets of happiness",
            unitLabel: "Unit 1 The secrets of happiness",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "通过周健捐发做假发的故事，感受帮助他人带来的幸福。",
            bookOrder: 211
          }
        ]
      },
      {
        bookId: "g7b",
        unitNumber: 2,
        theme: "Go for it!",
        unitLabel: "Unit 2 Go for it!",
        overview: "从坚持与拼搏中理解运动精神和团队力量。",
        articles: [
          {
            id: "u6-article",
            title: "Last but not least",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "The Steel Roses of China",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 2,
            unitTheme: "Go for it!",
            unitLabel: "Unit 2 Go for it!",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "回望中国女足逆转夺冠，理解荣誉背后的长期奋斗。",
            bookOrder: 221
          }
        ]
      },
      {
        bookId: "g7b",
        unitNumber: 3,
        theme: "Food matters",
        unitLabel: "Unit 3 Food matters",
        overview: "从味觉记忆与食物流动中理解饮食与文化。",
        articles: [
          {
            id: "u8-article",
            title: "Delicious memories",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "Food across borders",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 3,
            unitTheme: "Food matters",
            unitLabel: "Unit 3 Food matters",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "追溯冰淇淋、番茄和马铃薯的传播，理解食物跨文化流动。",
            bookOrder: 231
          }
        ]
      },
      {
        bookId: "g7b",
        unitNumber: 4,
        theme: "The art of having fun",
        unitLabel: "Unit 4 The art of having fun",
        overview: "辨析娱乐、兴趣与时间管理之间的平衡。",
        articles: [
          {
            id: "u10-article",
            title: "All work and no play makes Jack a dull boy",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "The time-eating monster",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 4,
            unitTheme: "The art of having fun",
            unitLabel: "Unit 4 The art of having fun",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "识别吞噬时间的娱乐陷阱，学习保持有节制的快乐。",
            bookOrder: 241
          }
        ]
      },
      {
        bookId: "g7b",
        unitNumber: 5,
        theme: "Amazing nature",
        unitLabel: "Unit 5 Amazing nature",
        overview: "先看见自然之美，再理解自然奇观正在遭遇的危机。",
        articles: [
          {
            id: "u12-article",
            title: "Colours of my hometown",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "Natural wonders crying aloud for help",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 5,
            unitTheme: "Amazing nature",
            unitLabel: "Unit 5 Amazing nature",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "借死海、马达加斯加雨林与冰川的第一人称“呼救”，理解生态危机。",
            bookOrder: 251
          }
        ]
      },
      {
        bookId: "g7b",
        unitNumber: 6,
        theme: "Hitting the road",
        unitLabel: "Unit 6 Hitting the road",
        overview: "从旅行体验与探险人生中理解“在路上”的意义。",
        articles: [
          {
            id: "u14-article",
            title: "Hot and cool",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
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
            title: "Exploring the unexplored",
            bookId: "g7b",
            bookLabel: "七年级下册",
            bookShortLabel: "7下",
            unitNumber: 6,
            unitTheme: "Hitting the road",
            unitLabel: "Unit 6 Hitting the road",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "从徐霞客的行走人生，理解探索未知的勇气与价值。",
            bookOrder: 261
          }
        ]
      }
    ]
  },
  {
    id: "g8a",
    label: "八年级上册",
    shortLabel: "8上",
    gradeLabel: "八年级",
    semesterLabel: "上册",
    overview: "预留给八年级上册整册语篇、词句和朗读资源。",
    loaded: false,
    order: 3,
    units: []
  },
  {
    id: "g8b",
    label: "八年级下册",
    shortLabel: "8下",
    gradeLabel: "八年级",
    semesterLabel: "下册",
    overview: "已接入 5 个单元的 10 篇互动课文，并可批量使用真人句音频。",
    loaded: true,
    order: 4,
    units: [
      {
        bookId: "g8b",
        unitNumber: 1,
        theme: "成长与未来",
        unitLabel: "Unit 1 成长与未来",
        overview: "从告别过去到想象未来职业，回看成长中的重要时刻。",
        articles: [
          {
            id: "g8b-u1-p1",
            title: "Saying goodbye to my years up high",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
            title: "From mouse catcher to space tour guide...",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
            unitNumber: 1,
            unitTheme: "成长与未来",
            unitLabel: "Unit 1 成长与未来",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "从童年兴趣到职业想象，理解梦想是如何被慢慢打开的。",
            bookOrder: 411
          }
        ]
      },
      {
        bookId: "g8b",
        unitNumber: 2,
        theme: "沟通与坚持",
        unitLabel: "Unit 2 沟通与坚持",
        overview: "从误解和训练的阵痛中理解关系修复与自我突破。",
        articles: [
          {
            id: "g8b-u2-p1",
            title: "You just don't get me!",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
            title: "From Pain to Gain",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
            unitNumber: 2,
            unitTheme: "沟通与坚持",
            unitLabel: "Unit 2 沟通与坚持",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "从疼痛到收获，理解坚持训练之后的成长和回报。",
            bookOrder: 421
          }
        ]
      },
      {
        bookId: "g8b",
        unitNumber: 3,
        theme: "行动与团队",
        unitLabel: "Unit 3 行动与团队",
        overview: "从个人能做什么到团队如何协作，建立责任感和合作意识。",
        articles: [
          {
            id: "g8b-u3-p1",
            title: "What can I do",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
            title: "No I in team",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
            unitNumber: 3,
            unitTheme: "行动与团队",
            unitLabel: "Unit 3 行动与团队",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "通过团队故事理解合作、分工和共同目标的意义。",
            bookOrder: 431
          }
        ]
      },
      {
        bookId: "g8b",
        unitNumber: 4,
        theme: "创意与善意",
        unitLabel: "Unit 4 创意与善意",
        overview: "从色彩表达与善意循环中感受人与人之间的连接。",
        articles: [
          {
            id: "g8b-u4-p1",
            title: "Adding some colour",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
            title: "Circle of Goodwill",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
            unitNumber: 4,
            unitTheme: "创意与善意",
            unitLabel: "Unit 4 创意与善意",
            stage: "Reading for writing",
            stageLabel: "写作篇",
            summary: "在善意不断传递的循环中，理解帮助他人的价值。",
            bookOrder: 441
          }
        ]
      },
      {
        bookId: "g8b",
        unitNumber: 5,
        theme: "时间与生命",
        unitLabel: "Unit 5 时间与生命",
        overview: "从时间留下的线索和植物故事中理解生命与自然。",
        articles: [
          {
            id: "g8b-u5-p1",
            title: "Secrets caught in time",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
            title: "Plants for life",
            bookId: "g8b",
            bookLabel: "八年级下册",
            bookShortLabel: "8下",
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
    ]
  },
  {
    id: "g9a",
    label: "九年级上册",
    shortLabel: "9上",
    gradeLabel: "九年级",
    semesterLabel: "上册",
    overview: "预留给九年级上册整册语篇、词句和朗读资源。",
    loaded: false,
    order: 5,
    units: []
  },
  {
    id: "g9b",
    label: "九年级下册",
    shortLabel: "9下",
    gradeLabel: "九年级",
    semesterLabel: "下册",
    overview: "预留给九年级下册整册语篇、词句和朗读资源。",
    loaded: false,
    order: 6,
    units: []
  }
];

export const TEXTBOOK_BOOKS = BOOKS.toSorted((a, b) => a.order - b.order);
export const LOADED_TEXTBOOK_BOOKS = TEXTBOOK_BOOKS.filter((book) => book.loaded);
export const TEXTBOOK_UNITS: TextbookUnit[] = LOADED_TEXTBOOK_BOOKS.flatMap((book) => book.units);
export const TEXTBOOK_ARTICLES = TEXTBOOK_UNITS.flatMap((unit) => unit.articles);

const textbookArticleMap = new Map(TEXTBOOK_ARTICLES.map((article) => [article.id, article]));
const textbookBookMap = new Map(TEXTBOOK_BOOKS.map((book) => [book.id, book]));

export function getTextbookArticle(articleId?: string | null) {
  if (!articleId) return undefined;
  return textbookArticleMap.get(articleId);
}

export function getTextbookBook(bookId?: string | null) {
  if (!bookId) return undefined;
  return textbookBookMap.get(bookId);
}

export function getAdjacentArticles(articleId?: string | null) {
  const current = getTextbookArticle(articleId);
  if (!current) {
    return { previous: undefined, next: undefined };
  }

  const siblings = TEXTBOOK_ARTICLES.filter((article) => article.bookId === current.bookId);
  const currentIndex = siblings.findIndex((article) => article.id === current.id);
  if (currentIndex < 0) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: siblings[currentIndex - 1],
    next: siblings[currentIndex + 1]
  };
}
