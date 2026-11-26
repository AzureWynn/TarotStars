import { ObjectId } from 'mongodb';
import { LocalizedTarotCard, SupportedLanguage } from '../entities/NewTarotSchema';
import { User, DailyReading } from '../entities/UserEntities';

export interface IDailyReadingRepository {
  save(reading: DailyReading): Promise<DailyReading>;
  getByUserIdAndDate(userId: string | ObjectId, date: Date): Promise<DailyReading | null>;
  getHistoryByUserId(userId: string | ObjectId, limit?: number): Promise<DailyReading[]>;
  hasReadingToday(userId: string | ObjectId): Promise<boolean>;
}

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string | ObjectId): Promise<User | null>;
  findByTelegramId(telegramId: number): Promise<User | null>;
  update(id: string | ObjectId, updateData: Partial<User>): Promise<User>;
}

export interface IUserRepository {
  save(user: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTelegramId(telegramId: number): Promise<any | null>;
  update(id: string, updateData: Partial<any>): Promise<any>;
}

export interface INewTarotRepository {
  getAllCards(deckId?: string, language?: SupportedLanguage, limit?: number, skip?: number): Promise<LocalizedTarotCard[]>;
  getCardById(cardId: string, language?: SupportedLanguage): Promise<LocalizedTarotCard | null>;
  getRandomCard(deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard | null>;
  searchCards(query: string, deckId?: string, language?: SupportedLanguage, limit?: number): Promise<LocalizedTarotCard[]>;
  getCardsByCategory(categoryId: string, deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard[]>;
  getCardsBySuit(suitId: string, deckId?: string, language?: SupportedLanguage): Promise<LocalizedTarotCard[]>;
  getDeckStatistics(deckId?: string): Promise<any>;
  getAllCategories(language?: SupportedLanguage): Promise<any[]>;
  getAllSuits(language?: SupportedLanguage): Promise<any[]>;
}