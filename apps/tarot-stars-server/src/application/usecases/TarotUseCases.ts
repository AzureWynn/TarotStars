import { ObjectId } from 'mongodb';
import { IDailyReadingRepository, IUserRepository } from '../../domain/repositories/INewRepository';
import { DailyReading, User } from '../../domain/entities/UserEntities';
import { 
  LocalizedTarotCard, 
  SupportedLanguage 
} from '../../domain/entities/NewTarotSchema';
import { IUserService } from '../../domain/services/ITarotService';
import { INewTarotRepository } from '../../domain/repositories/INewRepository';

/**
 * 新塔罗牌用例服务 - v2
 * 使用新的多语言schema和语言工厂模式
 */
export class TarotUseCases {
  private newTarotRepository: INewTarotRepository;

  constructor(
    private dailyReadingRepository: IDailyReadingRepository,
    private userRepository: IUserRepository,
    tarotRepository: INewTarotRepository
  ) {
    this.newTarotRepository = tarotRepository;
  }

  /**
   * 获取每日一牌
   */
  async getDailyReading(userId: string | ObjectId, language: SupportedLanguage = 'zh'): Promise<DailyReading & { card: LocalizedTarotCard; interpretation: string }> {
    // 生成基于用户ID和日期的种子（无论是否已有记录都要生成一致的结果）
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
    const seedInput = userIdStr + dateStr;
    const seed = this.hashCode(seedInput);
    
    // 使用种子生成固定的卡牌和逆位状态
    const newCard = await this.drawDailyCard(seed, language);
    const isReversed = this.seededRandom(seed + 1) < 0.3; // 30% 概率逆位
    
    // 检查今日是否已抽牌
    const hasReading = await this.hasReadingToday(userId);
    if (hasReading) {
      const existingReading = await this.dailyReadingRepository.getByUserIdAndDate(userId, today);
      if (existingReading) {
        // 动态生成解读（使用种子生成的一致结果）
        const interpretation = this.generateInterpretation(newCard, isReversed, language);
        
        return {
          ...existingReading,
          cardId: newCard.cardId, // 确保返回种子生成的卡牌ID
          isReversed, // 确保返回种子生成的逆位状态
          card: newCard,
          interpretation
        };
      }
    }

    // 如果没有记录，保存新的解读记录
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const reading: DailyReading = {
      userId: userObjectId,
      cardId: newCard.cardId,
      isReversed,
      date: Date.now(), // 毫秒级时间戳
      createdAt: Date.now() // 毫秒级时间戳
    };

    // 保存解读记录（不包含interpretation）
    const savedReading = await this.dailyReadingRepository.save(reading);
    
    // 更新用户最后抽牌时间
    await this.userRepository.update(userObjectId, {
      lastReadingDate: Date.now(), // 毫秒级时间戳
      totalReadings: await this.getUserTotalReadings(userObjectId) + 1
    });

    // 动态生成解读
    const interpretation = this.generateInterpretation(newCard, isReversed, language);

    return {
      ...savedReading,
      card: newCard,
      interpretation
    };
  }

  /**
   * 检查用户今日是否已抽牌
   */
  async hasReadingToday(userId: string | ObjectId): Promise<boolean> {
    return await this.dailyReadingRepository.hasReadingToday(userId);
  }

  /**
   * 获取用户历史解读记录
   */
  async getUserReadingHistory(
    userId: string | ObjectId, 
    limit: number = 10,
    language: SupportedLanguage = 'zh'
  ): Promise<(DailyReading & { card: LocalizedTarotCard; interpretation: string })[]> {
    const readings = await this.dailyReadingRepository.getHistoryByUserId(userId, limit);
    
    // 为每个历史记录动态生成本地化内容
    const localizedReadings = await Promise.all(
      readings.map(async (reading) => {
        const localizedCard = await this.newTarotRepository.getCardById(reading.cardId, language);
        if (!localizedCard) {
          throw new Error(`Card not found: ${reading.cardId}`);
        }
        const interpretation = this.generateInterpretation(localizedCard, reading.isReversed, language);
        
        return {
          ...reading,
          card: localizedCard,
          interpretation
        };
      })
    );
    
    return localizedReadings;
  }

