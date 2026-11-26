import { Collection } from 'mongodb';
import axios from 'axios';
import { MongoConnection } from '../database/MongoConnection';
import {
  CardCategory,
  CardSuit,
  TarotCardNew,
  TarotDeckNew,
  SupportedLanguage
} from '../../domain/entities/NewTarotSchema';

/**
 * 新塔罗牌数据迁移服务
 * 负责将现有数据迁移到新的多语言schema
 */
export class NewTarotDataMigrationService {
  private db = MongoConnection.getInstance().getDb();
  private readonly API_BASE_URL = 'https://tarotapi.dev/api/v1';
  
  // 新表集合
  private categoriesCollection: Collection<CardCategory>;
  private suitsCollection: Collection<CardSuit>;
  private cardsCollection: Collection<TarotCardNew>;
  private decksCollection: Collection<TarotDeckNew>;
  
  // 旧表集合
  // private oldCardsCollection: Collection<TarotCard>;

  constructor() {
    this.categoriesCollection = this.db.collection<CardCategory>('card_categories');
    this.suitsCollection = this.db.collection<CardSuit>('card_suits');
    this.cardsCollection = this.db.collection<TarotCardNew>('tarot_cards_new');
    this.decksCollection = this.db.collection<TarotDeckNew>('tarot_decks_new');
    // this.oldCardsCollection = this.db.collection<TarotCard>('tarot_cards');
  }

