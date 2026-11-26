import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId; // MongoDB原生ID
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  lastReadingDate?: number; // 毫秒级时间戳
  totalReadings: number;
  createdAt: number; // 毫秒级时间戳
  updatedAt: number; // 毫秒级时间戳
}

export interface DailyReading {
  _id?: ObjectId; // MongoDB原生ID
  userId: ObjectId; // 关联用户的ObjectId
  username?: string;
  cardId: string; // 保持字符串格式，因为是业务标识符（如'rw-major-00'）
  isReversed: boolean;
  date: number; // 毫秒级时间戳
  createdAt: number; // 毫秒级时间戳
}