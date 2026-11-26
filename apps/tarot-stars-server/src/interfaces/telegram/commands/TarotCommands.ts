import { Bot, InlineKeyboard } from "grammy";
import { TarotBotContext } from '../types/BotTypes';
import { TarotUseCases, UserUseCases } from '../../../application/usecases/TarotUseCases';
import { BotMessageService } from '../i18n/BotMessages';
import { SupportedLanguage } from '../../../domain/entities/NewTarotSchema';

export class TarotCommands {
  constructor(
    private tarotUseCases: TarotUseCases,
    private userUseCases: UserUseCases
  ) {}

  bindCommands(bot: Bot<TarotBotContext>): void {
    // 开始命令
    bot.command("start", async (ctx) => {
      await this.handleStart(ctx);
    });

    // 每日一牌命令
    bot.command("daily", async (ctx) => {
      await this.handleDailyReading(ctx);
    });

    // 历史记录命令
    bot.command("history", async (ctx) => {
      await this.handleHistory(ctx);
    });

    // 打开小程序命令
    bot.command("app", async (ctx) => {
      await this.handleOpenMiniApp(ctx);
    });

    // 帮助命令
    bot.command("help", async (ctx) => {
      await this.handleHelp(ctx);
    });

    // 处理 Web App 数据
    bot.on("message:web_app_data", async (ctx) => {
      await this.handleWebAppData(ctx);
    });

    // 处理内联键盘回调查询
    bot.on("callback_query:data", async (ctx) => {
      await this.handleCallbackQuery(ctx);
    });
  }

