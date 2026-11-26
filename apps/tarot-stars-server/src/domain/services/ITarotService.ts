import { ObjectId } from 'mongodb';
import { DailyReading, User } from '../entities/UserEntities';
import { LocalizedTarotCard, SupportedLanguage } from '../entities/NewTarotSchema';

export interface ITarotService {
  /**
   * 获取每日一牌
   * @param userId 用户ID
   * @returns 每日塔罗牌解读
   */
  getDailyReading(userId: string | ObjectId): Promise<DailyReading>;

  /**
   * 检查用户今日是否已抽牌
   * @param userId 用户ID
   * @returns 是否已抽牌
   */
  hasReadingToday(userId: string | ObjectId): Promise<boolean>;

  /**
   * 获取用户历史解读记录
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 历史解读记录
   */
  getUserReadingHistory(userId: string | ObjectId, limit?: number): Promise<DailyReading[]>;

  /**
   * 随机抽取塔罗牌
   * @param language 语言
   * @returns 随机塔罗牌
   */
  drawRandomCard(language?: SupportedLanguage): Promise<LocalizedTarotCard>;

  /**
   * 生成塔罗牌解读
   * @param card 塔罗牌
   * @param isReversed 是否逆位
   * @param language 语言
   * @returns 解读内容
   */
  generateInterpretation(card: LocalizedTarotCard, isReversed: boolean, language?: SupportedLanguage): string;
}

export interface IUserService {
  /**
   * 创建或更新用户
   * @param telegramId Telegram用户ID
   * @param userData 用户数据
   * @returns 用户信息
   */
  createOrUpdateUser(telegramId: number, userData: Partial<User>): Promise<User>;

  /**
   * 根据Telegram ID获取用户
   * @param telegramId Telegram用户ID
   * @returns 用户信息
   */
  getUserByTelegramId(telegramId: number): Promise<User | null>;

  /**
   * 更新用户最后抽牌时间
   * @param userId 用户ID
   * @returns 更新后的用户信息
   */
  updateLastReadingDate(userId: string | ObjectId): Promise<User>;
}