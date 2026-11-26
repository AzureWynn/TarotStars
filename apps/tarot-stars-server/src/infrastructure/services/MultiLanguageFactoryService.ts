import { Collection } from 'mongodb';
import { MongoConnection } from '../database/MongoConnection';
import {
  CardCategory,
  CardSuit,
  TarotCardNew,
  TarotDeckNew,
  SupportedLanguage,
  MultiLanguageContent,
  CardMultiLanguageContent,
  LocalizedTarotCard,
  MultiLanguageFactory
} from '../../domain/entities/NewTarotSchema';

/**
 * 多语言工厂服务
 * 负责处理多语言内容的获取、转换和本地化
 */
export class MultiLanguageFactoryService implements MultiLanguageFactory {
  private static instance: MultiLanguageFactoryService;
  
  private categoriesCollection: Collection<CardCategory>;
  private suitsCollection: Collection<CardSuit>;
  private cardsCollection: Collection<TarotCardNew>;
  private decksCollection: Collection<TarotDeckNew>;
  
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'zh';
  private readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];

  constructor() {
    const db = MongoConnection.getInstance().getDb();
    this.categoriesCollection = db.collection<CardCategory>('tarot_categories');
    this.suitsCollection = db.collection<CardSuit>('tarot_suits');
    this.cardsCollection = db.collection<TarotCardNew>('tarot_cards_multilingual');
    this.decksCollection = db.collection<TarotDeckNew>('tarot_decks');
  }

  static getInstance(): MultiLanguageFactoryService {
    if (!MultiLanguageFactoryService.instance) {
      MultiLanguageFactoryService.instance = new MultiLanguageFactoryService();
    }
    return MultiLanguageFactoryService.instance;
  }

  /**
   * 验证语言代码是否支持
   */
  private isLanguageSupported(language: SupportedLanguage): boolean {
    return this.SUPPORTED_LANGUAGES.includes(language);
  }

  /**
   * 获取有效的语言代码，如果不支持则返回默认语言
   */
  private getValidLanguage(language: SupportedLanguage): SupportedLanguage {
    return this.isLanguageSupported(language) ? language : this.DEFAULT_LANGUAGE;
  }

  /**
   * 获取多语言内容，支持回退机制
   */
  private getContentWithFallback<T extends Record<SupportedLanguage, any>>(
    content: T,
    language: SupportedLanguage
  ): T[SupportedLanguage] {
    const validLanguage = this.getValidLanguage(language);
    
    // 优先返回请求的语言
    if (content[validLanguage]) {
      return content[validLanguage];
    }
    
    // 回退到默认语言
    if (content[this.DEFAULT_LANGUAGE]) {
      return content[this.DEFAULT_LANGUAGE];
    }
    
    // 回退到第一个可用的语言
    for (const lang of this.SUPPORTED_LANGUAGES) {
      if (content[lang]) {
        return content[lang];
      }
    }
    
    throw new Error(`No content available for any supported language`);
  }

  /**
   * 获取卡牌分类的本地化内容
   */
  async getCardCategory(categoryId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null> {
    try {
      const category = await this.categoriesCollection.findOne({
        categoryId,
        isActive: true
      });
      
      if (!category) {
        return null;
      }
      
      return this.getContentWithFallback(category.content, language);
    } catch (error) {
      console.error(`Error getting card category ${categoryId}:`, error);
      return null;
    }
  }

  /**
   * 获取花色的本地化内容
   */
  async getCardSuit(suitId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null> {
    try {
      const suit = await this.suitsCollection.findOne({
        suitId,
        isActive: true
      });
      
      if (!suit) {
        return null;
      }
      
      return this.getContentWithFallback(suit.content, language);
    } catch (error) {
      console.error(`Error getting card suit ${suitId}:`, error);
      return null;
    }
  }

  /**
   * 获取卡牌的本地化内容
   */
  async getCard(cardId: string, language: SupportedLanguage): Promise<CardMultiLanguageContent | null> {
    try {
      const card = await this.cardsCollection.findOne({
        cardId,
        isActive: true
      });
      
      if (!card) {
        return null;
      }
      
      return this.getContentWithFallback(card.content, language);
    } catch (error) {
      console.error(`Error getting card ${cardId}:`, error);
      return null;
    }
  }

  /**
   * 获取牌组的本地化内容
   */
  async getDeck(deckId: string, language: SupportedLanguage): Promise<MultiLanguageContent | null> {
    try {
      const deck = await this.decksCollection.findOne({
        deckId,
        isActive: true
      });
      
      if (!deck) {
        return null;
      }
      
      return this.getContentWithFallback(deck.content, language);
    } catch (error) {
      console.error(`Error getting deck ${deckId}:`, error);
      return null;
    }
  }

  /**
   * 获取完整的本地化卡牌信息
   */
  async getLocalizedCard(cardId: string, language: SupportedLanguage): Promise<LocalizedTarotCard | null> {
    try {
      // 尝试通过id查询，如果失败则通过cardId和_id查询
      let card = await this.cardsCollection.findOne({
        $or: [
          { id: cardId },
          { cardId: cardId }
        ],
        isActive: true
      });
      
      // 如果通过id/cardId找不到，尝试通过_id查询
      if (!card) {
        try {
          const { ObjectId } = require('mongodb');
          card = await this.cardsCollection.findOne({
            _id: new ObjectId(cardId),
            isActive: true
          });
        } catch (e) {
          // 如果cardId不是有效的ObjectId，忽略错误
        }
      }
      
      if (!card) {
          return null;
        }
      
      // 获取卡牌内容
      const cardContent = this.getContentWithFallback(card.content, language);
      
      if (!cardContent) {
        return null;
      }
      
      // 创建默认分类信息（基于metadata.tags）
      const categoryName = card.metadata?.tags?.includes('major-arcana') ? 
        (language === 'en' ? 'Major Arcana' : 
         language === 'ja' ? '大アルカナ' : 
         language === 'ko' ? '메이저 아르카나' : '大阿卡纳') :
        (language === 'en' ? 'Minor Arcana' : 
         language === 'ja' ? '小アルカナ' : 
         language === 'ko' ? '마이너 아르카나' : '小阿卡纳');
      
      const category = {
        name: categoryName,
        description: categoryName
      };
      
      // 获取花色信息（如果有）
      let suit: MultiLanguageContent | undefined;
      if (card.suitId) {
        suit = await this.getCardSuit(card.suitId, language) || undefined;
      }
      
      return {
        cardId: (card as any).id || card.cardId || card._id,
        deckId: card.deckId || 'rider-waite',
        category,
        suit,
        number: (card as any).cardNumber || card.number,
        rank: card.rank,
        images: card.images,
        name: cardContent.name,
        description: cardContent.description,
        keywords: cardContent.keywords,
        meaning: cardContent.meaning,
        metadata: card.metadata
      };
    } catch (error) {
      console.error(`Error getting localized card ${cardId}:`, error);
      return null;
    }
  }

  /**
   * 批量获取本地化卡牌列表
   */
  async getLocalizedCards(
    filter: Partial<Pick<TarotCardNew, 'deckId' | 'categoryId' | 'suitId'>> = {},
    language: SupportedLanguage,
    limit?: number,
    skip?: number
  ): Promise<LocalizedTarotCard[]> {
    try {
      const query: any = { isActive: true, ...filter };
      
      let cursor = this.cardsCollection
        .find(query)
        .sort({ number: 1 });
      
      if (skip) {
        cursor = cursor.skip(skip);
      }
      
      if (limit) {
        cursor = cursor.limit(limit);
      }
      
      const cards = await cursor.toArray();
      
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.getLocalizedCard((card as any).id || card.cardId || card._id, language);
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error('Error getting localized cards:', error);
      return [];
    }
  }

  /**
   * 获取随机卡牌
   */
  async getRandomLocalizedCard(
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<LocalizedTarotCard | null> {
    try {
      const filter: any = { isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }
      
      const cards = await this.cardsCollection.find(filter).toArray();
      
      if (cards.length === 0) {
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * cards.length);
      const randomCard = cards[randomIndex];
      
      const localizedCard = await this.getLocalizedCard((randomCard as any).id || randomCard.cardId || randomCard._id, language);
      
      return localizedCard;
    } catch (error) {
      console.error('💥 Error getting random localized card:', error);
      return null;
    }
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  /**
   * 获取默认语言
   */
  getDefaultLanguage(): SupportedLanguage {
    return this.DEFAULT_LANGUAGE;
  }
}