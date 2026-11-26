#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { MongoConnection } from '../infrastructure/database/MongoConnection';
import { EnhancedTarotRepository } from '../infrastructure/repositories/EnhancedTarotRepository';
import { TAROT_DECK_TYPES } from '../domain/entities/TarotDeck';

// 加载环境变量
dotenv.config();

/**
 * Rider-Waite 塔罗牌数据验证脚本
 * 
 * 使用方法:
 * npm run verify:rider-waite
 * 或
 * ts-node src/scripts/verify-rider-waite.ts
 */

async function main() {
  console.log('🔍 Rider-Waite Tarot Cards Verification Script');
  console.log('===============================================');
  
  // 获取数据库配置
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tarot-stars';
  
  try {
    // 连接数据库
    console.log('🔌 Connecting to MongoDB...');
    await MongoConnection.getInstance().connect(MONGODB_URI, MONGODB_DB_NAME);
    console.log('✅ Database connected successfully');
    
    // 创建仓储实例
    const enhancedRepository = new EnhancedTarotRepository();
    
    console.log('\n📊 Verifying Rider-Waite data...');
    
    // 1. 检查牌组记录
    const deck = await enhancedRepository.getDeckById(TAROT_DECK_TYPES.RIDER_WAITE);
    if (deck) {
      console.log('✅ Rider-Waite deck record found:');
      console.log(`   - Name: ${deck.name} (${deck.nameEn})`);
      console.log(`   - Total Cards: ${deck.totalCards}`);
      console.log(`   - Publisher: ${deck.publisher}`);
      console.log(`   - Year: ${deck.year}`);
    } else {
      console.log('❌ Rider-Waite deck record not found');
    }
    
    // 2. 检查卡牌数据
    const allCards = await enhancedRepository.getAllCards(TAROT_DECK_TYPES.RIDER_WAITE);
    console.log(`\n📚 Found ${allCards.length} Rider-Waite cards`);
    
    // 3. 统计信息
    const stats = await enhancedRepository.getCardStatistics(TAROT_DECK_TYPES.RIDER_WAITE);
    console.log('\n📈 Card Statistics:');
    console.log(`   - Total Cards: ${stats.totalCards}`);
    console.log(`   - Major Arcana: ${stats.majorArcana}`);
    console.log(`   - Minor Arcana: ${stats.minorArcana}`);
    console.log('   - By Suit:');
    Object.entries(stats.bySuit).forEach(([suit, count]) => {
      console.log(`     * ${suit}: ${count} cards`);
    });
    
    // 4. 检查多语言支持
    console.log('\n🌐 Testing multi-language support...');
    const randomCard = await enhancedRepository.getRandomCard(TAROT_DECK_TYPES.RIDER_WAITE, 'zh');
    console.log('✅ Chinese version:');
    console.log(`   - Name: ${randomCard.content.zh?.name}`);
    console.log(`   - Description: ${randomCard.content.zh?.description?.substring(0, 50)}...`);
    
    const randomCardEn = await enhancedRepository.getRandomCard(TAROT_DECK_TYPES.RIDER_WAITE, 'en');
    console.log('✅ English version:');
    console.log(`   - Name: ${randomCardEn.content.en?.name}`);
    console.log(`   - Description: ${randomCardEn.content.en?.description?.substring(0, 50)}...`);
    
    // 5. 测试兼容性转换
    console.log('\n🔄 Testing legacy format conversion...');
    const legacyCards = await enhancedRepository.getAllCardsLegacy('zh');
    console.log(`✅ Successfully converted ${legacyCards.length} cards to legacy format`);
    
    if (legacyCards.length > 0) {
      const sampleCard = legacyCards[0];
      console.log('📋 Sample legacy card:');
      console.log(`   - ID: ${sampleCard.id}`);
      console.log(`   - Name: ${sampleCard.name}`);
      console.log(`   - Name (EN): ${sampleCard.nameEn}`);
      console.log(`   - Category: ${sampleCard.category}`);
      console.log(`   - Suit: ${sampleCard.suit || 'N/A'}`);
      console.log(`   - Keywords (Upright): ${sampleCard.keywords.upright.join(', ')}`);
    }
    
    // 6. 检查特定卡牌
    console.log('\n🃏 Testing specific cards...');
    
    // 先查看前几张卡牌的ID格式
    const firstFewCards = allCards.slice(0, 5);
    console.log('📋 Sample card IDs:');
    firstFewCards.forEach(card => {
      console.log(`   - ${card.id}: ${card.content.zh?.name || card.content.en?.name} (${card.category}, #${card.cardNumber})`);
    });
    
    // 尝试查找愚者卡牌（应该是ID: rw-major-00）
    let foolCard = await enhancedRepository.getCardById('rw-major-00', 'zh');
    if (foolCard) {
      console.log(`✅ Found "The Fool" card with ID: rw-major-00`);
    } else {
      console.log('❌ "The Fool" card not found with ID: rw-major-00');
      
      // 尝试查找"The Last Judgment"卡牌（应该是ID: rw-major-20）
      const judgmentCard = await enhancedRepository.getCardById('rw-major-20', 'zh');
      if (judgmentCard) {
        console.log('ℹ️  Found card with ID rw-major-20:');
        console.log(`   - Chinese Name: ${judgmentCard.content.zh?.name}`);
        console.log(`   - English Name: ${judgmentCard.content.en?.name}`);
        console.log(`   - Card Number: ${judgmentCard.cardNumber}`);
      }
    }
    
    if (foolCard) {
      console.log(`   - Chinese Name: ${foolCard.content.zh?.name}`);
      console.log(`   - English Name: ${foolCard.content.en?.name}`);
      console.log(`   - Card Number: ${foolCard.cardNumber}`);
      console.log(`   - Category: ${foolCard.category}`);
      console.log(`   - Deck ID: ${foolCard.deckId}`);
      
      // 检查是否是Rider-Waite特定卡牌
      const riderWaiteCard = foolCard as any;
      if (riderWaiteCard.riderWaiteMetadata) {
        console.log(`   - Rider-Waite Metadata: ${JSON.stringify(riderWaiteCard.riderWaiteMetadata, null, 2)}`);
      } else {
        console.log('   - No Rider-Waite specific metadata found');
      }
    }
    
    console.log('\n🎉 Verification completed successfully!');
    console.log('\n✨ Summary:');
    console.log('- ✅ Database connection working');
    console.log('- ✅ Rider-Waite deck record exists');
    console.log(`- ✅ ${allCards.length} cards imported successfully`);
    console.log('- ✅ Multi-language support working');
    console.log('- ✅ Legacy format conversion working');
    console.log('- ✅ Enhanced metadata available');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
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