  /**
   * 获取所有卡牌
   */
  async getAllCards(language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard[]> {
    return await this.newTarotRepository.getAllCards('rider-waite', language);
  }

  /**
   * 随机抽取塔罗牌
   */
  async drawRandomCard(language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard> {
    const newCard = await this.newTarotRepository.getRandomCard(undefined, language);
    if (!newCard) {
      throw new Error('No cards available');
    }
    return newCard;
  }

  /**
   * 基于种子抽取每日卡牌（确保同一天同一用户得到相同卡牌）
   */
  async drawDailyCard(seed: number, language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard> {
    // 获取所有可用卡牌，使用固定的deckId确保卡牌顺序一致
    const allCards = await this.newTarotRepository.getAllCards('rider-waite', language);
    if (!allCards || allCards.length === 0) {
      throw new Error('No cards available');
    }
    
    // 使用种子选择卡牌
    const cardIndex = Math.abs(seed) % allCards.length;
    return allCards[cardIndex];
  }

  /**
   * 生成塔罗牌解读
   */
  generateInterpretation(
    card: LocalizedTarotCard, 
    isReversed: boolean, 
    language: SupportedLanguage = 'zh'
  ): string {
    const meaning = isReversed ? card.meaning.reversed : card.meaning.upright;
    const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;
    
    // 根据语言返回不同的格式
    const positionText = this.getPositionText(isReversed, language);
    const keywordsLabel = this.getKeywordsLabel(language);
    const meaningLabel = this.getMeaningLabel(language);
    const adviceLabel = this.getAdviceLabel(language);
    
    return `🔮 ${card.name} (${positionText})\n\n` +
           `💫 ${keywordsLabel}：${keywords.join('、')}\n\n` +
           `📖 ${meaningLabel}：${meaning}\n\n` +
           `✨ ${adviceLabel}：${this.generateDailyAdvice(card, isReversed, language, card.cardId)}`;
  }

  /**
   * 获取新格式的卡牌（用于新API）
   */
  async getNewFormatCard(cardId: string, language: SupportedLanguage = 'zh'): Promise<LocalizedTarotCard | null> {
    return await this.newTarotRepository.getCardById(cardId, language);
  }

  /**
   * 获取新格式的所有卡牌
   */
  async getNewFormatAllCards(
    deckId: string = 'rider-waite', 
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    return await this.newTarotRepository.getAllCards(deckId, language);
  }

  /**
   * 搜索卡牌
   */
  async searchCards(
    query: string,
    deckId: string = 'rider-waite',
    language: SupportedLanguage = 'zh',
    limit: number = 10
  ): Promise<LocalizedTarotCard[]> {
    return await this.newTarotRepository.searchCards(query, deckId, language, limit);
  }

  /**
   * 获取多张随机卡牌
   */
  async getRandomCards(
    count: number = 3,
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    const cards: LocalizedTarotCard[] = [];
    for (let i = 0; i < count; i++) {
      const card = await this.drawRandomCard(language);
      cards.push(card);
    }
    return cards;
  }

  /**
   * 获取分类统计
   */
  async getCategoryStatistics(
    deckId: string = 'rider-waite',
    language: SupportedLanguage = 'zh'
  ) {
    const stats = await this.newTarotRepository.getDeckStatistics(deckId);
    const categories = await this.newTarotRepository.getAllCategories(language);
    const suits = await this.newTarotRepository.getAllSuits(language);
    
    return {
      ...stats,
      categories,
      suits
    };
  }

  /**
   * 根据分类获取卡牌
   */
  async getCardsByCategory(
    categoryId: string,
    deckId: string = 'rider-waite',
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    return await this.newTarotRepository.getCardsByCategory(categoryId, deckId, language);
  }

  /**
   * 根据花色获取卡牌
   */
  async getCardsBySuit(
    suitId: string,
    deckId: string = 'rider-waite',
    language: SupportedLanguage = 'zh'
  ): Promise<LocalizedTarotCard[]> {
    return await this.newTarotRepository.getCardsBySuit(suitId, deckId, language);
  }

  // 私有辅助方法



  /**
   * 生成每日建议
   */
  private generateDailyAdvice(
    card: LocalizedTarotCard, 
    isReversed: boolean, 
    language: SupportedLanguage,
    cardId?: string
  ): string {
    const adviceTemplates = this.getAdviceTemplates(language);
    
    if (!card.category || !card.category.name) {
      return adviceTemplates.minorUpright[0]; // 返回默认建议
    }
    
    const isMajor = card.category.name.includes('大阿卡纳') || card.category.name.includes('Major');
    
    // 使用卡牌ID作为种子来确保同一张卡牌的建议保持一致
    const seed = cardId ? this.hashCode(cardId) : 0;
    
    if (isMajor) {
      return isReversed 
        ? adviceTemplates.majorReversed[Math.abs(seed) % adviceTemplates.majorReversed.length]
        : adviceTemplates.majorUpright[Math.abs(seed) % adviceTemplates.majorUpright.length];
    } else {
      return isReversed
        ? adviceTemplates.minorReversed[Math.abs(seed) % adviceTemplates.minorReversed.length]
        : adviceTemplates.minorUpright[Math.abs(seed) % adviceTemplates.minorUpright.length];
    }
  }

  /**
   * 获取位置文本
   */
  private getPositionText(isReversed: boolean, language: SupportedLanguage): string {
    const supportedLangs: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    const lang: SupportedLanguage = supportedLangs.includes(language) ? language : 'zh';
    
    const texts = {
      zh: { upright: '正位', reversed: '逆位' },
      en: { upright: 'Upright', reversed: 'Reversed' },
      ja: { upright: '正位', reversed: '逆位' },
      ko: { upright: '정위', reversed: '역위' }
    };
    
    return isReversed ? texts[lang].reversed : texts[lang].upright;
  }

  /**
   * 获取关键词标签
   */
  private getKeywordsLabel(language: SupportedLanguage): string {
    const supportedLangs: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    const lang: SupportedLanguage = supportedLangs.includes(language) ? language : 'zh';
    
    const labels = {
      zh: '关键词',
      en: 'Keywords',
      ja: 'キーワード',
      ko: '키워드'
    };
    return labels[lang];
  }

  /**
   * 获取含义标签
   */
  private getMeaningLabel(language: SupportedLanguage): string {
    const supportedLangs: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    const lang: SupportedLanguage = supportedLangs.includes(language) ? language : 'zh';
    
    const labels = {
      zh: '含义',
      en: 'Meaning',
      ja: '意味',
      ko: '의미'
    };
    return labels[lang];
  }

  /**
   * 获取建议标签
   */
  private getAdviceLabel(language: SupportedLanguage): string {
    const supportedLangs: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    const lang: SupportedLanguage = supportedLangs.includes(language) ? language : 'zh';
    
    const labels = {
      zh: '今日建议',
      en: 'Daily Advice',
      ja: '今日のアドバイス',
      ko: '오늘의 조언'
    };
    return labels[lang];
  }

  /**
   * 获取建议模板
   */
  private getAdviceTemplates(language: SupportedLanguage) {
    const templates = {
      zh: {
        majorUpright: [
          '今天是展现内在力量的好时机，相信自己的直觉。',
          '保持开放的心态，新的机会正在向你招手。',
          '专注于当下，让智慧指引你的决定。'
        ],
        majorReversed: [
          '今天需要更多的耐心和反思，避免冲动行事。',
          '重新审视你的目标，可能需要调整方向。',
          '倾听内心的声音，寻找平衡点。'
        ],
        minorUpright: [
          '今天在日常事务中会有不错的进展。',
          '保持积极的态度，小的努力会带来大的收获。',
          '关注细节，完善你的计划。'
        ],
        minorReversed: [
          '今天可能会遇到一些小挫折，保持冷静应对。',
          '重新整理思路，寻找新的解决方案。',
          '适当休息，为明天的挑战做好准备。'
        ]
      },
      en: {
        majorUpright: [
          'Today is a great time to show your inner strength and trust your intuition.',
          'Stay open-minded, new opportunities are calling to you.',
          'Focus on the present and let wisdom guide your decisions.'
        ],
        majorReversed: [
          'Today requires more patience and reflection, avoid impulsive actions.',
          'Re-examine your goals, you may need to adjust your direction.',
          'Listen to your inner voice and find balance.'
        ],
        minorUpright: [
          'You will make good progress in daily affairs today.',
          'Stay positive, small efforts will bring great rewards.',
          'Pay attention to details and perfect your plans.'
        ],
        minorReversed: [
          'You may encounter some minor setbacks today, stay calm.',
          'Reorganize your thoughts and look for new solutions.',
          'Take appropriate rest and prepare for tomorrow\'s challenges.'
        ]
      },
      ja: {
        majorUpright: [
          '今日は内なる力を発揮し、直感を信じる良い機会です。',
          'オープンマインドでいてください。新しい機会があなたを呼んでいます。',
          '今この瞬間に集中し、知恵があなたの決断を導くようにしましょう。'
        ],
        majorReversed: [
          '今日はより多くの忍耐と反省が必要です。衝動的な行動は避けてください。',
          'あなたの目標を再検討し、方向性を調整する必要があるかもしれません。',
          '内なる声に耳を傾け、バランスを見つけてください。'
        ],
        minorUpright: [
          '今日は日常の事務で良い進歩を遂げるでしょう。',
          'ポジティブな態度を保ち、小さな努力が大きな報酬をもたらします。',
          '細部に注意を払い、計画を完璧にしてください。'
        ],
        minorReversed: [
          '今日は小さな挫折に遭遇するかもしれませんが、冷静に対処してください。',
          '考えを整理し直し、新しい解決策を探してください。',
          '適切な休息を取り、明日の挑戦に備えてください。'
        ]
      },
      ko: {
        majorUpright: [
          '오늘은 내면의 힘을 발휘하고 직감을 믿을 좋은 기회입니다.',
          '열린 마음을 유지하세요. 새로운 기회가 당신을 부르고 있습니다.',
          '현재에 집중하고 지혜가 당신의 결정을 이끌도록 하세요.'
        ],
        majorReversed: [
          '오늘은 더 많은 인내와 성찰이 필요합니다. 충동적인 행동은 피하세요.',
          '목표를 재검토하고 방향을 조정해야 할 수도 있습니다.',
          '내면의 목소리에 귀 기울이고 균형점을 찾으세요.'
        ],
        minorUpright: [
          '오늘은 일상 업무에서 좋은 진전을 이룰 것입니다.',
          '긍정적인 태도를 유지하면 작은 노력이 큰 보상을 가져다줄 것입니다.',
          '세부사항에 주의를 기울이고 계획을 완벽하게 하세요.'
        ],
        minorReversed: [
          '오늘은 작은 좌절을 겪을 수 있지만 침착하게 대처하세요.',
          '생각을 재정리하고 새로운 해결책을 찾으세요.',
          '적절한 휴식을 취하고 내일의 도전에 대비하세요.'
        ]
      }
    };
    
    const supportedLangs: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    const lang: SupportedLanguage = supportedLangs.includes(language) ? language : 'zh';
    return templates[lang];
  }

  /**
   * 获取用户总抽牌次数
   */
  private async getUserTotalReadings(userId: string | ObjectId): Promise<number> {
    const user = await this.userRepository.findById(userId);
    return user?.totalReadings || 0;
  }

  /**
   * 生成字符串的哈希值，用作随机种子
   */
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash;
  }

  /**
   * 基于种子生成伪随机数（0-1之间）
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

/**
 * 用户用例服务（保持不变）
 */
export class UserUseCases implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async createOrUpdateUser(telegramId: number, userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findByTelegramId(telegramId);
    
    if (existingUser) {
      // 更新现有用户，但不更新languageCode（保持用户已设置的语言偏好）
      const { languageCode, ...updateData } = userData;
      return await this.userRepository.update(existingUser._id!, {
        ...updateData,
        // 将更新时间转换为毫秒时间戳
        updatedAt: Date.now()
      });
    } else {
      // 创建新用户，使用Telegram客户端的语言设置
      const newUser: User = {
        telegramId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        languageCode: userData.languageCode || 'zh',
        totalReadings: 0,
        // 将时间转换为毫秒时间戳
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      return await this.userRepository.save(newUser);
    }
  }

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    return await this.userRepository.findByTelegramId(telegramId);
  }

  async updateLastReadingDate(userId: string | ObjectId): Promise<User> {
    return await this.userRepository.update(userId, {
      // 将时间转换为毫秒时间戳
      lastReadingDate: Date.now(),
      updatedAt: Date.now()
    });
  }

  async updateUserLanguage(userId: string | ObjectId, languageCode: string): Promise<User> {
    return await this.userRepository.update(userId, {
      languageCode,
      updatedAt: Date.now()
    });
  }
}