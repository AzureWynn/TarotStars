import { Collection } from 'mongodb';
import { MongoConnection } from '../database/MongoConnection';
import { 
  TarotCardNew, 
  CardCategory, 
  CardSuit, 
  TarotDeckNew, 
  SupportedLanguage,
  LocalizedTarotCard
} from '../../domain/entities/NewTarotSchema';
import { INewTarotRepository } from '../../domain/repositories/INewRepository';

/**
 * 多语言塔罗牌仓储
 * 支持从新的多语言数据结构中获取和转换数据
 */
export class MultiLanguageTarotRepository implements INewTarotRepository {
  private cardsCollection: Collection<TarotCardNew>;
  private categoriesCollection: Collection<CardCategory>;
  private suitsCollection: Collection<CardSuit>;
  private decksCollection: Collection<TarotDeckNew>;

  constructor() {
    const db = MongoConnection.getInstance().getDb();
    this.cardsCollection = db.collection<TarotCardNew>('tarot_cards_multilingual');
    this.categoriesCollection = db.collection<CardCategory>('tarot_categories');
    this.suitsCollection = db.collection<CardSuit>('tarot_suits');
    this.decksCollection = db.collection<TarotDeckNew>('tarot_decks');
  }

  /**
   * 获取所有塔罗牌（多语言支持）
   */
  async getAllCards(deckId?: string, language: SupportedLanguage = 'zh', limit?: number, skip?: number): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }

      let query = this.cardsCollection.find(filter).sort({ number: 1 });
      if (skip) {
        query = query.skip(skip);
      }
      if (limit) {
        query = query.limit(limit);
      }
      const cards = await query.toArray();
      
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.convertToLocalizedCard(card, language);
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error('Error getting all cards:', error);
      return [];
    }
  }

  /**
   * 根据ID获取塔罗牌（多语言支持）
   */
  async getCardById(cardId: string, language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard | null> {
    try {
      const card = await this.cardsCollection.findOne({ cardId, isActive: true });
      if (!card) {
        return null;
      }
      
      return await this.convertToLocalizedCard(card, language);
    } catch (error) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  }

  /**
   * 随机获取一张塔罗牌（多语言支持）
   */
  async getRandomCard(deckId?: string, language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard | null> {
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
      
      return await this.convertToLocalizedCard(randomCard, language);
    } catch (error) {
      console.error('Error getting random card:', error);
      return null;
    }
  }



  /**
   * 将新格式的卡牌转换为本地化卡牌
   */
  private async convertToLocalizedCard(card: TarotCardNew, language: SupportedLanguage): Promise<LocalizedTarotCard | null> {
    try {
      // 获取分类信息
      const category = await this.categoriesCollection.findOne({ categoryId: card.categoryId, isActive: true });
      if (!category) {
        console.warn(`Category not found: ${card.categoryId}`);
        return null;
      }

      // 获取花色信息（如果有）
      let suit = undefined;
      if (card.suitId) {
        suit = await this.suitsCollection.findOne({ suitId: card.suitId, isActive: true });
      }

      // 获取卡牌内容
      const cardContent = card.content[language] || card.content['zh']; // 回退到中文
      const categoryContent = category.content[language] || category.content['zh'];
      const suitContent = suit ? (suit.content[language] || suit.content['zh']) : undefined;

      return {
        cardId: card.cardId,
        deckId: card.deckId,
        category: categoryContent,
        suit: suitContent,
        number: card.number,
        rank: card.rank,
        images: card.images,
        name: cardContent.name,
        description: cardContent.description,
        keywords: cardContent.keywords,
        meaning: cardContent.meaning,
        metadata: card.metadata
      };
    } catch (error) {
      console.error('Error converting to localized card:', error);
      return null;
    }
  }



  /**
   * 搜索卡牌
   */
  async searchCards(
    query: string,
    deckId?: string,
    language: SupportedLanguage = 'zh',
    limit: number = 10
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = {
        isActive: true,
        $or: [
          { [`content.${language}.name`]: { $regex: query, $options: 'i' } },
          { [`content.${language}.description`]: { $regex: query, $options: 'i' } },
          { [`content.${language}.keywords.upright`]: { $in: [new RegExp(query, 'i')] } },
          { [`content.${language}.keywords.reversed`]: { $in: [new RegExp(query, 'i')] } }
        ]
      };
      
      if (deckId) {
        filter.deckId = deckId;
      }

      const cards = await this.cardsCollection.find(filter).limit(limit).toArray();
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.convertToLocalizedCard(card, language);
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
   * 根据分类获取卡牌
   */
  async getCardsByCategory(
    categoryId: string,
    deckId?: string,
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { categoryId, isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }

      const cards = await this.cardsCollection.find(filter).sort({ number: 1 }).toArray();
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.convertToLocalizedCard(card, language);
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error('Error getting cards by category:', error);
      return [];
    }
  }

  /**
   * 根据花色获取卡牌
   */
  async getCardsBySuit(
    suitId: string,
    deckId?: string,
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    try {
      const filter: any = { suitId, isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }

      const cards = await this.cardsCollection.find(filter).sort({ number: 1 }).toArray();
      const localizedCards: LocalizedTarotCard[] = [];
      
      for (const card of cards) {
        const localizedCard = await this.convertToLocalizedCard(card, language);
        if (localizedCard) {
          localizedCards.push(localizedCard);
        }
      }
      
      return localizedCards;
    } catch (error) {
      console.error('Error getting cards by suit:', error);
      return [];
    }
  }

  /**
   * 获取牌组统计信息
   */
  async getDeckStatistics(deckId?: string): Promise<any> {
    try {
      const filter: any = { isActive: true };
      if (deckId) {
        filter.deckId = deckId;
      }

      const totalCards = await this.cardsCollection.countDocuments(filter);
      const majorArcana = await this.cardsCollection.countDocuments({ ...filter, categoryId: 'major-arcana' });
      const minorArcana = await this.cardsCollection.countDocuments({ ...filter, categoryId: 'minor-arcana' });
      
      return {
        totalCards,
        majorArcana,
        minorArcana,
        deckId: deckId || 'all'
      };
    } catch (error) {
      console.error('Error getting deck statistics:', error);
      return {
        totalCards: 0,
        majorArcana: 0,
        minorArcana: 0,
        deckId: deckId || 'all'
      };
    }
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(language: SupportedLanguage = 'zh'): Promise<any[]> {
    try {
      const categories = await this.categoriesCollection.find({ isActive: true }).toArray();
      return categories.map(category => ({
        id: category._id.toString(),
        name: category.content[language]?.name || category.content.zh?.name || category._id.toString(),
        description: category.content[language]?.description || category.content.zh?.description || '',
        order: category.order || 0
      }));
    } catch (error) {
      console.error('Error getting all categories:', error);
      return [];
    }
  }

  /**
   * 获取所有花色
   */
  async getAllSuits(language: SupportedLanguage = 'zh'): Promise<any[]> {
    try {
      const suits = await this.suitsCollection.find({ isActive: true }).toArray();
      return suits.map(suit => ({
        id: suit._id.toString(),
        name: suit.content[language]?.name || suit.content.zh?.name || suit._id.toString(),
        description: suit.content[language]?.description || suit.content.zh?.description || '',
        order: suit.order || 0
      }));
    } catch (error) {
      console.error('Error getting all suits:', error);
      return [];
    }
  }

  /**
   * 检查多语言数据是否可用
   */
  async isMultiLanguageDataAvailable(): Promise<boolean> {
    try {
      const cardCount = await this.cardsCollection.countDocuments({ isActive: true });
      return cardCount > 0;
    } catch (error) {
      console.error('Error checking multilingual data availability:', error);
      return false;
    }
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return ['zh', 'en', 'ja', 'ko'];
  }

  /**
   * 获取数据统计信息
   */
  async getStatistics(): Promise<{
    totalCards: number;
    totalCategories: number;
    totalSuits: number;
    totalDecks: number;
  }> {
    try {
      const [totalCards, totalCategories, totalSuits, totalDecks] = await Promise.all([
        this.cardsCollection.countDocuments({ isActive: true }),
        this.categoriesCollection.countDocuments({ isActive: true }),
        this.suitsCollection.countDocuments({ isActive: true }),
        this.decksCollection.countDocuments({ isActive: true })
      ]);

      return {
        totalCards,
        totalCategories,
        totalSuits,
        totalDecks
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalCards: 0,
        totalCategories: 0,
        totalSuits: 0,
        totalDecks: 0
      };
    }
  }
}