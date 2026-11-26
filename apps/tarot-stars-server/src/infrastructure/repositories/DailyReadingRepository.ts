import { Collection, ObjectId } from 'mongodb';
import { IDailyReadingRepository } from '../../domain/repositories/INewRepository';
import { DailyReading } from '../../domain/entities/UserEntities';
import { MongoConnection } from '../database/MongoConnection';

export class MongoDailyReadingRepository implements IDailyReadingRepository {
  private collection: Collection<DailyReading>;

  constructor() {
    const db = MongoConnection.getInstance().getDb();
    this.collection = db.collection<DailyReading>('daily_readings');
    // 创建索引
    this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ userId: 1, date: 1 }, { unique: true });
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ date: 1 });
    } catch (error) {
      console.warn('Index creation warning:', error);
    }
  }

  async save(reading: DailyReading): Promise<DailyReading> {
    await this.collection.insertOne(reading);
    return reading;
  }

  async getByUserIdAndDate(userId: string | ObjectId, date: Date): Promise<DailyReading | null> {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();
    
    return await this.collection.findOne({
      userId: userObjectId,
      date: {
        $gte: startTimestamp,
        $lte: endTimestamp
      }
    });
  }

  async getHistoryByUserId(userId: string | ObjectId, limit: number = 10): Promise<DailyReading[]> {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await this.collection
      .find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  async hasReadingToday(userId: string | ObjectId): Promise<boolean> {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = tomorrow.getTime();
    
    const count = await this.collection.countDocuments({
      userId: userObjectId,
      date: {
        $gte: todayTimestamp,
        $lt: tomorrowTimestamp
      }
    });
    
    return count > 0;
  }
}