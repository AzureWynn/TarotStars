import { Collection, ObjectId } from 'mongodb';
import { IUserRepository } from '../../domain/repositories/INewRepository';
import { User } from '../../domain/entities/UserEntities';
import { MongoConnection } from '../database/MongoConnection';

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<User>;

  constructor() {
    const db = MongoConnection.getInstance().getDb();
    this.collection = db.collection<User>('users');
    // 创建索引
    this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ telegramId: 1 }, { unique: true });
      // 移除自定义id索引，使用MongoDB原生_id
    } catch (error) {
      console.warn('Index creation warning:', error);
    }
  }

  async save(user: User): Promise<User> {
    await this.collection.insertOne(user);
    return user;
  }

  async findById(id: string | ObjectId): Promise<User | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: objectId });
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return await this.collection.findOne({ telegramId });
  }

  async update(id: string | ObjectId, updateData: Partial<User>): Promise<User> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return result;
  }
}