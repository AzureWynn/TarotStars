import { SocksProxyAgent } from "socks-proxy-agent";
import { Bot } from "grammy";
import { conversations } from "@grammyjs/conversations";
import { session } from "grammy";
import dotenv from "dotenv";

import { TarotBotContext, BotConfig } from './interfaces/telegram/types/BotTypes';
import { TarotCommands } from './interfaces/telegram/commands/TarotCommands';
import { TarotMenu } from './interfaces/telegram/menu/TarotMenu';
import { BotMessageService } from './interfaces/telegram/i18n/BotMessages';
import { SupportedLanguage } from './domain/entities/NewTarotSchema';
import { ExpressApp } from './interfaces/api/ExpressApp';
import { MongoConnection } from './infrastructure/database/MongoConnection';
import { TarotUseCases, UserUseCases } from './application/usecases/TarotUseCases';
import { TarotRepository } from './infrastructure/repositories/TarotRepository';
import { MongoDailyReadingRepository } from './infrastructure/repositories/DailyReadingRepository';
import { MongoUserRepository } from './infrastructure/repositories/UserRepository';

// 加载环境变量
dotenv.config();

// ===========================================================================
//                        Configuration Section
// ===========================================================================
const BOT_TOKEN = process.env.BOT_TOKEN || "test";
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tarot-stars';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'tarot-stars';
const PORT = parseInt(process.env.PORT || '3001');
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-mini-app-domain.com';
const SOCKS_PROXY = process.env.SOCKS_PROXY;

const botConfig: BotConfig = {
  botAdminId: parseInt(process.env.BOT_ADMIN_ID || '0'),
  isDeveloper: process.env.NODE_ENV === 'development',
  miniAppUrl: MINI_APP_URL
};

// ===========================================================================
//                        Database Initialization
// ===========================================================================
async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect(MONGODB_URI, MONGODB_DB_NAME);
    
    console.log('🗄️ Database connected successfully');
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// ===========================================================================
//                        Bot Initialization
// ===========================================================================
function createBot(): Bot<TarotBotContext> {
  let config = {};
  
  // 开发环境代理配置
  if (process.env.NODE_ENV === 'development' && SOCKS_PROXY) {
    config = {
      client: {
        baseFetchConfig: {
          agent: new SocksProxyAgent(SOCKS_PROXY),
          compress: true,
        },
      },
    };
    console.log('🌐 Using SOCKS proxy for development');
  }

  const bot = new Bot<TarotBotContext>(BOT_TOKEN, config);
  
  // 添加配置到上下文
  bot.use((ctx, next) => {
    ctx.config = botConfig;
    return next();
  });

  return bot;
}

function setupBot(bot: Bot<TarotBotContext>): void {
  // 初始化仓储和用例
  const tarotCardRepository = new TarotRepository();
  const dailyReadingRepository = new MongoDailyReadingRepository();
  const userRepository = new MongoUserRepository();
  
  const tarotUseCases = new TarotUseCases(
    dailyReadingRepository,
    userRepository,
    tarotCardRepository
  );
  
  const userUseCases = new UserUseCases(userRepository);

  // 设置会话
  bot.use(session({
    initial: (): any => ({
      favoriteIds: [],
      isFirstTime: true
    })
  }));

  // 设置对话
  bot.use(conversations());

  // 用户中间件 - 自动创建/更新用户
  bot.use(async (ctx, next) => {
    if (ctx.from && !ctx.from.is_bot) {
      try {
        const user = await userUseCases.createOrUpdateUser(ctx.from.id, {
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          languageCode: ctx.from.language_code
        });
        ctx.user = user;
      } catch (error) {
        console.error('Error creating/updating user:', error);
      }
    }
    return next();
  });

  // 绑定命令
  const tarotCommands = new TarotCommands(tarotUseCases, userUseCases);
  tarotCommands.bindCommands(bot);

  // 创建菜单
  const tarotMenu = new TarotMenu(tarotUseCases);
  tarotMenu.createMainMenu(bot);

  // 设置多语言bot命令菜单（异步执行，避免阻塞bot启动）
  setTimeout(() => {
    setupMultiLanguageCommands(bot);
  }, 5000); // 延迟5秒执行，确保bot已完全启动

  // 错误处理
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  console.log('🤖 Bot setup completed');
}

// ===========================================================================
//                        Multi-language Commands Setup
// ===========================================================================
async function setupMultiLanguageCommands(bot: Bot<TarotBotContext>, retryCount: number = 0): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 10000; // 10秒
  
  try {
    console.log(`🔄 Setting up multi-language commands (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    const supportedLanguages: SupportedLanguage[] = BotMessageService.getSupportedLanguages();
    
    // 为每种支持的语言设置命令
    for (const language of supportedLanguages) {
      const commands = BotMessageService.getCommandDescriptions(language);
      await bot.api.setMyCommands(commands, {
        language_code: language
      });
      console.log(`📋 Commands set for language: ${language}`);
    }
    
    // 设置默认命令（中文）
    const defaultCommands = BotMessageService.getCommandDescriptions('zh');
    await bot.api.setMyCommands(defaultCommands);
    console.log('📋 Default commands set (Chinese)');
    console.log('✅ Multi-language commands setup completed successfully!');
    
  } catch (error) {
    console.error(`❌ Failed to setup multi-language commands (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in ${retryDelay / 1000} seconds...`);
      setTimeout(() => {
        setupMultiLanguageCommands(bot, retryCount + 1);
      }, retryDelay);
    } else {
      console.error('❌ Max retries reached. Attempting fallback to Chinese commands only...');
      // 如果多语言设置失败，至少设置默认的中文命令
      try {
        const fallbackCommands = BotMessageService.getCommandDescriptions('zh');
        await bot.api.setMyCommands(fallbackCommands);
        console.log('📋 Fallback to default Chinese commands successful');
      } catch (fallbackError) {
        console.error('❌ Failed to set fallback commands:', fallbackError);
        console.error('⚠️  Bot commands may not be properly configured. Manual intervention may be required.');
      }
    }
  }
}

// ===========================================================================
//                        Express Server Initialization
// ===========================================================================
function startExpressServer(): void {
  const expressApp = new ExpressApp();
  expressApp.listen(PORT);
}

// ===========================================================================
//                        Main Application
// ===========================================================================
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Tarot Stars Server...');
    
    // 1. 初始化数据库
    await initializeDatabase();
    
    // 2. 创建和设置 Bot
    const bot = createBot();
    setupBot(bot);
    
    // 3. 启动 Express 服务器
    startExpressServer();
    
    // 4. 启动 Bot
    console.log('🤖 Starting Telegram Bot...');
    
    // 优雅关闭处理
    process.once('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await bot.stop();
      await MongoConnection.getInstance().disconnect();
      process.exit(0);
    });
    
    process.once('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      await MongoConnection.getInstance().disconnect();
      process.exit(0);
    });
    
    // 启动 Bot
    await bot.start({
      allowed_updates: [
        'message', 
        'callback_query', 
        'inline_query'
      ]
    });
    
    console.log('✅ Tarot Stars Server is running successfully!');
    console.log(`🤖 Bot: @${bot.botInfo.username}`);
    console.log(`🌐 API Server: http://localhost:${PORT}`);
    console.log(`📱 Mini App URL: ${MINI_APP_URL}`);
    
  } catch (error) {
    console.error('❌ Failed to start Tarot Stars Server:', error);
    process.exit(1);
  }
}

// 启动应用
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});