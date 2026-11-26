import {
  TarotCard,
  DailyReading,
  ReadingHistory,
  SupportedLanguage,
  CardFilter,
  PaginationParams,
  PaginatedResponse,
  CardStatistics,
  UserStatistics,
  LanguageInfo,
  LocalizedLabels
} from '../../domain/entities/TarotCard';
import { TarotApiService } from '../../infrastructure/api/TarotApiService';

export interface TarotApplicationService {
  // 用户管理
  initializeUser(language?: SupportedLanguage): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
  updateUserLanguage(userId: string, language: SupportedLanguage): Promise<void>;
  
  // 每日占卜
  getDailyReading(language?: SupportedLanguage): Promise<DailyReading>;
  checkTodayReading(userId: string): Promise<{ hasReading: boolean; reading?: DailyReading }>;
  
  // 卡牌操作
  getAllCards(language?: SupportedLanguage, filter?: CardFilter, pagination?: PaginationParams): Promise<PaginatedResponse<TarotCard>>;
  getCardDetails(cardId: string, language?: SupportedLanguage): Promise<TarotCard>;
  drawRandomCard(language?: SupportedLanguage): Promise<TarotCard>;
  searchCards(query: string, language?: SupportedLanguage, pagination?: PaginationParams): Promise<PaginatedResponse<TarotCard>>;
  
  // 分类和花色
  getCardsByCategory(category: string, language?: SupportedLanguage, pagination?: PaginationParams): Promise<PaginatedResponse<TarotCard>>;
  getCardsBySuit(suit: string, language?: SupportedLanguage, pagination?: PaginationParams): Promise<PaginatedResponse<TarotCard>>;
  getAvailableCategories(language?: SupportedLanguage): Promise<string[]>;
  getAvailableSuits(language?: SupportedLanguage): Promise<string[]>;
  getCategoryRelationships(): Promise<any>;
  
  // 历史记录
  getReadingHistory(userId: string, language?: SupportedLanguage, pagination?: PaginationParams): Promise<PaginatedResponse<DailyReading>>;
  deleteReading(readingId: string): Promise<void>;
  
  // 统计信息
  getCardStatistics(): Promise<CardStatistics>;
  getUserStatistics(userId: string): Promise<UserStatistics>;
  getPopularCards(language?: SupportedLanguage): Promise<TarotCard[]>;
  
  // 语言支持
  getSupportedLanguages(): Promise<LanguageInfo[]>;
  getLocalizedLabels(language?: SupportedLanguage): Promise<LocalizedLabels>;
  
  // 卡牌解读
  interpretCard(card: TarotCard, language?: SupportedLanguage, context?: string): Promise<string>;
}

export class TarotApplicationServiceImpl implements TarotApplicationService {
  private apiService: TarotApiService;
  private defaultLanguage: SupportedLanguage = 'zh';

  constructor(apiService?: TarotApiService, fallbackUser?: any) {
    this.apiService = apiService || new TarotApiService(undefined, fallbackUser);
  }

  // 设置备用用户数据
  setFallbackUser(user: any): void {
    this.apiService.setFallbackUser(user);
  }

  // 设置默认语言
  setDefaultLanguage(language: SupportedLanguage): void {
    this.defaultLanguage = language;
  }

  // 获取当前语言
  private getCurrentLanguage(language?: SupportedLanguage): SupportedLanguage {
    return language || this.defaultLanguage;
  }

  // 用户管理
  async initializeUser(language?: SupportedLanguage): Promise<any> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      const user = await this.apiService.createOrUpdateUser(currentLanguage);
      
      // 更新默认语言
      if (language) {
        this.setDefaultLanguage(language);
      }
      