  /**
   * 执行完整的数据迁移
   */
  async performFullMigration(): Promise<void> {
    console.log('🚀 Starting new tarot data migration...');
    
    try {
      // 1. 创建基础数据
      await this.createBaseData();
      
      // 2. 从API获取数据并迁移
      await this.migrateFromApi();
      
      // 3. 创建索引
      await this.createIndexes();
      
      console.log('✅ New tarot data migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * 创建基础数据（分类、花色、牌组）
   */
  private async createBaseData(): Promise<void> {
    console.log('📝 Creating base data...');
    
    const now = Date.now(); // 毫秒级时间戳
    
    // 创建卡牌分类
    const categories: CardCategory[] = [
      {
        categoryId: 'major_arcana',
        order: 1,
        content: {
          zh: {
            name: '大阿卡纳',
            description: '大阿卡纳牌代表人生的重大主题和精神旅程'
          },
          en: {
            name: 'Major Arcana',
            description: 'Major Arcana cards represent major life themes and spiritual journey'
          },
          ja: {
            name: '大アルカナ',
            description: '大アルカナカードは人生の重要なテーマと精神的な旅を表します'
          },
          ko: {
            name: '메이저 아르카나',
            description: '메이저 아르카나 카드는 인생의 주요 주제와 영적 여정을 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        categoryId: 'minor_arcana',
        order: 2,
        content: {
          zh: {
            name: '小阿卡纳',
            description: '小阿卡纳牌代表日常生活的具体情况和挑战'
          },
          en: {
            name: 'Minor Arcana',
            description: 'Minor Arcana cards represent everyday situations and challenges'
          },
          ja: {
            name: '小アルカナ',
            description: '小アルカナカードは日常生活の具体的な状況と課題を表します'
          },
          ko: {
            name: '마이너 아르카나',
            description: '마이너 아르카나 카드는 일상생활의 구체적인 상황과 도전을 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    // 创建花色
    const suits: CardSuit[] = [
      {
        suitId: 'cups',
        categoryId: 'minor_arcana',
        order: 1,
        element: 'water',
        content: {
          zh: {
            name: '圣杯',
            description: '代表情感、直觉、关系和精神层面'
          },
          en: {
            name: 'Cups',
            description: 'Represents emotions, intuition, relationships and spiritual matters'
          },
          ja: {
            name: 'カップ',
            description: '感情、直感、人間関係、精神的な事柄を表します'
          },
          ko: {
            name: '컵',
            description: '감정, 직감, 관계, 영적 문제를 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        suitId: 'wands',
        categoryId: 'minor_arcana',
        order: 2,
        element: 'fire',
        content: {
          zh: {
            name: '权杖',
            description: '代表行动、创造力、激情和事业'
          },
          en: {
            name: 'Wands',
            description: 'Represents action, creativity, passion and career'
          },
          ja: {
            name: 'ワンド',
            description: '行動、創造性、情熱、キャリアを表します'
          },
          ko: {
            name: '완드',
            description: '행동, 창의성, 열정, 경력을 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        suitId: 'swords',
        categoryId: 'minor_arcana',
        order: 3,
        element: 'air',
        content: {
          zh: {
            name: '宝剑',
            description: '代表思想、沟通、冲突和挑战'
          },
          en: {
            name: 'Swords',
            description: 'Represents thoughts, communication, conflict and challenges'
          },
          ja: {
            name: 'ソード',
            description: '思考、コミュニケーション、対立、課題を表します'
          },
          ko: {
            name: '소드',
            description: '생각, 의사소통, 갈등, 도전을 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        suitId: 'pentacles',
        categoryId: 'minor_arcana',
        order: 4,
        element: 'earth',
        content: {
          zh: {
            name: '金币',
            description: '代表物质、金钱、工作和实际事务'
          },
          en: {
            name: 'Pentacles',
            description: 'Represents material matters, money, work and practical affairs'
          },
          ja: {
            name: 'ペンタクル',
            description: '物質的な事柄、お金、仕事、実用的な事柄を表します'
          },
          ko: {
            name: '펜타클',
            description: '물질적 문제, 돈, 일, 실용적인 문제를 나타냅니다'
          }
        },
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    // 创建牌组
    const decks: TarotDeckNew[] = [
      {
        deckId: 'rider-waite',
        content: {
          zh: {
            name: '韦特塔罗牌',
            description: '最经典和广泛使用的塔罗牌，由亚瑟·爱德华·韦特设计，帕梅拉·科尔曼·史密斯绘制',
            artist: '帕梅拉·科尔曼·史密斯',
            publisher: '莱德公司'
          },
          en: {
            name: 'Rider-Waite Tarot',
            description: 'The most classic and widely used tarot deck, designed by Arthur Edward Waite and illustrated by Pamela Colman Smith',
            artist: 'Pamela Colman Smith',
            publisher: 'Rider Company'
          },
          ja: {
            name: 'ライダー・ウェイト・タロット',
            description: '最もクラシックで広く使用されているタロットデッキ、アーサー・エドワード・ウェイトによってデザインされ、パメラ・コールマン・スミスによって描かれました',
            artist: 'パメラ・コールマン・スミス',
            publisher: 'ライダー社'
          },
          ko: {
            name: '라이더-웨이트 타로',
            description: '가장 클래식하고 널리 사용되는 타로 덱으로, 아서 에드워드 웨이트가 디자인하고 파멜라 콜먼 스미스가 그렸습니다',
            artist: '파멜라 콜먼 스미스',
            publisher: '라이더 컴퍼니'
          }
        },
        totalCards: 78,
        publishYear: 1909,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    // 清空现有数据并插入新数据
    await this.categoriesCollection.deleteMany({});
    await this.suitsCollection.deleteMany({});
    await this.decksCollection.deleteMany({});
    
    await this.categoriesCollection.insertMany(categories);
    await this.suitsCollection.insertMany(suits);
    await this.decksCollection.insertMany(decks);
    
    console.log('✅ Base data created successfully');
  }

  /**
   * 从API获取数据并迁移
   */
  private async migrateFromApi(): Promise<void> {
    console.log('🔄 Fetching data from API and migrating...');
    
    try {
      const response = await axios.get(`${this.API_BASE_URL}/cards`);
      const apiCards = response.data.cards;
      
      if (!apiCards || !Array.isArray(apiCards)) {
        throw new Error('Invalid API response format');
      }
      
      console.log(`📥 Fetched ${apiCards.length} cards from API`);
      
      // 按类型分组并排序
      const majorArcana = apiCards
        .filter(card => card.type === 'major')
        .sort((a, b) => (a.value_int || 0) - (b.value_int || 0));
      
      const minorArcana = apiCards
        .filter(card => card.type === 'minor');
      
      const allCards = [...majorArcana, ...minorArcana];
      
      // 转换为新格式
      const newCards: TarotCardNew[] = [];
      
      for (let i = 0; i < allCards.length; i++) {
        const apiCard = allCards[i];
        const newCard = await this.convertApiCardToNewFormat(apiCard, i);
        newCards.push(newCard);
      }
      
      // 清空现有卡牌数据并插入新数据
      await this.cardsCollection.deleteMany({});
      await this.cardsCollection.insertMany(newCards);
      
      console.log(`✅ Successfully migrated ${newCards.length} cards`);
    } catch (error) {
      console.error('❌ Failed to migrate from API:', error);
      throw error;
    }
  }

  /**
   * 将API卡牌数据转换为新格式
   */
  private async convertApiCardToNewFormat(apiCard: any, index: number): Promise<TarotCardNew> {
    const now = Date.now(); // 毫秒级时间戳
    
    // 生成卡牌ID
    const cardId = this.generateCardId(apiCard, index);
    
    // 确定分类和花色
    const categoryId = apiCard.type === 'major' ? 'major_arcana' : 'minor_arcana';
    const suitId = apiCard.type === 'minor' ? this.mapSuit(apiCard.suit) : undefined;
    
    // 获取中文翻译
    const chineseTranslation = this.getChineseTranslation(apiCard.name);
    
    // 提取关键词
    const englishKeywords = this.extractKeywords(apiCard.meaning_up, apiCard.meaning_rev);
    const chineseKeywords = this.translateKeywords(englishKeywords);
    
    return {
      cardId,
      deckId: 'rider-waite',
      categoryId,
      suitId,
      number: apiCard.value_int || (index + 1),
      rank: this.extractRank(apiCard.name, apiCard.value),
      images: {
        original: `/images/rider-waite/original/${apiCard.name_short}.jpg`,
        thumbnail: `/images/rider-waite/thumbnails/${apiCard.name_short}_thumb.jpg`,
        watermark: `/images/rider-waite/watermark/${apiCard.name_short}_wm.jpg`
      },
      content: {
        zh: {
          name: chineseTranslation.name,
          description: chineseTranslation.description,
          keywords: {
            upright: chineseKeywords.upright,
            reversed: chineseKeywords.reversed
          },
          meaning: {
            upright: this.translateMeaning(apiCard.meaning_up, 'zh'),
            reversed: this.translateMeaning(apiCard.meaning_rev, 'zh')
          }
        },
        en: {
          name: apiCard.name,
          description: apiCard.desc || `${apiCard.name} represents the essence of ${apiCard.type} arcana.`,
          keywords: {
            upright: englishKeywords.upright,
            reversed: englishKeywords.reversed
          },
          meaning: {
            upright: apiCard.meaning_up,
            reversed: apiCard.meaning_rev
          }
        },
        ja: {
          name: this.getJapaneseTranslation(apiCard.name).name,
          description: this.getJapaneseTranslation(apiCard.name).description,
          keywords: {
            upright: this.translateKeywordsToJapanese(englishKeywords.upright),
            reversed: this.translateKeywordsToJapanese(englishKeywords.reversed)
          },
          meaning: {
            upright: this.translateMeaning(apiCard.meaning_up, 'ja'),
            reversed: this.translateMeaning(apiCard.meaning_rev, 'ja')
          }
        },
        ko: {
          name: this.getKoreanTranslation(apiCard.name).name,
          description: this.getKoreanTranslation(apiCard.name).description,
          keywords: {
            upright: this.translateKeywordsToKorean(englishKeywords.upright),
            reversed: this.translateKeywordsToKorean(englishKeywords.reversed)
          },
          meaning: {
            upright: this.translateMeaning(apiCard.meaning_up, 'ko'),
            reversed: this.translateMeaning(apiCard.meaning_rev, 'ko')
          }
        }
      },
      metadata: {
        sourceUrl: `${this.API_BASE_URL}/cards/${apiCard.name_short}`,
        license: 'Public Domain',
        tags: this.generateTags(apiCard),
        symbolism: this.getSymbolism(apiCard.name),
        astrology: this.getAstrologicalCorrespondence(apiCard.name),
        numerology: {
          number: apiCard.value_int || 0,
          meaning: this.getNumerologyMeaning(apiCard.value_int || 0)
        },
        hebrewLetter: apiCard.type === 'major' ? this.getHebrewLetter(apiCard.value_int) : undefined
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * 生成卡牌ID
   */
  private generateCardId(apiCard: any, index: number): string {
    if (apiCard.type === 'major') {
      const cardNumber = apiCard.value_int ?? index;
      return `rw-major-${cardNumber.toString().padStart(2, '0')}`;
    } else {
      const suit = this.mapSuit(apiCard.suit);
      const number = apiCard.value_int || (index + 1);
      return `rw-${suit}-${number.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 映射花色
   */
  private mapSuit(suit: string): string {
    const suitMapping: { [key: string]: string } = {
      'wands': 'wands',
      'cups': 'cups',
      'swords': 'swords',
      'pentacles': 'pentacles'
    };
    return suitMapping[suit] || suit;
  }

  // 以下是辅助方法，用于翻译和数据处理
  private getChineseTranslation(englishName: string): { name: string; description: string } {
    const translations: { [key: string]: { name: string; description: string } } = {
      'The Fool': { name: '愚者', description: '愚者代表新的开始、纯真和冒险精神' },
      'The Magician': { name: '魔术师', description: '魔术师象征意志力、创造力和实现目标的能力' },
      'The High Priestess': { name: '女祭司', description: '女祭司代表直觉、神秘知识和内在智慧' },
      'The Empress': { name: '皇后', description: '皇后象征母性、丰饶和创造力' },
      'The Emperor': { name: '皇帝', description: '皇帝代表权威、结构和父性力量' },
      'The Hierophant': { name: '教皇', description: '教皇象征传统、精神指导和宗教信仰' },
      'The Lovers': { name: '恋人', description: '恋人代表爱情、选择和人际关系' },
      'The Chariot': { name: '战车', description: '战车象征意志力、控制和胜利' },
      'Strength': { name: '力量', description: '力量代表内在力量、勇气和自制力' },
      'The Hermit': { name: '隐士', description: '隐士象征内省、寻求真理和精神指导' },
      'Wheel of Fortune': { name: '命运之轮', description: '命运之轮代表变化、循环和命运' },
      'Justice': { name: '正义', description: '正义象征公平、平衡和道德判断' },
      'The Hanged Man': { name: '倒吊人', description: '倒吊人代表牺牲、新视角和精神觉醒' },
      'Death': { name: '死神', description: '死神象征转变、结束和重生' },
      'Temperance': { name: '节制', description: '节制代表平衡、调和和中庸之道' },
      'The Devil': { name: '恶魔', description: '恶魔象征诱惑、束缚和物质欲望' },
      'The Tower': { name: '塔', description: '塔代表突然的变化、破坏和启示' },
      'The Star': { name: '星星', description: '星星象征希望、灵感和精神指引' },
      'The Moon': { name: '月亮', description: '月亮代表幻象、直觉和潜意识' },
      'The Sun': { name: '太阳', description: '太阳象征快乐、成功和生命力' },
      'Judgement': { name: '审判', description: '审判代表重生、觉醒和最终判断' },
      'The World': { name: '世界', description: '世界象征完成、成就和宇宙意识' }
    };
    
    return translations[englishName] || { name: englishName, description: `${englishName}的含义` };
  }

  private getJapaneseTranslation(englishName: string): { name: string; description: string } {
    const translations: { [key: string]: { name: string; description: string } } = {
      'The Fool': { name: '愚者', description: '愚者は新しい始まり、純真さ、冒険心を表します' },
      'The Magician': { name: '魔術師', description: '魔術師は意志力、創造力、目標達成能力を象徴します' },
      // 添加更多翻译...
    };
    
    return translations[englishName] || { name: englishName, description: `${englishName}の意味` };
  }

  private getKoreanTranslation(englishName: string): { name: string; description: string } {
    const translations: { [key: string]: { name: string; description: string } } = {
      'The Fool': { name: '바보', description: '바보는 새로운 시작, 순수함, 모험 정신을 나타냅니다' },
      'The Magician': { name: '마법사', description: '마법사는 의지력, 창조력, 목표 달성 능력을 상징합니다' },
      // 添加更多翻译...
    };
    
    return translations[englishName] || { name: englishName, description: `${englishName}의 의미` };
  }

  private extractKeywords(meaningUp: string, meaningRev: string): { upright: string[]; reversed: string[] } {
    // 简单的关键词提取逻辑
    const upright = meaningUp.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
    const reversed = meaningRev.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
    
    return { upright, reversed };
  }

  private translateKeywords(englishKeywords: { upright: string[]; reversed: string[] }): { upright: string[]; reversed: string[] } {
    // 简化的翻译逻辑
    return {
      upright: englishKeywords.upright.map(keyword => this.translateKeyword(keyword)),
      reversed: englishKeywords.reversed.map(keyword => this.translateKeyword(keyword))
    };
  }

  private translateKeywordsToJapanese(keywords: string[]): string[] {
    return keywords.map(keyword => this.translateKeywordToJapanese(keyword));
  }

  private translateKeywordsToKorean(keywords: string[]): string[] {
    return keywords.map(keyword => this.translateKeywordToKorean(keyword));
  }

  private translateKeyword(keyword: string): string {
    const translations: { [key: string]: string } = {
      'new beginnings': '新开始',
      'innocence': '纯真',
      'spontaneity': '自发性',
      'willpower': '意志力',
      'creativity': '创造力',
      'skill': '技能',
      // 添加更多翻译...
    };
    
    return translations[keyword.toLowerCase()] || keyword;
  }

  private translateKeywordToJapanese(keyword: string): string {
    const translations: { [key: string]: string } = {
      'new beginnings': '新しい始まり',
      'innocence': '純真',
      'spontaneity': '自発性',
      // 添加更多翻译...
    };
    
    return translations[keyword.toLowerCase()] || keyword;
  }

  private translateKeywordToKorean(keyword: string): string {
    const translations: { [key: string]: string } = {
      'new beginnings': '새로운 시작',
      'innocence': '순수함',
      'spontaneity': '자발성',
      // 添加更多翻译...
    };
    
    return translations[keyword.toLowerCase()] || keyword;
  }

  private translateMeaning(meaning: string, language: SupportedLanguage): string {
    // 简化的翻译逻辑，实际应用中可以使用翻译API
    if (language === 'zh') {
      return `${meaning}（中文翻译）`;
    } else if (language === 'ja') {
      return `${meaning}（日本語翻訳）`;
    } else if (language === 'ko') {
      return `${meaning}（한국어 번역）`;
    }
    return meaning;
  }

  private extractRank(name: string, value: string): string | undefined {
    const ranks = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'];
    const lowerName = name.toLowerCase();
    
    for (const rank of ranks) {
      if (lowerName.includes(rank)) {
        return rank;
      }
    }
    
    return value?.toLowerCase();
  }

  private generateTags(apiCard: any): string[] {
    const tags: string[] = [];
    
    if (apiCard.type === 'major') {
      tags.push('major-arcana', 'spiritual-journey');
    } else {
      tags.push('minor-arcana', 'daily-life');
      if (apiCard.suit) {
        tags.push(apiCard.suit);
      }
    }
    
    return tags;
  }

  private getSymbolism(cardName: string): string[] {
    const symbolism: { [key: string]: string[] } = {
      'The Fool': ['白玫瑰', '悬崖', '小狗', '太阳'],
      'The Magician': ['无限符号', '四元素', '红玫瑰', '白百合'],
      // 添加更多象征意义...
    };
    
    return symbolism[cardName] || [];
  }

  private getAstrologicalCorrespondence(cardName: string): { planet?: string; sign?: string; element?: string } | undefined {
    const correspondences: { [key: string]: { planet?: string; sign?: string; element?: string } } = {
      'The Fool': { planet: 'Uranus', element: 'Air' },
      'The Magician': { planet: 'Mercury', element: 'Air' },
      // 添加更多对应关系...
    };
    
    return correspondences[cardName];
  }

  private getNumerologyMeaning(number: number): string {
    const meanings: { [key: number]: string } = {
      0: '无限可能，新的开始',
      1: '开始，领导力，独立',
      2: '平衡，合作，选择',
      // 添加更多数字含义...
    };
    
    return meanings[number] || `数字${number}的含义`;
  }

  private getHebrewLetter(cardNumber?: number): string | undefined {
    const letters: { [key: number]: string } = {
      0: 'Aleph',
      1: 'Beth',
      2: 'Gimel',
      // 添加更多希伯来字母...
    };
    
    return cardNumber !== undefined ? letters[cardNumber] : undefined;
  }

  /**
   * 创建数据库索引
   */
  private async createIndexes(): Promise<void> {
    console.log('📊 Creating database indexes...');
    
    try {
      // 卡牌分类索引
      await this.categoriesCollection.createIndex({ categoryId: 1 }, { unique: true });
      await this.categoriesCollection.createIndex({ isActive: 1 });
      
      // 花色索引
      await this.suitsCollection.createIndex({ suitId: 1 }, { unique: true });
      await this.suitsCollection.createIndex({ categoryId: 1 });
      await this.suitsCollection.createIndex({ isActive: 1 });
      
      // 卡牌索引
      await this.cardsCollection.createIndex({ cardId: 1 }, { unique: true });
      await this.cardsCollection.createIndex({ deckId: 1 });
      await this.cardsCollection.createIndex({ categoryId: 1 });
      await this.cardsCollection.createIndex({ suitId: 1 });
      await this.cardsCollection.createIndex({ number: 1 });
      await this.cardsCollection.createIndex({ isActive: 1 });
      
      // 牌组索引
      await this.decksCollection.createIndex({ deckId: 1 }, { unique: true });
      await this.decksCollection.createIndex({ isActive: 1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
      throw error;
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<void> {
    console.log('🔍 Validating migration results...');
    
    try {
      const categoriesCount = await this.categoriesCollection.countDocuments({ isActive: true });
      const suitsCount = await this.suitsCollection.countDocuments({ isActive: true });
      const cardsCount = await this.cardsCollection.countDocuments({ isActive: true });
      const decksCount = await this.decksCollection.countDocuments({ isActive: true });
      
      console.log(`📊 Migration results:`);
      console.log(`   - Categories: ${categoriesCount}`);
      console.log(`   - Suits: ${suitsCount}`);
      console.log(`   - Cards: ${cardsCount}`);
      console.log(`   - Decks: ${decksCount}`);
      
      if (categoriesCount === 0 || cardsCount === 0 || decksCount === 0) {
        throw new Error('Migration validation failed: Missing required data');
      }
      
      console.log('✅ Migration validation passed');
    } catch (error) {
      console.error('❌ Migration validation failed:', error);
      throw error;
    }
  }
}