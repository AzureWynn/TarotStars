#!/usr/bin/env node

import { MongoConnection } from '../infrastructure/database/MongoConnection';
import { NewTarotRepository } from '../infrastructure/repositories/NewTarotRepository';
import { MultiLanguageFactoryService } from '../infrastructure/services/MultiLanguageFactoryService';
import { SupportedLanguage } from '../domain/entities/NewTarotSchema';

/**
 * 新塔罗牌数据库schema验证脚本
 * 验证数据完整性和多语言功能
 */
async function verifyNewTarotSchema(): Promise<void> {
  console.log('🔍 Starting new tarot schema verification...');
  console.log('=' .repeat(60));
  
  try {
    // 1. 连接数据库
    console.log('🔌 Connecting to database...');
    await MongoConnection.getInstance().connect();
    console.log('✅ Database connected successfully');
    
    // 2. 初始化服务
    const repository = new NewTarotRepository();
    const factory = MultiLanguageFactoryService.getInstance();
    
    // 3. 验证基础数据
    console.log('\n📊 Verifying base data...');
    await verifyBaseData(repository);
    
    // 4. 验证多语言功能
    console.log('\n🌐 Verifying multilingual functionality...');
    await verifyMultilingualSupport(repository, factory);
    
    // 5. 验证数据完整性
    console.log('\n🔍 Verifying data integrity...');
    await verifyDataIntegrity(repository);
    
    // 6. 验证特定卡牌
    console.log('\n🎴 Verifying specific cards...');
    await verifySpecificCards(repository);
    
    // 7. 性能测试
    console.log('\n⚡ Performance testing...');
    await performanceTest(repository);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ New tarot schema verification completed successfully!');
    console.log('\n📋 Verification Summary:');
    console.log('   - ✅ Base data structure is correct');
    console.log('   - ✅ Multilingual support is working');
    console.log('   - ✅ Data integrity is maintained');
    console.log('   - ✅ Specific cards are accessible');
    console.log('   - ✅ Performance is acceptable');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await MongoConnection.getInstance().disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * 验证基础数据
 */
async function verifyBaseData(repository: NewTarotRepository): Promise<void> {
  try {
    // 验证分类
    const categories = await repository.getAllCategories('zh');
    console.log(`   📋 Categories: ${categories.length}`);
    if (categories.length === 0) {
      throw new Error('No categories found');
    }
    
    const majorArcana = categories.find(c => c.categoryId === 'major_arcana');
    const minorArcana = categories.find(c => c.categoryId === 'minor_arcana');
    
    if (!majorArcana || !minorArcana) {
      throw new Error('Required categories (major_arcana, minor_arcana) not found');
    }
    
    console.log(`      - ${majorArcana.name}: ${majorArcana.description}`);
    console.log(`      - ${minorArcana.name}: ${minorArcana.description}`);
    
    // 验证花色
    const suits = await repository.getAllSuits('zh');
    console.log(`   🃏 Suits: ${suits.length}`);
    if (suits.length === 0) {
      throw new Error('No suits found');
    }
    
    const expectedSuits = ['cups', 'wands', 'swords', 'pentacles'];
    for (const expectedSuit of expectedSuits) {
      const suit = suits.find(s => s.suitId === expectedSuit);
      if (!suit) {
        throw new Error(`Required suit ${expectedSuit} not found`);
      }
      console.log(`      - ${suit.name} (${suit.element}): ${suit.description}`);
    }
    
    // 验证牌组
    const decks = await repository.getAllDecks('zh');
    console.log(`   📚 Decks: ${decks.length}`);
    if (decks.length === 0) {
      throw new Error('No decks found');
    }
    
    const riderWaite = decks.find(d => d.deckId === 'rider-waite');
    if (!riderWaite) {
      throw new Error('Rider-Waite deck not found');
    }
    
    console.log(`      - ${riderWaite.name}: ${riderWaite.totalCards} cards (${riderWaite.publishYear})`);
    
    console.log('   ✅ Base data verification passed');
    
  } catch (error) {
    console.error('   ❌ Base data verification failed:', error);
    throw error;
  }
}

/**
 * 验证多语言支持
 */
async function verifyMultilingualSupport(
  repository: NewTarotRepository,
  factory: MultiLanguageFactoryService
): Promise<void> {
  try {
    const supportedLanguages: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
    
    console.log(`   🌍 Testing ${supportedLanguages.length} languages...`);
    
    // 获取一张测试卡牌
    const testCards = await repository.getAllCards('rider-waite', 'zh', 1);
    if (testCards.length === 0) {
      throw new Error('No test cards available');
    }
    
    const testCardId = testCards[0].cardId;
    console.log(`   🎴 Using test card: ${testCardId}`);
    
    // 测试每种语言
    for (const language of supportedLanguages) {
      const card = await repository.getCardById(testCardId, language);
      if (!card) {
        throw new Error(`Card ${testCardId} not found in language ${language}`);
      }
      
      // 验证必要字段
      if (!card.name || !card.description) {
        throw new Error(`Missing required fields for card ${testCardId} in language ${language}`);
      }
      
      if (!card.keywords.upright.length || !card.keywords.reversed.length) {
        throw new Error(`Missing keywords for card ${testCardId} in language ${language}`);
      }
      
      if (!card.meaning.upright || !card.meaning.reversed) {
        throw new Error(`Missing meanings for card ${testCardId} in language ${language}`);
      }
      
      console.log(`      ${language.toUpperCase()}: ${card.name} - ${card.description.substring(0, 50)}...`);
    }
    
    // 测试分类的多语言支持
    console.log('   📋 Testing category multilingual support...');
    for (const language of supportedLanguages) {
      const categories = await repository.getAllCategories(language);
      if (categories.length === 0) {
        throw new Error(`No categories found for language ${language}`);
      }
      
      const majorArcana = categories.find(c => c.categoryId === 'major_arcana');
      if (!majorArcana) {
        throw new Error(`Major Arcana category not found for language ${language}`);
      }
      
      console.log(`      ${language.toUpperCase()}: ${majorArcana.name}`);
    }
    
    console.log('   ✅ Multilingual support verification passed');
    
  } catch (error) {
    console.error('   ❌ Multilingual support verification failed:', error);
    throw error;
  }
}

/**
 * 验证数据完整性
 */
async function verifyDataIntegrity(repository: NewTarotRepository): Promise<void> {
  try {
    // 获取统计信息
    const stats = await repository.getDeckStatistics('rider-waite');
    console.log(`   📊 Deck Statistics:`);
    console.log(`      Total cards: ${stats.totalCards}`);
    console.log(`      Major Arcana: ${stats.majorArcana}`);
    console.log(`      Minor Arcana: ${stats.minorArcana}`);
    console.log(`      Suits breakdown:`);
    console.log(`        - Cups: ${stats.suits.cups}`);
    console.log(`        - Wands: ${stats.suits.wands}`);
    console.log(`        - Swords: ${stats.suits.swords}`);
    console.log(`        - Pentacles: ${stats.suits.pentacles}`);
    
    // 验证标准塔罗牌数量
    if (stats.totalCards !== 78) {
      throw new Error(`Expected 78 cards, found ${stats.totalCards}`);
    }
    
    if (stats.majorArcana !== 22) {
      throw new Error(`Expected 22 Major Arcana cards, found ${stats.majorArcana}`);
    }
    
    if (stats.minorArcana !== 56) {
      throw new Error(`Expected 56 Minor Arcana cards, found ${stats.minorArcana}`);
    }
    
    // 验证每个花色有14张牌
    const expectedSuitCount = 14;
    Object.entries(stats.suits).forEach(([suit, count]) => {
      if (count !== expectedSuitCount) {
        throw new Error(`Expected ${expectedSuitCount} cards in ${suit}, found ${count}`);
      }
    });
    
    // 验证特定卡牌存在
    const keyCards = [
      'rw-major-00', // The Fool
      'rw-major-21', // The World
      'rw-cups-01',  // Ace of Cups
      'rw-cups-14',  // King of Cups
      'rw-wands-01', // Ace of Wands
      'rw-swords-01', // Ace of Swords
      'rw-pentacles-01' // Ace of Pentacles
    ];
    
    console.log(`   🔍 Verifying key cards...`);
    for (const cardId of keyCards) {
      const card = await repository.getCardById(cardId, 'zh');
      if (!card) {
        throw new Error(`Key card ${cardId} not found`);
      }
      console.log(`      ✓ ${cardId}: ${card.name}`);
    }
    
    console.log('   ✅ Data integrity verification passed');
    
  } catch (error) {
    console.error('   ❌ Data integrity verification failed:', error);
    throw error;
  }
}

/**
 * 验证特定卡牌
 */
async function verifySpecificCards(repository: NewTarotRepository): Promise<void> {
  try {
    // 验证愚者牌（The Fool）
    console.log('   🃏 Verifying The Fool card...');
    const fool = await repository.getCardById('rw-major-00', 'zh');
    if (!fool) {
      throw new Error('The Fool card not found');
    }
    
    console.log(`      Chinese: ${fool.name}`);
    console.log(`      Category: ${fool.category.name}`);
    console.log(`      Number: ${fool.number}`);
    console.log(`      Keywords: ${fool.keywords.upright.join(', ')}`);
    
    // 验证英文版本
    const foolEn = await repository.getCardById('rw-major-00', 'en');
    if (!foolEn) {
      throw new Error('The Fool card (English) not found');
    }
    console.log(`      English: ${foolEn.name}`);
    
    // 验证小阿卡纳卡牌
    console.log('   🗡️  Verifying Ten of Swords...');
    const tenOfSwords = await repository.getCardById('rw-swords-10', 'zh');
    if (!tenOfSwords) {
      throw new Error('Ten of Swords card not found');
    }
    
    console.log(`      Chinese: ${tenOfSwords.name}`);
    console.log(`      Suit: ${tenOfSwords.suit?.name || 'N/A'}`);
    console.log(`      Number: ${tenOfSwords.number}`);
    
    // 验证图片路径
    if (!tenOfSwords.images.original || !tenOfSwords.images.thumbnail) {
      throw new Error('Missing image paths for Ten of Swords');
    }
    
    console.log(`      Images: ${tenOfSwords.images.original}`);
    
    console.log('   ✅ Specific cards verification passed');
    
  } catch (error) {
    console.error('   ❌ Specific cards verification failed:', error);
    throw error;
  }
}

/**
 * 性能测试
 */
async function performanceTest(repository: NewTarotRepository): Promise<void> {
  try {
    console.log('   ⚡ Running performance tests...');
    
    // 测试获取所有卡牌的性能
    const start1 = Date.now();
    const allCards = await repository.getAllCards('rider-waite', 'zh');
    const time1 = Date.now() - start1;
    console.log(`      Get all cards (${allCards.length}): ${time1}ms`);
    
    if (time1 > 5000) {
      console.warn(`      ⚠️  Warning: Getting all cards took ${time1}ms (>5s)`);
    }
    
    // 测试随机卡牌性能
    const start2 = Date.now();
    for (let i = 0; i < 10; i++) {
      await repository.getRandomCard('rider-waite', 'zh');
    }
    const time2 = Date.now() - start2;
    console.log(`      Get 10 random cards: ${time2}ms (avg: ${time2/10}ms)`);
    
    // 测试多语言切换性能
    const testCardId = allCards[0]?.cardId;
    if (testCardId) {
      const start3 = Date.now();
      await repository.getCardById(testCardId, 'zh');
      await repository.getCardById(testCardId, 'en');
      await repository.getCardById(testCardId, 'ja');
      await repository.getCardById(testCardId, 'ko');
      const time3 = Date.now() - start3;
      console.log(`      Get same card in 4 languages: ${time3}ms`);
    }
    
    // 测试搜索性能
    const start4 = Date.now();
    const searchResults = await repository.searchCards('愚者', 'rider-waite', 'zh', 10);
    const time4 = Date.now() - start4;
    console.log(`      Search cards (${searchResults.length} results): ${time4}ms`);
    
    console.log('   ✅ Performance tests completed');
    
  } catch (error) {
    console.error('   ❌ Performance test failed:', error);
    throw error;
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log('\n🔍 New Tarot Schema Verification Tool');
  console.log('=' .repeat(50));
  console.log('\nThis script verifies the integrity and functionality of the new tarot schema.');
  console.log('\n🎯 Verification includes:');
  console.log('  - Base data structure (categories, suits, decks)');
  console.log('  - Multilingual support (zh/en/ja/ko)');
  console.log('  - Data integrity (card counts, required fields)');
  console.log('  - Specific card accessibility');
  console.log('  - Performance benchmarks');
  console.log('\n🚀 Usage:');
  console.log('  npm run verify:new-schema');
  console.log('  or');
  console.log('  node dist/scripts/verify-new-tarot-schema.js');
  console.log('');
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// 执行验证
if (require.main === module) {
  verifyNewTarotSchema().catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { verifyNewTarotSchema };