      return user;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw new Error('用户初始化失败');
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      return await this.apiService.getUserById(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('获取用户信息失败');
    }
  }

  async updateUserLanguage(userId: string, language: SupportedLanguage): Promise<void> {
    try {
      await this.apiService.updateUserLanguage(userId, language);
      this.setDefaultLanguage(language);
    } catch (error) {
      console.error('Error updating user language:', error);
      throw new Error('更新语言设置失败');
    }
  }

  // 每日占卜
  async getDailyReading(language?: SupportedLanguage): Promise<DailyReading> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getDailyReading(currentLanguage);
    } catch (error) {
      console.error('Error getting daily reading:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          throw new Error('网络连接失败，请检查网络后重试');
        }
        if (error.message.includes('500')) {
          throw new Error('服务器暂时不可用，请稍后重试');
        }
      }
      
      throw new Error('获取今日占卜失败，请重试');
    }
  }

  async checkTodayReading(userId: string): Promise<{ hasReading: boolean; reading?: DailyReading }> {
    try {
      return await this.apiService.checkDailyReading(userId);
    } catch (error) {
      console.error('Error checking today reading:', error);
      return { hasReading: false };
    }
  }

  // 卡牌操作
  async getAllCards(
    language?: SupportedLanguage,
    filter?: CardFilter,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getAllCards(currentLanguage, filter, pagination);
    } catch (error) {
      console.error('Error getting all cards:', error);
      throw new Error('获取卡牌列表失败');
    }
  }

  async getCardDetails(cardId: string, language?: SupportedLanguage): Promise<TarotCard> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getCardById(cardId, currentLanguage);
    } catch (error) {
      console.error('Error getting card details:', error);
      throw new Error('获取卡牌详情失败');
    }
  }

  async drawRandomCard(language?: SupportedLanguage): Promise<TarotCard> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.drawRandomCard(currentLanguage);
    } catch (error) {
      console.error('Error drawing random card:', error);
      throw new Error('随机抽牌失败');
    }
  }

  async searchCards(
    query: string,
    language?: SupportedLanguage,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.searchCards(query, currentLanguage, pagination);
    } catch (error) {
      console.error('Error searching cards:', error);
      throw new Error('搜索卡牌失败');
    }
  }

  // 分类和花色
  async getCardsByCategory(
    category: string,
    language?: SupportedLanguage,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getCardsByCategory(category, currentLanguage, pagination);
    } catch (error) {
      console.error('Error getting cards by category:', error);
      throw new Error('获取分类卡牌失败');
    }
  }

  async getCardsBySuit(
    suit: string,
    language?: SupportedLanguage,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getCardsBySuit(suit, currentLanguage, pagination);
    } catch (error) {
      console.error('Error getting cards by suit:', error);
      throw new Error('获取花色卡牌失败');
    }
  }

  async getAvailableCategories(language?: SupportedLanguage): Promise<string[]> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getCategories(currentLanguage);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getAvailableSuits(language?: SupportedLanguage): Promise<string[]> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getSuits(currentLanguage);
    } catch (error) {
      console.error('Error getting suits:', error);
      return [];
    }
  }

  async getCategoryRelationships(): Promise<any> {
    try {
      return await this.apiService.getCategoryRelationships();
    } catch (error) {
      console.error('Error getting category relationships:', error);
      return {};
    }
  }

  // 历史记录
  async getReadingHistory(
    userId: string,
    language?: SupportedLanguage,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DailyReading>> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getReadingHistory(userId, currentLanguage, pagination);
    } catch (error) {
      console.error('Error getting reading history:', error);
      
      // 如果用户不存在或没有历史记录，返回空结果
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false
        };
      }
      
      throw new Error('获取占卜历史失败');
    }
  }

  async deleteReading(readingId: string): Promise<void> {
    try {
      await this.apiService.deleteReading(readingId);
    } catch (error) {
      console.error('Error deleting reading:', error);
      throw new Error('删除占卜记录失败');
    }
  }

  // 统计信息
  async getCardStatistics(): Promise<CardStatistics> {
    try {
      return await this.apiService.getCardStatistics();
    } catch (error) {
      console.error('Error getting card statistics:', error);
      throw new Error('获取卡牌统计失败');
    }
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      return await this.apiService.getUserStatistics(userId);
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw new Error('获取用户统计失败');
    }
  }

  async getPopularCards(language?: SupportedLanguage): Promise<TarotCard[]> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getPopularCards(currentLanguage);
    } catch (error) {
      console.error('Error getting popular cards:', error);
      return [];
    }
  }

  // 语言支持
  async getSupportedLanguages(): Promise<LanguageInfo[]> {
    try {
      return await this.apiService.getSupportedLanguages();
    } catch (error) {
      console.error('Error getting supported languages:', error);
      // 返回默认支持的语言
      return [
        { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
      ];
    }
  }

  async getLocalizedLabels(language?: SupportedLanguage): Promise<LocalizedLabels> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      return await this.apiService.getLocalizedLabels(currentLanguage);
    } catch (error) {
      console.error('Error getting localized labels:', error);
      
      // 返回默认的中文标签
      return {
        position: {
          upright: '正位',
          reversed: '逆位'
        },
        arcana: {
          major: '大阿卡纳',
          minor: '小阿卡纳'
        },
        suits: {
          cups: '圣杯',
          wands: '权杖',
          swords: '宝剑',
          pentacles: '星币'
        },
        actions: {
          draw: '抽牌',
          redraw: '重新抽牌',
          save: '保存',
          share: '分享',
          history: '历史记录'
        },
        messages: {
          loading: '加载中...',
          error: '出错了',
          noData: '暂无数据',
          success: '成功'
        }
      };
    }
  }

  // 卡牌解读
  async interpretCard(
    card: TarotCard,
    language?: SupportedLanguage,
    context?: string
  ): Promise<string> {
    try {
      const currentLanguage = this.getCurrentLanguage(language);
      const languageContent = card.languages[currentLanguage];
      
      if (!languageContent) {
        throw new Error(`Card content not available in language: ${currentLanguage}`);
      }

      const position = card.isReversed ? '逆位' : '正位';
      const meaning = card.isReversed ? languageContent.meaning.reversed : languageContent.meaning.upright;
      const keywords = card.isReversed ? languageContent.keywords.reversed : languageContent.keywords.upright;
      const advice = card.isReversed ? languageContent.advice?.reversed : languageContent.advice?.upright;
      
      let interpretation = `🔮 ${languageContent.name} (${position})\n\n`;
      interpretation += `📖 ${languageContent.description}\n\n`;
      interpretation += `💫 关键词：${keywords.join('、')}\n\n`;
      interpretation += `🎯 含义：${meaning}\n\n`;
      
      if (advice) {
        interpretation += `✨ 建议：${advice}\n\n`;
      }
      
      if (context === 'daily_reading') {
        interpretation += `🌟 今日指引：这张牌提醒你关注当下的机会和挑战，相信自己的直觉。`;
      }
      
      return interpretation;
    } catch (error) {
      console.error('Error interpreting card:', error);
      return '无法解读此卡牌，请稍后重试。';
    }
  }

  // 工具方法：格式化日期
  private formatDate(timestamp: number): string { // 毫秒级时间戳
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // 工具方法：检查是否为今天
  private isToday(timestamp: number): boolean { // 毫秒级时间戳
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // 工具方法：获取语言显示名称
  getLanguageDisplayName(language: SupportedLanguage): string {
    const languageNames = {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      ko: '한국어'
    };
    return languageNames[language] || language;
  }
}