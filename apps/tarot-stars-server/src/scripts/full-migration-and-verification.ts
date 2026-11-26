#!/usr/bin/env node

import { MongoConnection } from '../infrastructure/database/MongoConnection';
import { NewTarotDataMigrationService } from '../infrastructure/services/NewTarotDataMigrationService';
import { verifyNewTarotSchema } from './verify-new-tarot-schema';

/**
 * 完整的塔罗牌数据迁移和验证脚本
 * 执行数据迁移并验证结果
 */
async function fullMigrationAndVerification(): Promise<void> {
  console.log('🚀 Starting full tarot schema migration and verification...');
  console.log('=' .repeat(70));
  
  const startTime = Date.now();
  
  try {
    // 1. 连接数据库
    console.log('🔌 Connecting to database...');
    await MongoConnection.getInstance().connect();
    console.log('✅ Database connected successfully');
    
    // 2. 执行数据迁移
    console.log('\n📦 Starting data migration...');
    console.log('-' .repeat(50));
    
    const migrationService = new NewTarotDataMigrationService();
    const migrationResult = await migrationService.migrateAllData();
    
    console.log('\n📊 Migration Results:');
    console.log(`   Categories created: ${migrationResult.categoriesCreated}`);
    console.log(`   Suits created: ${migrationResult.suitsCreated}`);
    console.log(`   Decks created: ${migrationResult.decksCreated}`);
    console.log(`   Cards migrated: ${migrationResult.cardsMigrated}`);
    console.log(`   Indexes created: ${migrationResult.indexesCreated}`);
    console.log(`   Migration time: ${migrationResult.migrationTime}ms`);
    
    if (!migrationResult.success) {
      throw new Error('Migration failed');
    }
    
    console.log('✅ Data migration completed successfully!');
    
    // 3. 等待一段时间确保数据写入完成
    console.log('\n⏳ Waiting for data to be fully written...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. 执行验证
    console.log('\n🔍 Starting schema verification...');
    console.log('-' .repeat(50));
    
    await verifyNewTarotSchema();
    
    // 5. 显示总结
    const totalTime = Date.now() - startTime;
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 Full migration and verification completed successfully!');
    console.log(`\n⏱️  Total execution time: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection established');
    console.log('   ✅ Data migration completed');
    console.log('   ✅ Schema verification passed');
    console.log('   ✅ Multilingual support verified');
    console.log('   ✅ Data integrity confirmed');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Update application services to use NewTarotRepository');
    console.log('   2. Update frontend to consume new API structure');
    console.log('   3. Test multilingual functionality in production');
    console.log('   4. Consider removing old schema after thorough testing');
    
  } catch (error) {
    console.error('\n❌ Migration and verification failed:', error);
    
    // 显示错误详情
    if (error instanceof Error) {
      console.error('\n🔍 Error Details:');
      console.error(`   Message: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split('\n').slice(0, 5).join('\n')}`);
      }
    }
    
    console.log('\n🛠️  Troubleshooting:');
    console.log('   1. Check database connection');
    console.log('   2. Verify API endpoints are accessible');
    console.log('   3. Check network connectivity');
    console.log('   4. Review migration logs for specific errors');
    
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await MongoConnection.getInstance().disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log('\n🚀 Full Tarot Schema Migration and Verification Tool');
  console.log('=' .repeat(60));
  console.log('\nThis script performs a complete migration of tarot card data to the new');
  console.log('multilingual schema and verifies the results.');
  console.log('\n🎯 Process includes:');
  console.log('  1. Database connection');
  console.log('  2. Data migration from API sources');
  console.log('  3. Schema verification');
  console.log('  4. Multilingual functionality testing');
  console.log('  5. Data integrity validation');
  console.log('\n📦 Migration creates:');
  console.log('  - card_categories collection (major/minor arcana)');
  console.log('  - card_suits collection (cups/wands/swords/pentacles)');
  console.log('  - tarot_cards_new collection (78 Rider-Waite cards)');
  console.log('  - tarot_decks_new collection (deck metadata)');
  console.log('\n🌐 Language support:');
  console.log('  - Chinese (zh) - primary');
  console.log('  - English (en)');
  console.log('  - Japanese (ja)');
  console.log('  - Korean (ko)');
  console.log('\n🚀 Usage:');
  console.log('  npm run migrate:full');
  console.log('  or');
  console.log('  node dist/scripts/full-migration-and-verification.js');
  console.log('\n⚠️  Warning:');
  console.log('  This script will create new collections. Ensure you have');
  console.log('  proper database backups before running in production.');
  console.log('');
}

/**
 * 检查环境变量
 */
function checkEnvironment(): void {
  const requiredEnvVars = ['MONGODB_URI'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n💡 Please set these variables in your .env file or environment.');
    process.exit(1);
  }
}

/**
 * 确认执行
 */
async function confirmExecution(): Promise<boolean> {
  // 在生产环境中要求确认
  if (process.env.NODE_ENV === 'production') {
    console.log('\n⚠️  You are running this script in PRODUCTION environment!');
    console.log('This will create new database collections.');
    console.log('\nPlease type "CONFIRM" to proceed:');
    
    // 简单的确认机制（在实际使用中可能需要更复杂的确认）
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('> ', (answer: string) => {
        rl.close();
        resolve(answer.trim() === 'CONFIRM');
      });
    });
  }
  
  return true;
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// 执行完整迁移和验证
if (require.main === module) {
  (async () => {
    try {
      // 检查环境变量
      checkEnvironment();
      
      // 确认执行
      const confirmed = await confirmExecution();
      if (!confirmed) {
        console.log('\n❌ Migration cancelled by user.');
        process.exit(0);
      }
      
      // 执行迁移和验证
      await fullMigrationAndVerification();
      
    } catch (error) {
      console.error('Script execution failed:', error);
      process.exit(1);
    }
  })();
}

export { fullMigrationAndVerification };