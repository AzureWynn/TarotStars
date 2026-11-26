/**
 * 塔罗牌版本/套牌类型定义
 */
export interface TarotDeck {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  publisher?: string;
  year?: number;
  totalCards: number;
  imageStyle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 标准化的多语言内容结构
 */
export interface MultiLanguageContent {
  zh: {
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
  };
  en: {
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
  };
  // 可扩展其他语言
  [languageCode: string]: {
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
  };
}

/**
 * 增强的塔罗牌实体，支持多版本和标准化多语言
 */
export interface EnhancedTarotCard {
  id: string;
  deckId: string; // 关联到具体的塔罗牌版本
  cardNumber: number; // 在该套牌中的编号
  suit?: string; // Major Arcana cards don't have suits
  rank?: string; // 如 'ace', 'two', 'king' 等
  category: 'major' | 'minor';
  
  // 标准化的多语言内容
  content: MultiLanguageContent;
  
  // 图片资源
  images: {
    original: string; // 原始高清图片
    thumbnail: string; // 缩略图
    watermark?: string; // 带水印版本（如果需要版权保护）
  };
  
  // 元数据
  metadata: {
    sourceUrl?: string; // 数据来源URL
    license?: string; // 版权信息
    tags: string[]; // 标签，如 ['beginner-friendly', 'traditional']
  };
  
  // 系统字段
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rider-Waite 特定的塔罗牌数据结构
 */
export interface RiderWaiteTarotCard extends EnhancedTarotCard {
  // Rider-Waite 特有的属性
  riderWaiteMetadata: {
    originalArtist: string; // Pamela Colman Smith
    symbolism: string[]; // 象征意义
    astrologicalCorrespondence?: string; // 占星对应
    hebrewLetter?: string; // 希伯来字母对应（大阿卡纳）
    numerology?: number; // 数字学意义
  };
}

/**
 * 预定义的塔罗牌版本常量
 */
export const TAROT_DECK_TYPES = {
  RIDER_WAITE: 'rider-waite',
  THOTH: 'thoth',
  MARSEILLE: 'marseille',
  GOLDEN_DAWN: 'golden-dawn'
} as const;

export type TarotDeckType = typeof TAROT_DECK_TYPES[keyof typeof TAROT_DECK_TYPES];

/**
 * Rider-Waite 塔罗牌版本定义
 */
export const RIDER_WAITE_DECK: TarotDeck = {
  id: TAROT_DECK_TYPES.RIDER_WAITE,
  name: '韦特塔罗牌',
  nameEn: 'Rider-Waite Tarot Deck',
  description: '最经典和广泛使用的塔罗牌版本，由亚瑟·爱德华·韦特设计，帕梅拉·科尔曼·史密斯绘制',
  publisher: 'Rider & Company',
  year: 1909,
  totalCards: 78,
  imageStyle: 'traditional-symbolic',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};