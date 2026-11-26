import { LocalizedTarotCard, SupportedLanguage, DailyReading, ReadingHistory } from './TarotCard';

// 用户统计信息
export interface UserStatistics {
  totalReadings: number;
  readingStreak: number;
  favoriteCards: string[];
  mostDrawnSuit?: string;
  lastReadingDate?: number; // 毫秒级时间戳
}

// 用户偏好设置
export interface UserPreferences {
  language: SupportedLanguage;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    dailyReminder: boolean;
    readingComplete: boolean;
  };
  privacy: {
    shareReadings: boolean;
    anonymousMode: boolean;
  };
}

// 用户档案
export interface UserProfile {
  id: string;
  telegramId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: number; // 毫秒级时间戳
  lastActiveAt: number; // 毫秒级时间戳
}