#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import { MongoConnection } from '../infrastructure/database/MongoConnection';
import { NewTarotDataMigrationService } from '../infrastructure/services/NewTarotDataMigrationService';
import { NewTarotRepository } from '../infrastructure/repositories/NewTarotRepository';

/**
 * 新塔罗牌数据库schema迁移脚本
 * 将现有数据迁移到新的多语言结构
 */
async function migrateNewTarotSchema(): Promise<void> {
  console.log('🚀 Starting new tarot schema migration...');
  console.log('=' .repeat(60));
  
  try {
    // 1. 连接数据库
    console.log('🔌 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tarot-stars';
    const dbName = process.env.MONGODB_DB_NAME || 'tarot-stars';
    await MongoConnection.getInstance().connect(mongoUri, dbName);
    console.log('✅ Database connected successfully');
    
    // 2. 执行数据迁移
    console.log('\n📦 Starting data migration...');
    const migrationService = new NewTarotDataMigrationService();
    await migrationService.performFullMigration();
    
    // 3. 验证迁移结果
    console.log('\n🔍 Validating migration...');
    await migrationService.validateMigration();
    
    // 4. 测试新的Repository和Factory服务
    console.log('\n🧪 Testing new services...');
    await testNewServices();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ New tarot schema migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log('   - ✅ Created new multilingual schema');
    console.log('   - ✅ Migrated card categories and suits');
    console.log('   - ✅ Migrated tarot cards with 4 languages (zh/en/ja/ko)');
    console.log('   - ✅ Created deck information');
    console.log('   - ✅ Set up database indexes');
    console.log('   - ✅ Validated data integrity');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Update API controllers to use NewTarotRepository');
    console.log('   2. Update frontend to consume new API format');
    console.log('   3. Test multilingual functionality');
    console.log('   4. Consider removing old schema after validation');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await MongoConnection.getInstance().disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * 测试新的服务和Repository
 */
async function testNewServices(): Promise<void> {
  try {
    const repository = new NewTarotRepository();
    // const factory = MultiLanguageFactoryService.getInstance();
    
    // 测试获取所有分类
    console.log('   📋 Testing categories...');
    const categories = await repository.getAllCategories('zh');
    console.log(`      Found ${categories.length} categories`);
    
    // 测试获取所有花色
    console.log('   🃏 Testing suits...');
    const suits = await repository.getAllSuits('zh');
    console.log(`      Found ${suits.length} suits`);
    
    // 测试获取所有牌组
    console.log('   📚 Testing decks...');
    const decks = await repository.getAllDecks('zh');
    console.log(`      Found ${decks.length} decks`);
    
    // 测试获取卡牌
    console.log('   🎴 Testing cards...');
    const cards = await repository.getAllCards('rider-waite', 'zh', 5);
    console.log(`      Found ${cards.length} cards (limited to 5)`);
    
    if (cards.length > 0) {
      const firstCard = cards[0];
      console.log(`      Sample card: ${firstCard.name} (${firstCard.cardId})`);
      
      // 测试多语言
      console.log('   🌐 Testing multilingual support...');
      const englishCard = await repository.getCardById(firstCard.cardId, 'en');
      if (englishCard) {
        console.log(`      English name: ${englishCard.name}`);
      }
      
      const japaneseCard = await repository.getCardById(firstCard.cardId, 'ja');
      if (japaneseCard) {
        console.log(`      Japanese name: ${japaneseCard.name}`);
      }
    }
    
    // 测试随机卡牌
    console.log('   🎲 Testing random card...');
    const randomCard = await repository.getRandomCard('rider-waite', 'zh');
    if (randomCard) {
      console.log(`      Random card: ${randomCard.name} (${randomCard.cardId})`);
    }
    
    // 测试统计信息
    console.log('   📊 Testing statistics...');
    const stats = await repository.getDeckStatistics('rider-waite');
    console.log(`      Deck statistics:`);
    console.log(`        Total cards: ${stats.totalCards}`);
    console.log(`        Major Arcana: ${stats.majorArcana}`);
    console.log(`        Minor Arcana: ${stats.minorArcana}`);
    console.log(`        Suits: Cups(${stats.suits.cups}), Wands(${stats.suits.wands}), Swords(${stats.suits.swords}), Pentacles(${stats.suits.pentacles})`);
    
    console.log('   ✅ All service tests passed!');
    
  } catch (error) {
    console.error('   ❌ Service test failed:', error);
    throw error;
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log('\n📖 New Tarot Schema Migration Tool');
  console.log('=' .repeat(50));
  console.log('\nThis script migrates the existing tarot card data to a new multilingual schema.');
  console.log('\n🎯 Features:');
  console.log('  - Multilingual support (Chinese, English, Japanese, Korean)');
  console.log('  - Language factory pattern for content retrieval');
  console.log('  - Improved data structure with categories and suits');
  console.log('  - Enhanced metadata and symbolism information');
  console.log('  - Optimized database indexes for better performance');
  console.log('\n🚀 Usage:');
  console.log('  npm run migrate:new-schema');
  console.log('  or');
  console.log('  node dist/scripts/migrate-new-tarot-schema.js');
  console.log('\n⚠️  Warning:');
  console.log('  This will create new collections and may take several minutes to complete.');
  console.log('  Make sure you have a stable internet connection for API data fetching.');
  console.log('');
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// 执行迁移
if (require.main === module) {
  migrateNewTarotSchema().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrateNewTarotSchema };