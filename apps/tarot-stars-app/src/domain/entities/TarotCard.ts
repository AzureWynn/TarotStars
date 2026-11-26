// 新的多语言塔罗牌实体定义
export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko';

// 语言内容块
export interface LanguageContent {
  name: string;
  description: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  keywords: {
    upright: string[];
    reversed: string[];
  };
  advice?: {
    upright: string;
    reversed: string;
  };
}

// 新的塔罗牌实体
export interface TarotCard {
  id: string;
  number: number;
  arcana: 'major' | 'minor';
  suit?: 'cups' | 'wands' | 'swords' | 'pentacles';
  imageUrl: string;
  languages: {
    zh: LanguageContent;
    en: LanguageContent;
    ja: LanguageContent;
    ko: LanguageContent;
  };
  isReversed?: boolean;
}

// 本地化的塔罗牌（用于特定语言显示）
export interface LocalizedTarotCard {
  cardId: string;
  name: string;
  description: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  keywords: {
    upright: string[];
    reversed: string[];
  };
  advice?: {
    upright: string;
    reversed: string;
  };
  number: number;
  arcana: 'major' | 'minor';
  suit?: {
    name: 'cups' | 'wands' | 'swords' | 'pentacles';
    symbol: string;
  };
  category?: {
    name: string;
    type: 'major' | 'minor';
  };
  imageUrl: string;
  isReversed?: boolean;
  language: SupportedLanguage;
}

// 卡牌分类枚举
export enum NewCardCategory {
  MAJOR_ARCANA = 'major',
  CUPS = 'cups',
  WANDS = 'wands', 
  SWORDS = 'swords',
  PENTACLES = 'pentacles'
}

// 后端返回的卡牌数据结构
export interface BackendTarotCard {
  cardId: string;
  deckId: string;
  category: {
    name: string;
    description: string;
  };
  suit: string | null;
  number: number | null;
  rank: string;
  images: {
    original: string;
    thumbnail: string;
    watermark: string;
  };
  name: string;
  description: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  meaning: {
    upright: string;
    reversed: string;
  };
  advice?: string;
  metadata?: {
    sourceUrl: string;
    license: string;
    tags: string[];
  };
}

// 新的每日占卜结果
export interface DailyReading {
  id: string;
  date: number | string; // 毫秒级时间戳或ISO字符串
  card: BackendTarotCard;
  isReversed: boolean;
  interpretation: string;
  advice?: string;
  userId?: string;
  language?: SupportedLanguage;
  createdAt: number | string; // 毫秒级时间戳或ISO字符串
  isExistingReading?: boolean;
  message?: string;
}

// 新的占卜历史
export interface ReadingHistory {
  userId: string;
  readings: DailyReading[];
  totalCount: number;
  language: SupportedLanguage;
}

// 卡牌统计信息
export interface CardStatistics {
  totalCards: number;
  majorArcanaCount: number;
  minorArcanaCount: number;
  suitCounts: {
    cups: number;
    wands: number;
    swords: number;
    pentacles: number;
  };
}

// 用户统计信息
export interface UserStatistics {
  totalReadings: number;
  readingStreak: number;
  favoriteCards: string[];
  mostDrawnSuit?: string;
  lastReadingDate?: number; // 毫秒级时间戳
}

// API响应格式
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// 语言支持信息
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// 卡牌搜索过滤器
export interface CardFilter {
  arcana?: 'major' | 'minor';
  suit?: 'cups' | 'wands' | 'swords' | 'pentacles';
  numbers?: number[];
  language?: SupportedLanguage;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 错误类型
export interface TarotError {
  code: string;
  message: string;
  details?: any;
}

// 本地化文本标签
export interface LocalizedLabels {
  position: {
    upright: string;
    reversed: string;
  };
  arcana: {
    major: string;
    minor: string;
  };
  suits: {
    cups: string;
    wands: string;
    swords: string;
    pentacles: string;
  };
  actions: {
    draw: string;
    redraw: string;
    save: string;
    share: string;
    history: string;
  };
  messages: {
    loading: string;
    error: string;
    noData: string;
    success: string;
  };
}