  private async handleStart(ctx: TarotBotContext): Promise<void> {
    try {
      // 创建或更新用户
      const telegramUser = ctx.from;
      if (!telegramUser) return;

      const user = await this.userUseCases.createOrUpdateUser(telegramUser.id, {
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        languageCode: telegramUser.language_code
      });

      ctx.user = user;

      // 获取用户语言偏好
      const userLanguage = (user.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);

      const welcomeMessage = `${messages.welcome.title}\n\n` +
        `${messages.welcome.description}\n\n` +
        `${messages.welcome.instructions.daily}\n` +
        `${messages.welcome.instructions.app}\n` +
        `${messages.welcome.instructions.history}\n` +
        `${messages.welcome.instructions.help}`;

      const keyboard = new InlineKeyboard()
        .text(messages.buttons.dailyReading, "daily_reading")
        .row()
        .webApp(messages.buttons.openApp, ctx.config.miniAppUrl)
        .row()
        .text(messages.buttons.viewHistory, "view_history");

      await ctx.reply(welcomeMessage, {
        reply_markup: keyboard,
        // parse_mode: "Markdown"
      });
    } catch (error) {
      console.error('Error in handleStart:', error);
      const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);
      await ctx.reply(messages.messages.startupFailed);
    }
  }

  private async handleDailyReading(ctx: TarotBotContext): Promise<void> {
    try {
      const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);

      if (!ctx.user) {
        await ctx.reply(messages.messages.pleaseRegister);
        return;
      }

      // 检查今日是否已抽牌
      const hasReading = await this.tarotUseCases.hasReadingToday(ctx.user._id!);
      if (hasReading) {
        await ctx.reply(messages.messages.alreadyDrawnToday);
        return;
      }

      await ctx.reply(messages.messages.drawingCard);

      const reading = await this.tarotUseCases.getDailyReading(ctx.user._id!, userLanguage);
      const message = this.formatReadingMessage(reading, userLanguage, messages);

      const keyboard = new InlineKeyboard()
        .text(messages.buttons.viewInApp, "view_in_app")
        .row()
        .text(messages.buttons.viewHistory, "view_history");

      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: "Markdown"
      });
    } catch (error) {
      console.error('Error in handleDailyReading:', error);
      const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);
      await ctx.reply(messages.messages.drawFailed);
    }
  }

  private async handleHistory(ctx: TarotBotContext): Promise<void> {
    try {
      const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);

      if (!ctx.user) {
        await ctx.reply(messages.messages.pleaseRegister);
        return;
      }

      const history = await this.tarotUseCases.getUserReadingHistory(ctx.user._id!, 5, userLanguage);
      
      if (history.length === 0) {
        await ctx.reply(messages.messages.noHistory);
        return;
      }

      let message = `${messages.history.title}\n\n`;
      
      history.forEach((reading, index) => {
        const date = new Date(reading.date).toLocaleDateString(userLanguage === 'en' ? 'en-US' : userLanguage === 'ja' ? 'ja-JP' : userLanguage === 'ko' ? 'ko-KR' : 'zh-CN');
        const position = reading.isReversed ? messages.history.position.reversed : messages.history.position.upright;
        message += `${index + 1}\. ${date}\n`;
        message += `   🃏 ${reading.card.name} (${position})\n\n`;
      });

      const keyboard = new InlineKeyboard()
        .webApp(messages.buttons.viewInApp, ctx.config.miniAppUrl)
        .row()
        .text(messages.buttons.dailyReading, "daily_reading");

      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: "Markdown"
      });
    } catch (error) {
      console.error('Error in handleHistory:', error);
      const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
      const messages = BotMessageService.getMessages(userLanguage);
      await ctx.reply(messages.messages.historyFailed);
    }
  }

  private async handleOpenMiniApp(ctx: TarotBotContext): Promise<void> {
    const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
    const messages = BotMessageService.getMessages(userLanguage);

    const keyboard = new InlineKeyboard()
      .webApp(messages.buttons.openApp, ctx.config.miniAppUrl);

    await ctx.reply(
      messages.messages.openMiniApp,
      { reply_markup: keyboard }
    );
  }

  private async handleHelp(ctx: TarotBotContext): Promise<void> {
    const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
    const messages = BotMessageService.getMessages(userLanguage);

    const helpMessage = `${messages.help.title}\n\n` +
      `${messages.help.commands.daily}\n` +
      `${messages.help.commands.app}\n` +
      `${messages.help.commands.history}\n` +
      `${messages.help.commands.help}\n\n` +
      `${messages.help.features.title}\n` +
      `${messages.help.features.dailyCard}\n` +
      `${messages.help.features.professionalReading}\n` +
      `${messages.help.features.historyRecord}\n` +
      `${messages.help.features.miniApp}\n\n` +
      `${messages.help.closing}`;

    await ctx.reply(helpMessage, { parse_mode: "Markdown" });
  }

  private async handleCallbackQuery(ctx: TarotBotContext): Promise<void> {
    try {
      const callbackData = ctx.callbackQuery?.data;
      if (!callbackData) return;

      // 检查回调查询是否过期（超过10秒）
      const callbackQuery = ctx.callbackQuery;
      if (callbackQuery) {
        const now = Date.now() / 1000; // 转换为秒
        const queryTime = callbackQuery.id ? parseInt(callbackQuery.id) / 1000000000 : now;
        if (now - queryTime > 10) {
          console.log('Callback query is too old, skipping answer');
          // 直接处理业务逻辑，不回答过期的回调
        } else {
          // 只有在查询未过期时才回答
          try {
            await ctx.answerCallbackQuery();
          } catch (answerError: any) {
            // 如果回答失败，记录错误但继续处理业务逻辑
            if (answerError.error_code === 400 && answerError.description?.includes('too old')) {
              console.log('Callback query expired during processing');
            } else {
              console.error('Failed to answer callback query:', answerError.message);
            }
          }
        }
      }

      // 处理业务逻辑
      switch (callbackData) {
        case 'daily_reading':
          await this.handleDailyReading(ctx);
          break;
        case 'view_history':
          await this.handleHistory(ctx);
          break;
        case 'view_in_app':
          await this.handleOpenMiniApp(ctx);
          break;
        default:
          console.log('Unknown callback data:', callbackData);
      }
    } catch (error: any) {
      console.error('Error handling callback query:', error);
      // 只在网络连接正常时尝试发送错误回复
      try {
        if (!error.message?.includes('network') && !error.message?.includes('ECONNRESET')) {
          const userLanguage = (ctx.user?.languageCode as SupportedLanguage) || 'zh';
          const messages = BotMessageService.getMessages(userLanguage);
          await ctx.answerCallbackQuery(messages.messages.operationFailed);
        }
      } catch (replyError) {
        // 忽略回复错误，避免无限循环
        console.log('Failed to send error reply, network may be unstable');
      }
    }
  }

  private async handleWebAppData(ctx: TarotBotContext): Promise<void> {
    try {
      const webAppData = ctx.message?.web_app_data?.data;
      if (!webAppData) return;

      const data = JSON.parse(webAppData);
      
      // 处理来自小程序的数据
      switch (data.action) {
        case 'daily_reading_completed':
          await ctx.reply("🌟 恭喜完成今日塔罗牌抽取！愿这份指引为你带来好运。");
          break;
        case 'share_reading':
          await ctx.reply("📤 感谢分享你的塔罗体验！");
          break;
        default:
          await ctx.reply("📱 收到来自小程序的消息。");
      }
    } catch (error) {
      console.error('Error handling web app data:', error);
    }
  }

  private formatReadingMessage(reading: any, userLanguage: SupportedLanguage, messages: any): string {
    const position = reading.isReversed ? messages.history.position.reversed : messages.history.position.upright;
    const date = new Date(reading.date).toLocaleDateString(
      userLanguage === 'en' ? 'en-US' : 
      userLanguage === 'ja' ? 'ja-JP' : 
      userLanguage === 'ko' ? 'ko-KR' : 'zh-CN'
    );
    
    const dailyTarotTitle = userLanguage === 'en' ? 'Daily Tarot' :
                           userLanguage === 'ja' ? '今日のタロット' :
                           userLanguage === 'ko' ? '오늘의 타로' : '每日塔罗';
    
    const closingMessage = userLanguage === 'en' ? '_May this guidance bring wisdom and good fortune to your day!_' :
                          userLanguage === 'ja' ? '_この導きがあなたの一日に知恵と幸運をもたらしますように！_' :
                          userLanguage === 'ko' ? '_이 안내가 당신의 하루에 지혜와 행운을 가져다주기를 바랍니다!_' : 
                          '_愿这份指引为你的一天带来智慧与好运！_';
    
    return `🔮 *${date} ${dailyTarotTitle}*\n\n` +
           `🃏 **${reading.card.name}** (${position})\n\n` +
           `${reading.interpretation}\n\n` +
           `🌟 ${closingMessage}`;
  }
}