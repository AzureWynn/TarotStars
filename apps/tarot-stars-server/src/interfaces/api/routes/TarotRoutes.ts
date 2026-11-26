import { Router, Request, Response } from 'express';
import { TarotUseCases, UserUseCases } from '../../../application/usecases/TarotUseCases';
import { optionalTelegramAuth } from '../middleware/TelegramAuth';
import { SupportedLanguage } from '../../../domain/entities/NewTarotSchema';
import { TarotRepository } from '../../../infrastructure/repositories/TarotRepository';
import { MongoDailyReadingRepository } from '../../../infrastructure/repositories/DailyReadingRepository';
import { MongoUserRepository } from '../../../infrastructure/repositories/UserRepository';
import Joi from 'joi';

/**
 * 新塔罗牌API路由
 * 支持新的多语言schema和语言工厂模式
 */
export class TarotRoutes {
  private router: Router;
  private tarotUseCases!: TarotUseCases;
  private userUseCases!: UserUseCases;

  constructor() {
    this.router = Router();
    this.initializeUseCases();
    this.setupRoutes();
  }

  private initializeUseCases(): void {
    // 初始化仓储
    const tarotCardRepository = new TarotRepository();
    const dailyReadingRepository = new MongoDailyReadingRepository();
    const userRepository = new MongoUserRepository();

    // 初始化用例
    this.tarotUseCases = new TarotUseCases(
      dailyReadingRepository,
      userRepository,
      tarotCardRepository
    );
    
    this.userUseCases = new UserUseCases(userRepository);
  }

  private setupRoutes(): void {
    // 用户相关
    this.router.post('/user', optionalTelegramAuth, this.createOrUpdateUser.bind(this));
    this.router.get('/user/:telegramId', this.getUser.bind(this));
    this.router.put('/user/:telegramId/language', this.updateUserLanguage.bind(this));
    
    // 每日抽牌
    this.router.post('/daily-reading', optionalTelegramAuth, this.getDailyReading.bind(this));
    this.router.get('/has-reading-today/:userId', this.hasReadingToday.bind(this));
    
    // 历史记录
    this.router.get('/history/:userId', this.getHistory.bind(this));
    
    // 卡牌相关 - 新格式
    this.router.get('/cards', this.getAllCards.bind(this));
    this.router.get('/cards/:cardId', this.getCardById.bind(this));
    this.router.get('/cards/search', this.searchCards.bind(this));
    this.router.get('/cards/category/:categoryId', this.getCardsByCategory.bind(this));
    this.router.get('/cards/suit/:suitId', this.getCardsBySuit.bind(this));
    
    // 随机抽牌
    this.router.get('/random-card', this.getRandomCard.bind(this));
    
    // 分类和花色
    this.router.get('/categories', this.getCategories.bind(this));
    this.router.get('/suits', this.getSuits.bind(this));
    this.router.get('/decks', this.getDecks.bind(this));
    
    // 统计信息
    this.router.get('/statistics', this.getStatistics.bind(this));
    
    // 语言支持
    this.router.get('/languages', this.getSupportedLanguages.bind(this));
    
    // 兼容性路由（旧格式）
    this.router.get('/legacy/cards', this.getLegacyCards.bind(this));
    this.router.get('/legacy/random-card', this.getLegacyRandomCard.bind(this));
  }

