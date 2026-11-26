/**
 * 新的多语言塔罗牌数据库设计
 * 使用语言工厂模式，支持可扩展的多语言内容
 */

// 支持的语言类型
export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko';

// 多语言内容接口
export interface MultiLanguageContent {
  name: string;
  description: string;
}

// 卡牌多语言内容接口
export interface CardMultiLanguageContent extends MultiLanguageContent {
  keywords: {
    upright: string[];
    reversed: string[];
  };
  meaning: {
    upright: string;
    reversed: string;
  };
}

// 卡牌分类表
export interface CardCategory {
  _id?: string;
  categoryId: string; // 'major_arcana', 'minor_arcana'
  order: number; // 排序
  content: {
    [K in SupportedLanguage]: MultiLanguageContent;
  };
  isActive: boolean;
  createdAt: number; // 毫秒级时间戳
  updatedAt: number; // 毫秒级时间戳
}

// 花色表
export interface CardSuit {
  _id?: string;
  suitId: string; // 'cups', 'wands', 'swords', 'pentacles'
  categoryId: string; // 关联到 'minor_arcana'
  order: number; // 排序
  element?: string; // 元素：水、火、风、土
  content: {
    [K in SupportedLanguage]: MultiLanguageContent;
  };
  isActive: boolean;
  createdAt: number; // 毫秒级时间戳
  updatedAt: number; // 毫秒级时间戳
}

// 塔罗牌表
export interface TarotCardNew {
  _id?: string;
  cardId: string; // 唯一标识符，如 'rw-major-00', 'rw-cups-01'
  deckId: string; // 牌组ID，如 'rider-waite'
  categoryId: string; // 关联到卡牌分类
  suitId?: string; // 关联到花色（大阿卡纳为空）
  
  // 核心属性
  number: number; // 卡牌编号
  rank?: string; // 等级：ace, two, three, ..., king
  
  // 图片资源
  images: {
    original: string;
    thumbnail: string;
    watermark?: string;
  };
  
  // 多语言内容
  content: {
    [K in SupportedLanguage]: CardMultiLanguageContent;
  };
  
  // 元数据
  metadata: {
    sourceUrl?: string;
    license?: string;
    tags: string[];
    symbolism?: string[]; // 象征意义
    astrology?: {
      planet?: string;
      sign?: string;
      element?: string;
    };
    numerology?: {
      number: number;
      meaning?: string;
    };
    hebrewLetter?: string;
  };
  
  // 系统字段
  isActive: boolean;
  createdAt: number; // 毫秒级时间戳
  updatedAt: number; // 毫秒级时间戳
}

// 牌组信息
export interface TarotDeckNew {
  _id?: string;
  deckId: string; // 'rider-waite', 'thoth', etc.
  content: {
    [K in SupportedLanguage]: {
      name: string;
      description: string;
      artist?: string;
      publisher?: string;
    };
  };
  totalCards: number;
  publishYear?: number;
  isActive: boolean;
  createdAt: number; // 毫秒级时间戳
  updatedAt: number; // 毫秒级时间戳
}

// 多语言工厂服务接口
export interface MultiLanguageFactory {
  getCardCategory(categoryId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null>;
  getCardSuit(suitId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null>;
  getCard(cardId: string, language: SupportedLanguage): Promise<CardMultiLanguageContent | null>;
  getDeck(deckId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null>;
}

// API响应格式
export interface LocalizedTarotCard {
  cardId: string;
  deckId: string;
  category: MultiLanguageContent;
  suit?: MultiLanguageContent;
  number: number;
  rank?: string;
  images: {
    original: string;
    thumbnail: string;
    watermark?: string;
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
  metadata: {
    sourceUrl?: string;
    license?: string;
    tags: string[];
    symbolism?: string[];
    astrology?: {
      planet?: string;
      sign?: string;
      element?: string;
    };
    numerology?: {
      number: number;
      meaning?: string;
    };
    hebrewLetter?: string;
  };
}

// 数据迁移接口
export interface MigrationData {
  categories: CardCategory[];
  suits: CardSuit[];
  cards: TarotCardNew[];
  decks: TarotDeckNew[];
}