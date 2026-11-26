#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { MongoConnection } from '../infrastructure/database/MongoConnection';
import { RiderWaiteDataService } from '../infrastructure/services/RiderWaiteDataService';

// 加载环境变量
dotenv.config();

/**
 * Rider-Waite 塔罗牌数据迁移脚本
 * 
 * 使用方法:
 * npm run migrate:rider-waite
 * 或
 * ts-node src/scripts/migrate-rider-waite.ts
 */

async function main() {
  console.log('🎴 Rider-Waite Tarot Cards Migration Script');
  console.log('==========================================');
  
  // 获取数据库配置
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tarot-stars';
  
  console.log(`📊 Database URI: ${MONGODB_URI}`);
  console.log(`📊 Database Name: ${MONGODB_DB_NAME}`);
  
  try {
    // 连接数据库
    console.log('🔌 Connecting to MongoDB...');
    await MongoConnection.getInstance().connect(MONGODB_URI, MONGODB_DB_NAME);
    console.log('✅ Database connected successfully');
    
    // 创建数据服务实例
    const riderWaiteService = new RiderWaiteDataService();
    
    // 执行迁移
    console.log('\n🚀 Starting migration process...');
    await riderWaiteService.performRiderWaiteMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Rider-Waite deck record created/verified');
    console.log('- ✅ Card data fetched from public API');
    console.log('- ✅ Data converted to multi-language format');
    console.log('- ✅ Cards saved to enhanced_tarot_cards collection');
    console.log('- ✅ Database indexes created');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    try {
      await MongoConnection.getInstance().disconnect();
      console.log('\n🔌 Database connection closed');
    } catch (error) {
      console.warn('⚠️ Warning: Failed to close database connection:', error);
    }
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// 执行主函数
if (require.main === module) {
  main();
}

export { main };