import {
  TarotCard,
  DailyReading,
  SupportedLanguage,
  ApiResponse,
  CardFilter,
  PaginationParams,
  PaginatedResponse,
  CardStatistics,
  UserStatistics,
  LanguageInfo,
  LocalizedLabels
} from '../../domain/entities/TarotCard';

// API请求接口
interface DailyReadingRequest {
  telegramId: number;
  userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
  };
  language?: SupportedLanguage;
}

interface UserRequest {
  telegramId: number;
  userData: {
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
  };
}

export class TarotApiService {
  private baseUrl: string;
  private telegramWebApp: any;
  private fallbackUser: any;

  constructor(baseUrl: string = process.env.REACT_APP_API_BASE_URL || 'https://localhost:3001/api/v2/tarot', fallbackUser?: any) {
    this.baseUrl = baseUrl;
    this.telegramWebApp = (window as any).Telegram?.WebApp;
    this.fallbackUser = fallbackUser;
  }

  // 设置备用用户数据
  setFallbackUser(user: any): void {
    this.fallbackUser = user;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 添加Telegram验证数据
    if (this.telegramWebApp?.initData) {
      defaultHeaders['x-telegram-web-app-init-data'] = this.telegramWebApp.initData;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status} - ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error');
      }
      throw error;
    }
  }

  private getTelegramUserId(): number {
    console.log('getTelegramUserId: Checking Telegram WebApp data:', {
      hasWebApp: !!this.telegramWebApp,
      hasInitDataUnsafe: !!this.telegramWebApp?.initDataUnsafe,
      hasUser: !!this.telegramWebApp?.initDataUnsafe?.user,
      userId: this.telegramWebApp?.initDataUnsafe?.user?.id,
      hasInitData: !!this.telegramWebApp?.initData,
      initDataLength: this.telegramWebApp?.initData?.length,
      windowTelegram: !!(window as any).Telegram,
      windowTelegramWebApp: !!(window as any).Telegram?.WebApp,
      hasFallbackUser: !!this.fallbackUser,
      fallbackUserId: this.fallbackUser?.id
    });
    
    const user = this.telegramWebApp?.initDataUnsafe?.user;
    if (user?.id) {
      console.log('getTelegramUserId: Found user ID from initDataUnsafe:', user.id);
      return user.id;
    }
    
    if (this.telegramWebApp?.initData) {
      try {
        const initData = new URLSearchParams(this.telegramWebApp.initData);
        const userParam = initData.get('user');
        if (userParam) {
          const userData = JSON.parse(decodeURIComponent(userParam));
          if (userData.id) {
            console.log('getTelegramUserId: Found user ID from initData:', userData.id);
            return userData.id;
          }
        }
      } catch (error) {
        console.warn('Failed to parse user data from initData:', error);
      }
    }
    
    // 尝试使用备用用户数据
    if (this.fallbackUser?.id) {
      console.log('getTelegramUserId: Using fallback user ID:', this.fallbackUser.id);
      return this.fallbackUser.id;
    }
    
    // 如果所有方法都失败，抛出错误
    console.error('getTelegramUserId: No valid Telegram user ID available');
    throw new Error('No valid Telegram user ID available');
  }

  private getTelegramUserData() {
    const user = this.telegramWebApp?.initDataUnsafe?.user;
    if (user) {
      return {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        languageCode: user.language_code,
      };
    }
    
    // 尝试使用备用用户数据
    if (this.fallbackUser) {
      return {
        username: this.fallbackUser.username,
        firstName: this.fallbackUser.first_name,
        lastName: this.fallbackUser.last_name,
        languageCode: this.fallbackUser.language_code,
      };
    }
    
    // 如果都没有，返回空对象
    return {};
  }

  // 用户管理
  async createOrUpdateUser(language?: SupportedLanguage): Promise<any> {
    const telegramId = this.getTelegramUserId();
    const userData = this.getTelegramUserData();
    
    // 如果传入了语言参数，优先使用传入的语言
    if (language) {
      userData.languageCode = language;
    }
    
    console.log('Creating/updating user with data:', { telegramId, userData, requestedLanguage: language });

    const requestData: UserRequest = {
      telegramId,
      userData,
    };

    return this.makeRequest<any>('/user', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getUserById(userId: string): Promise<any> {
    return this.makeRequest<any>(`/user/${userId}`);
  }

  // 每日占卜
  async getDailyReading(language: SupportedLanguage = 'zh'): Promise<DailyReading> {
    const telegramId = this.getTelegramUserId();
    const userData = this.getTelegramUserData();
    userData.languageCode = language;

    const requestData: DailyReadingRequest = {
      telegramId,
      userData,
      language,
    };

    const response = await this.makeRequest<any>('/daily-reading', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    return {
      id: response.id,
      card: response.card,
      isReversed: response.isReversed,
      interpretation: response.interpretation,
      advice: response.advice,
      // 将日期转换为毫秒时间戳
      date: typeof response.date === 'number' ? response.date : new Date(response.date).getTime(),
      createdAt: typeof response.createdAt === 'number' ? response.createdAt : new Date(response.createdAt).getTime(),
      language,
      isExistingReading: response.isExistingReading,
      message: response.message,
    };
  }

  async checkDailyReading(userId: string): Promise<{ hasReading: boolean; reading?: DailyReading }> {
    return this.makeRequest<any>(`/daily-reading/check/${userId}`);
  }

  // 历史记录
  async getReadingHistory(
    userId: string,
    language: SupportedLanguage = 'zh',
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DailyReading>> {
    const params = new URLSearchParams({
      lang: language,
      ...(pagination?.limit && { limit: pagination.limit.toString() }),
    });

    // makeRequest已经解包了ApiResponse，直接返回data部分
    const readings = await this.makeRequest<DailyReading[]>(
      `/history/${userId}?${params.toString()}`
    );

    // 转换服务器响应格式为前端期望的PaginatedResponse格式
    const readingsArray = readings || [];
    return {
      items: readingsArray.map(reading => ({
        ...reading,
        // 确保日期是毫秒时间戳格式
        date: typeof reading.date === 'number' ? reading.date : new Date(reading.date).getTime(),
        createdAt: typeof reading.createdAt === 'number' ? reading.createdAt : new Date(reading.createdAt).getTime(),
      })),
      total: readingsArray.length,
      page: 1,
      limit: pagination?.limit || 10,
      hasNext: false,
      hasPrev: false
    };
  }

  async deleteReading(readingId: string): Promise<void> {
    return this.makeRequest<void>(`/reading/${readingId}`, {
      method: 'DELETE',
    });
  }

  // 卡牌操作
  async getAllCards(
    language: SupportedLanguage = 'zh',
    filter?: CardFilter,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    const params = new URLSearchParams({
      lang: language,
      ...(filter?.arcana && { arcana: filter.arcana }),
      ...(filter?.suit && { suit: filter.suit }),
      ...(filter?.numbers && { numbers: filter.numbers.join(',') }),
      ...(pagination?.page && { page: pagination.page.toString() }),
      ...(pagination?.limit && { limit: pagination.limit.toString() }),
    });

    return this.makeRequest<PaginatedResponse<TarotCard>>(
      `/cards?${params.toString()}`
    );
  }

  async getCardById(cardId: string, language: SupportedLanguage = 'zh'): Promise<TarotCard> {
    return this.makeRequest<TarotCard>(`/cards/${cardId}?lang=${language}`);
  }

  async drawRandomCard(language: SupportedLanguage = 'zh'): Promise<TarotCard> {
    return this.makeRequest<TarotCard>(`/cards/random?lang=${language}`);
  }

  async searchCards(
    query: string,
    language: SupportedLanguage = 'zh',
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    const params = new URLSearchParams({
      q: query,
      lang: language,
      ...(pagination?.page && { page: pagination.page.toString() }),
      ...(pagination?.limit && { limit: pagination.limit.toString() }),
    });

    return this.makeRequest<PaginatedResponse<TarotCard>>(
      `/cards/search?${params.toString()}`
    );
  }

  // 分类和花色
  async getCardsByCategory(
    category: string,
    language: SupportedLanguage = 'zh',
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    const params = new URLSearchParams({
      lang: language,
      ...(pagination?.page && { page: pagination.page.toString() }),
      ...(pagination?.limit && { limit: pagination.limit.toString() }),
    });

    return this.makeRequest<PaginatedResponse<TarotCard>>(
      `/categories/${category}/cards?${params.toString()}`
    );
  }

  async getCardsBySuit(
    suit: string,
    language: SupportedLanguage = 'zh',
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TarotCard>> {
    const params = new URLSearchParams({
      lang: language,
      ...(pagination?.page && { page: pagination.page.toString() }),
      ...(pagination?.limit && { limit: pagination.limit.toString() }),
    });

    return this.makeRequest<PaginatedResponse<TarotCard>>(
      `/suits/${suit}/cards?${params.toString()}`
    );
  }

  async getCategories(language: SupportedLanguage = 'zh'): Promise<string[]> {
    return this.makeRequest<string[]>(`/categories?lang=${language}`);
  }

  async getSuits(language: SupportedLanguage = 'zh'): Promise<string[]> {
    return this.makeRequest<string[]>(`/suits?lang=${language}`);
  }

  async getCategoryRelationships(): Promise<any> {
    return this.makeRequest<any>('/categories/relationships');
  }

  // 统计信息
  async getCardStatistics(): Promise<CardStatistics> {
    return this.makeRequest<CardStatistics>('/statistics/cards');
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    return this.makeRequest<UserStatistics>(`/statistics/user/${userId}`);
  }

  async getPopularCards(language: SupportedLanguage = 'zh'): Promise<TarotCard[]> {
    return this.makeRequest<TarotCard[]>(`/statistics/popular-cards?lang=${language}`);
  }

  // 语言支持
  async getSupportedLanguages(): Promise<LanguageInfo[]> {
    return this.makeRequest<LanguageInfo[]>('/languages');
  }

  async getLocalizedLabels(language: SupportedLanguage = 'zh'): Promise<LocalizedLabels> {
    return this.makeRequest<LocalizedLabels>(`/languages/${language}/labels`);
  }

  async updateUserLanguage(userId: string, language: SupportedLanguage): Promise<void> {
    return this.makeRequest<void>(`/user/${userId}/language`, {
      method: 'PUT',
      body: JSON.stringify({ languageCode: language }),
    });
  }

  // 错误处理辅助方法
  private handleError(error: any): never {
    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      if (error.message.includes('500')) {
        throw new Error('服务器暂时不可用，请稍后重试');
      }
      if (error.message.includes('404')) {
        throw new Error('服务未找到，请联系管理员');
      }
      if (error.message.includes('401')) {
        throw new Error('身份验证失败，请重新登录');
      }
    }
    
    throw new Error('操作失败，请重试');
  }
}