  /**
   * 创建或更新用户
   */
  private async createOrUpdateUser(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        telegramId: Joi.number().required(),
        userData: Joi.object({
          username: Joi.string().optional(),
          firstName: Joi.string().optional(),
          lastName: Joi.string().optional(),
          languageCode: Joi.string().optional()
        }).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { telegramId, userData } = value;
      
      console.log('Creating/updating user with data:', { telegramId, userData });
      
      const user = await this.userUseCases.createOrUpdateUser(telegramId, userData);
      
      res.json({
        success: true,
        data: {
          id: user._id?.toString(),
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          languageCode: user.languageCode,
          totalReadings: user.totalReadings,
          lastReadingDate: user.lastReadingDate,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取用户信息
   */
  private async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params;
      const telegramIdNum = parseInt(telegramId);
      
      if (isNaN(telegramIdNum)) {
        res.status(400).json({ error: 'Invalid telegram ID' });
        return;
      }

      const user = await this.userUseCases.getUserByTelegramId(telegramIdNum);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user._id?.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          totalReadings: user.totalReadings,
          lastReadingDate: user.lastReadingDate,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取每日塔罗牌
   */
  private async getDailyReading(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        telegramId: Joi.number().required(),
        userData: Joi.object({
          username: Joi.string().optional(),
          firstName: Joi.string().optional(),
          lastName: Joi.string().optional(),
          languageCode: Joi.string().optional()
        }).optional(),
        language: Joi.string().valid('zh', 'en', 'ja', 'ko').optional().default('zh'),
        card: Joi.object().optional(),
        isReversed: Joi.boolean().optional(),
        interpretation: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { telegramId, userData, language } = value;
      const lang = language as SupportedLanguage;

      // 创建或更新用户
      const user = await this.userUseCases.createOrUpdateUser(telegramId, userData || {});
      
      // 检查今日是否已抽牌
      const hasReading = await this.tarotUseCases.hasReadingToday(user._id!);

      // 获取每日塔罗牌
      const reading = await this.tarotUseCases.getDailyReading(user._id!, lang);
      
      res.json({
        success: true,
        data: {
          id: reading._id?.toString(),
          card: reading.card,
          isReversed: reading.isReversed,
          interpretation: reading.interpretation,
          date: reading.date,
          createdAt: reading.createdAt
        },
        isExistingReading: hasReading,
        language: lang,
        message: hasReading ? 'existing_reading' : 'card_drawn'
      });
    } catch (error) {
      console.error('Error getting daily reading:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 检查今日是否已抽牌
   */
  private async hasReadingToday(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const hasReading = await this.tarotUseCases.hasReadingToday(userId);
      
      res.json({
        success: true,
        data: { hasReading }
      });
    } catch (error) {
      console.error('Error checking daily reading:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取历史记录
   */
  private async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      if (limit > 50) {
        res.status(400).json({ error: 'Limit cannot exceed 50' });
        return;
      }

      // 检查userId是否为Telegram ID（纯数字）还是MongoDB ObjectId
      let actualUserId = userId;
      const telegramIdNum = parseInt(userId);
      
      if (!isNaN(telegramIdNum) && telegramIdNum.toString() === userId) {
        // 这是一个Telegram ID，需要转换为MongoDB用户ID
        const user = await this.userUseCases.getUserByTelegramId(telegramIdNum);
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        actualUserId = user._id!.toString();
      }

      const history = await this.tarotUseCases.getUserReadingHistory(actualUserId, limit, language);
      
      res.json({
        success: true,
        data: history.map(reading => ({
          id: reading._id,
          card: reading.card,
          isReversed: reading.isReversed,
          interpretation: reading.interpretation,
          date: reading.date,
          createdAt: reading.createdAt
        })),
        language
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取所有卡牌（新格式）
   */
  private async getAllCards(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const deckId = (req.query.deck as string) || 'rider-waite';
      
      const cards = await this.tarotUseCases.getNewFormatAllCards(deckId, language);
      
      res.json({
        success: true,
        data: cards,
        language,
        deckId,
        total: cards.length
      });
    } catch (error) {
      console.error('Error getting all cards:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 根据ID获取卡牌
   */
  private async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      
      if (!cardId) {
        res.status(400).json({ error: 'Card ID is required' });
        return;
      }

      const card = await this.tarotUseCases.getNewFormatCard(cardId, language);
      
      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      res.json({
        success: true,
        data: card,
        language
      });
    } catch (error) {
      console.error('Error getting card by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 搜索卡牌
   */
  private async searchCards(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const deckId = (req.query.deck as string) || 'rider-waite';
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      if (limit > 50) {
        res.status(400).json({ error: 'Limit cannot exceed 50' });
        return;
      }

      const cards = await this.tarotUseCases.searchCards(query, deckId, language, limit);
      
      res.json({
        success: true,
        data: cards,
        language,
        query,
        total: cards.length
      });
    } catch (error) {
      console.error('Error searching cards:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 根据分类获取卡牌
   */
  private async getCardsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const deckId = (req.query.deck as string) || 'rider-waite';
      
      if (!categoryId) {
        res.status(400).json({ error: 'Category ID is required' });
        return;
      }

      const cards = await this.tarotUseCases.getCardsByCategory(categoryId, deckId, language);
      
      res.json({
        success: true,
        data: cards,
        language,
        categoryId,
        total: cards.length
      });
    } catch (error) {
      console.error('Error getting cards by category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 根据花色获取卡牌
   */
  private async getCardsBySuit(req: Request, res: Response): Promise<void> {
    try {
      const { suitId } = req.params;
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const deckId = (req.query.deck as string) || 'rider-waite';
      
      if (!suitId) {
        res.status(400).json({ error: 'Suit ID is required' });
        return;
      }

      const cards = await this.tarotUseCases.getCardsBySuit(suitId, deckId, language);
      
      res.json({
        success: true,
        data: cards,
        language,
        suitId,
        total: cards.length
      });
    } catch (error) {
      console.error('Error getting cards by suit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 随机抽牌
   */
  private async getRandomCard(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const localizedCard = await this.tarotUseCases.drawRandomCard(language);
      const isReversed = Math.random() < 0.3;
      
      res.json({
        success: true,
        data: {
          card: localizedCard,
          isReversed,
          interpretation: this.tarotUseCases.generateInterpretation(localizedCard, isReversed, language)
        },
        language
      });
    } catch (error) {
      console.error('Error getting random card:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取分类列表
   */
  private async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const stats = await this.tarotUseCases.getCategoryStatistics('rider-waite', language);
      
      res.json({
        success: true,
        data: stats.categories,
        language
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取花色列表
   */
  private async getSuits(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const stats = await this.tarotUseCases.getCategoryStatistics('rider-waite', language);
      
      res.json({
        success: true,
        data: stats.suits,
        language
      });
    } catch (error) {
      console.error('Error getting suits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取牌组列表
   */
  private async getDecks(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      // 这里可以扩展支持多个牌组
      const decks = [{
        deckId: 'rider-waite',
        name: language === 'zh' ? '韦特塔罗牌' : 'Rider-Waite Tarot',
        description: language === 'zh' ? '经典的韦特塔罗牌，包含78张牌' : 'Classic Rider-Waite Tarot with 78 cards',
        totalCards: 78,
        publishYear: 1909
      }];
      
      res.json({
        success: true,
        data: decks,
        language
      });
    } catch (error) {
      console.error('Error getting decks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取统计信息
   */
  private async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const deckId = (req.query.deck as string) || 'rider-waite';
      
      const stats = await this.tarotUseCases.getCategoryStatistics(deckId, language);
      
      res.json({
        success: true,
        data: stats,
        language,
        deckId
      });
    } catch (error) {
      console.error('Error getting statistics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 更新用户语言设置
   */
  private async updateUserLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params;
      const telegramIdNum = parseInt(telegramId);
      
      if (isNaN(telegramIdNum)) {
        res.status(400).json({ error: 'Invalid telegram ID' });
        return;
      }

      const schema = Joi.object({
        languageCode: Joi.string().valid('zh', 'en', 'ja', 'ko').required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { languageCode } = value;
      const lang = languageCode as SupportedLanguage;

      // 先获取用户信息
      const user = await this.userUseCases.getUserByTelegramId(telegramIdNum);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // 更新用户语言设置
      const updatedUser = await this.userUseCases.updateUserLanguage(user._id!, lang);
      
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id: updatedUser._id?.toString(),
          languageCode: updatedUser.languageCode
        },
        message: 'Language updated successfully'
      });
    } catch (error) {
      console.error('Error updating user language:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取支持的语言列表
   */
  private async getSupportedLanguages(_req: Request, res: Response): Promise<void> {
    try {
      const languages = [
        { code: 'zh', name: '中文', nativeName: '中文' },
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' }
      ];
      
      res.json({
        success: true,
        data: languages
      });
    } catch (error) {
      console.error('Error getting supported languages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 获取卡牌（兼容旧格式）
   */
  private async getLegacyCards(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const cards = await this.tarotUseCases.getAllCards(language);
      
      res.json({
        success: true,
        data: cards,
        language,
        format: 'legacy'
      });
    } catch (error) {
      console.error('Error getting legacy cards:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 随机抽牌（兼容旧格式）
   */
  private async getLegacyRandomCard(req: Request, res: Response): Promise<void> {
    try {
      const language = (req.query.lang as SupportedLanguage) || 'zh';
      const localizedCard = await this.tarotUseCases.drawRandomCard(language);
      const isReversed = Math.random() < 0.3;
      
      // 转换为旧格式
      const oldFormatCard = this.convertToOldFormat(localizedCard);
      
      res.json({
        success: true,
        data: {
          card: oldFormatCard,
          isReversed,
          interpretation: this.tarotUseCases.generateInterpretation(oldFormatCard, isReversed, language)
        },
        language,
        format: 'legacy'
      });
    } catch (error) {
      console.error('Error getting legacy random card:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * 将LocalizedTarotCard转换为TarotCard格式
   */
  private convertToOldFormat(localizedCard: any): any {
    return {
      id: localizedCard.cardId,
      nameEn: localizedCard.name,
      imageUrl: localizedCard.imageUrl || `/images/cards/${localizedCard.cardId}.jpg`,
      suit: localizedCard.suit?.name || '',
      category: localizedCard.category?.name?.includes('大阿卡纳') || localizedCard.category?.name?.includes('Major') ? 'major' : 'minor',
      number: localizedCard.number,
      keywords: localizedCard.keywords,
      meaning: localizedCard.meaning,
      advice: localizedCard.advice
    };
  }

  getRouter(): Router {
    return this.router;
  }
}