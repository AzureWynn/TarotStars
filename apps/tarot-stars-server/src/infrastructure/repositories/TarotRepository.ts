import { Collection } from 'mongodb';
import { MongoConnection } from '../database/MongoConnection';
import {
  CardCategory,
  CardSuit,
  TarotCardNew,
  TarotDeckNew,
  SupportedLanguage,
  LocalizedTarotCard
} from '../../domain/entities/NewTarotSchema';
import { MultiLanguageFactoryService } from '../services/MultiLanguageFactoryService';

/**
 * 新塔罗牌数据访问层
 * 使用新的多语言schema和语言工厂模式
 */
export interface INewTarotRepository {
  // 卡牌操作
  getAllCards(deckId?: string, language?: SupportedLanguage, limit?: number, skip?: number): Promise<LocalizedTarotCard[]>;
  getCardById(cardId: string, language?: SupportedLanguage): Promise<LocalizedTarotCard | null>;
  getRandomCard(deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard | null>;
  
  // 按分类获取卡牌
  getCardsByCategory(categoryId: string, deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard[]>;
  
  // 按花色获取卡牌
  getCardsBySuit(suitId: string, deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard[]>;
  
  // 分类和花色操作
  getAllCategories(language?: SupportedLanguage): Promise<any[]>;
  getAllSuits(language?: SupportedLanguage): Promise<any[]>;
  
  // 牌组操作
  getAllDecks(language?: SupportedLanguage): Promise<any[]>;
  getDeckById(deckId: string, language?: SupportedLanguage): Promise<any | null>;
  
  // 统计信息
  getCardCount(deckId?: string, categoryId?: string, suitId?: string): Promise<number>;
  getDeckStatistics(deckId: string): Promise<any>;
}

export class TarotRepository implements INewTarotRepository {
  private categoriesCollection: Collection<CardCategory>;
  private suitsCollection: Collection<CardSuit>;
  private cardsCollection: Collection<TarotCardNew>;
  private decksCollection: Collection<TarotDeckNew>;
  private multiLanguageFactory: MultiLanguageFactoryService;
  
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'zh';

  constructor() {
    const db = MongoConnection.getInstance().getDb();
    this.categoriesCollection = db.collection<CardCategory>('tarot_categories');
    this.suitsCollection = db.collection<CardSuit>('tarot_suits');
    this.cardsCollection = db.collection<TarotCardNew>('tarot_cards_multilingual');
    this.decksCollection = db.collection<TarotDeckNew>('tarot_decks');
    this.multiLanguageFactory = MultiLanguageFactoryService.getInstance();
  }

  /**
   * 获取所有卡牌
   */
  async getAllCards(
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE,
    limit?: number,
    skip?: number
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }
      
      return await this.multiLanguageFactory.getLocalizedCards(
        filter,
        language,
        limit,
        skip
      );
    } catch (error) {
      console.error('Error getting all cards:', error);
      return [];
    }
  }

  /**
   * 根据ID获取卡牌
   */
  async getCardById(
    cardId: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<LocalizedTarotCard | null> {
    try {
      return await this.multiLanguageFactory.getLocalizedCard(cardId, language);
    } catch (error) {
      console.error(`Error getting card ${cardId}:`, error);
      return null;
    }
  }

  /**
   * 获取随机卡牌
   */
  async getRandomCard(
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<LocalizedTarotCard | null> {
    try {
      return await this.multiLanguageFactory.getRandomLocalizedCard(deckId, language);
    } catch (error) {
      console.error('💥 Error in NewTarotRepository.getRandomCard:', error);
      return null;
    }
  }

  /**
   * 按分类获取卡牌
   */
  async getCardsByCategory(
    categoryId: string,
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { categoryId };
      if (deckId) {
        filter.deckId = deckId;
      }
      
      return await this.multiLanguageFactory.getLocalizedCards(filter, language);
    } catch (error) {
      console.error(`Error getting cards by category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * 按花色获取卡牌
   */
  async getCardsBySuit(
    suitId: string,
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { suitId };
      if (deckId) {
        filter.deckId = deckId;
      }
      
      return await this.multiLanguageFactory.getLocalizedCards(filter, language);
    } catch (error) {
      console.error(`Error getting cards by suit ${suitId}:`, error);
      return [];
    }
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(language: SupportedLanguage = this.DEFAULT_LANGUAGE): Promise<any[]> {
    try {
      const categories = await this.categoriesCollection
        .find({ isActive: true })
        .sort({ order: 1 })
        .toArray();
      
      const localizedCategories = [];
      
      for (const category of categories) {
        const localizedContent = await this.multiLanguageFactory.getCardCategory(
          category.categoryId,
          language
        );
        
        if (localizedContent) {
          localizedCategories.push({
            categoryId: category.categoryId,
            order: category.order,
            name: localizedContent.name,
            description: localizedContent.description
          });
        }
      }
      
      return localizedCategories;
    } catch (error) {
      console.error('Error getting all categories:', error);
      return [];
    }
  }

  /**
   * 获取所有花色
   */
  async getAllSuits(language: SupportedLanguage = this.DEFAULT_LANGUAGE): Promise<any[]> {
    try {
      const suits = await this.suitsCollection
        .find({ isActive: true })
        .sort({ order: 1 })
        .toArray();
      
      const localizedSuits = [];
      
      for (const suit of suits) {
        const localizedContent = await this.multiLanguageFactory.getCardSuit(
          suit.suitId,
          language
        );
        
        if (localizedContent) {
          localizedSuits.push({
            suitId: suit.suitId,
            categoryId: suit.categoryId,
            order: suit.order,
            element: suit.element,
            name: localizedContent.name,
            description: localizedContent.description
          });
        }
      }
      
      return localizedSuits;
    } catch (error) {
      console.error('Error getting all suits:', error);
      return [];
    }
  }

  /**
   * 获取所有牌组
   */
  async getAllDecks(language: SupportedLanguage = this.DEFAULT_LANGUAGE): Promise<any[]> {
    try {
      const decks = await this.decksCollection
        .find({ isActive: true })
        .toArray();
      
      const localizedDecks = [];
      
      for (const deck of decks) {
        const localizedContent = await this.multiLanguageFactory.getDeck(
          deck.deckId,
          language
        );
        
        if (localizedContent) {
          localizedDecks.push({
            deckId: deck.deckId,
            name: localizedContent.name,
            description: localizedContent.description,
            totalCards: deck.totalCards,
            publishYear: deck.publishYear
          });
        }
      }
      
      return localizedDecks;
    } catch (error) {
      console.error('Error getting all decks:', error);
      return [];
    }
  }

  /**
   * 根据ID获取牌组
   */
  async getDeckById(
    deckId: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE
  ): Promise<any | null> {
    try {
      const deck = await this.decksCollection.findOne({
        deckId,
        isActive: true
      });
      
      if (!deck) {
        return null;
      }
      
      const localizedContent = await this.multiLanguageFactory.getDeck(deckId, language);
      
      if (!localizedContent) {
        return null;
      }
      
      return {
        deckId: deck.deckId,
        name: localizedContent.name,
        description: localizedContent.description,
        totalCards: deck.totalCards,
        publishYear: deck.publishYear
      };
    } catch (error) {
      console.error(`Error getting deck ${deckId}:`, error);
      return null;
    }
  }

  /**
   * 获取卡牌数量
   */
  async getCardCount(
    deckId?: string,
    categoryId?: string,
    suitId?: string
  ): Promise<number> {
    try {
      const filter: any = { isActive: true };
      
      if (deckId) {
        filter.deckId = deckId;
      }
      
      if (categoryId) {
        filter.categoryId = categoryId;
      }
      
      if (suitId) {
        filter.suitId = suitId;
      }
      
      return await this.cardsCollection.countDocuments(filter);
    } catch (error) {
      console.error('Error getting card count:', error);
      return 0;
    }
  }

  /**
   * 获取牌组统计信息
   */
  async getDeckStatistics(deckId: string): Promise<any> {
    try {
      const totalCards = await this.getCardCount(deckId);
      const majorArcanaCount = await this.getCardCount(deckId, 'major_arcana');
      const minorArcanaCount = await this.getCardCount(deckId, 'minor_arcana');
      
      // 获取各花色的卡牌数量
      const cupsCount = await this.getCardCount(deckId, undefined, 'cups');
      const wandsCount = await this.getCardCount(deckId, undefined, 'wands');
      const swordsCount = await this.getCardCount(deckId, undefined, 'swords');
      const pentaclesCount = await this.getCardCount(deckId, undefined, 'pentacles');
      
      return {
        deckId,
        totalCards,
        majorArcana: majorArcanaCount,
        minorArcana: minorArcanaCount,
        suits: {
          cups: cupsCount,
          wands: wandsCount,
          swords: swordsCount,
          pentacles: pentaclesCount
        }
      };
    } catch (error) {
      console.error(`Error getting deck statistics for ${deckId}:`, error);
      return {
        deckId,
        totalCards: 0,
        majorArcana: 0,
        minorArcana: 0,
        suits: {
          cups: 0,
          wands: 0,
          swords: 0,
          pentacles: 0
        }
      };
    }
  }

  /**
   * 搜索卡牌
   */
  async searchCards(
    query: string,
    deckId?: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE,
    limit: number = 20
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = {
        isActive: true,
        $or: [
          { [`content.${language}.name`]: { $regex: query, $options: 'i' } },
          { [`content.${language}.description`]: { $regex: query, $options: 'i' } },
          { [`content.${language}.keywords.upright`]: { $regex: query, $options: 'i' } },
          { [`content.${language}.keywords.reversed`]: { $regex: query, $options: 'i' } }
        ]
      };
      
      if (deckId) {
        filter.deckId = deckId;
      }
      
      const cards = await this.cardsCollection
        .find(filter)
        .limit(limit)
        .toArray();
      
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.multiLanguageFactory.getLocalizedCard(
          card.cardId,
          language
        );
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error('Error searching cards:', error);
      return [];
    }
  }

  /**
   * 获取卡牌的相关推荐
   */
  async getRelatedCards(
    cardId: string,
    language: SupportedLanguage = this.DEFAULT_LANGUAGE,
    limit: number = 5
  ): Promise<LocalizedTarotCard[]> {
    try {
      const card = await this.cardsCollection.findOne({
        cardId,
        isActive: true
      });
      
      if (!card) {
        return [];
      }
      
      // 获取同分类或同花色的其他卡牌
      const filter: any = {
        isActive: true,
        cardId: { $ne: cardId },
        deckId: card.deckId,
        $or: [
          { categoryId: card.categoryId },
          { suitId: card.suitId }
        ]
      };
      
      const relatedCards = await this.cardsCollection
        .find(filter)
        .limit(limit)
        .toArray();
      
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const relatedCard of relatedCards) {
        const localizedCard = await this.multiLanguageFactory.getLocalizedCard(
          relatedCard.cardId,
          language
        );
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error(`Error getting related cards for ${cardId}:`, error);
      return [];
    }
  }
}