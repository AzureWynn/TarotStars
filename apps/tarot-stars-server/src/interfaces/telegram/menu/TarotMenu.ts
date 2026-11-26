import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";
import { TarotBotContext } from '../types/BotTypes';
import { TarotUseCases } from '../../../application/usecases/TarotUseCases';
import { getMenuTexts } from './MenuTexts';
import { SupportedLanguage } from '../../../domain/entities/NewTarotSchema';

export class TarotMenu {
  constructor(
    private tarotService: TarotUseCases,
  ) { }

  private getUserLanguage(ctx: TarotBotContext): SupportedLanguage {
    // 优先使用数据库中用户的languageCode（用户已设置的语言偏好）
    if (ctx.user?.languageCode) {
      const normalizedLanguage = this.normalizeLanguageCode(ctx.user.languageCode);
      const supportedLanguages: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
      if (supportedLanguages.includes(normalizedLanguage as SupportedLanguage)) {
        return normalizedLanguage as SupportedLanguage;
      }
    }
    
    // 如果用户没有设置语言偏好，返回默认中文
    return 'zh';
  }
  
  private normalizeLanguageCode(languageCode: string): string {
    // 转换为小写
    const lowerCode = languageCode.toLowerCase();
    
    // 处理中文的各种变体
    if (lowerCode.startsWith('zh')) {
      return 'zh';
    }
    
    // 处理英文的各种变体
    if (lowerCode.startsWith('en')) {
      return 'en';
    }
    
    // 处理日文的各种变体
    if (lowerCode.startsWith('ja')) {
      return 'ja';
    }
    
    // 处理韩文的各种变体
    if (lowerCode.startsWith('ko')) {
      return 'ko';
    }
    
    // 返回原始代码（如果没有匹配的话）
    return lowerCode;
  }

  createMainMenu(bot: Bot<TarotBotContext>): void {
    const mainMenu = new Menu<TarotBotContext>("main_menu")
      .submenu("🃏 塔罗功能", "tarot_menu", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.tarotMenu.title}\n\n选择你想要的功能：`, {
          parse_mode: "MarkdownV2"
        });
      })
      .row()
      .submenu("📱 小程序", "app_menu", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.appMenu.title}\n\n体验更丰富的塔罗功能：`, {
          parse_mode: "MarkdownV2"
        });
      })
      .row()
      .submenu("ℹ️ 帮助", "help_menu", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.helpMenu.title}\n\n选择你需要的帮助：`, {
          parse_mode: "MarkdownV2"
        });
      });

    // 塔罗功能子菜单
    const tarotMenu = new Menu<TarotBotContext>("tarot_menu")
      .text("🌟 今日塔罗", async (ctx) => {
        await this.handleDailyReading(ctx);
      })
      .row()
      .text("📚 历史记录", async (ctx) => {
        await this.handleHistory(ctx);
      })
      .row()
      .text("🔮 塔罗知识", async (ctx) => {
        await this.handleTarotKnowledge(ctx);
      })
      .row()
      .back("◀️ 返回主菜单", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.mainMenu.title}\n\n${texts.mainMenu.welcome}`, {
          parse_mode: "MarkdownV2"
        });
      });

    // 小程序功能子菜单
    const appMenu = new Menu<TarotBotContext>("app_menu")
      // .webApp("🚀 打开小程序", (ctx: any) => ctx.config.miniAppUrl)
      .webApp("🚀 打开小程序", "https://t.me/tarot_stars_bot/tarot_stars_app")
      .row()
      .text("📖 小程序介绍", async (ctx) => {
        await this.handleAppIntroduction(ctx);
      })
      .row()
      .back("◀️ 返回主菜单", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.mainMenu.title}\n\n${texts.mainMenu.welcome}`, {
          parse_mode: "MarkdownV2"
        });
      });

    // 帮助子菜单
    const helpMenu = new Menu<TarotBotContext>("help_menu")
      .text("📋 使用指南", async (ctx) => {
        await this.handleUserGuide(ctx);
      })
      .row()
      .text("🃏 塔罗介绍", async (ctx) => {
        await this.handleTarotIntroduction(ctx);
      })
      .row()
      .text("❓ 常见问题", async (ctx) => {
        await this.handleFAQ(ctx);
      })
      .row()
      .back("◀️ 返回主菜单", async (ctx) => {
        const language = this.getUserLanguage(ctx);
        const texts = getMenuTexts(language);
        await ctx.editMessageText(`${texts.mainMenu.title}\n\n${texts.mainMenu.welcome}`, {
          parse_mode: "MarkdownV2"
        });
      });

    // 注册子菜单
    mainMenu.register(tarotMenu);
    mainMenu.register(appMenu);
    mainMenu.register(helpMenu);

    // 注册菜单到 bot
    bot.use(mainMenu);

    // 菜单命令
    bot.command("menu", async (ctx) => {
      const language = this.getUserLanguage(ctx);
      const texts = getMenuTexts(language);
      await ctx.reply(`${texts.mainMenu.title}\n\n${texts.mainMenu.welcome}`, {
        parse_mode: "MarkdownV2",
        reply_markup: mainMenu
      });
    });
  }

  private async handleDailyReading(ctx: TarotBotContext): Promise<void> {
    try {
      const language = this.getUserLanguage(ctx);
      const texts = getMenuTexts(language);
      
      if (!ctx.user) {
        await ctx.answerCallbackQuery(texts.messages.pleaseRegister);
        return;
      }

      const hasReading = await this.tarotService.hasReadingToday(ctx.user._id!);
      if (hasReading) {
        await ctx.answerCallbackQuery(texts.messages.alreadyDrawnToday);
        await ctx.editMessageText(texts.messages.alreadyDrawnMessage);
        return;
      }

      await ctx.answerCallbackQuery(texts.messages.drawingCard);
      const drawingMessage = language === 'zh' ? 
        "🔮 正在为你抽取今日塔罗牌..." :
        language === 'en' ? 
        "🔮 Drawing your daily tarot card..." :
        language === 'ja' ? 
        "🔮 今日のタロットカードを引いています..." :
        "🔮 오늘의 타로 카드를 뽑고 있습니다...";
      await ctx.editMessageText(drawingMessage);

      const reading = await this.tarotService.getDailyReading(ctx.user._id!, language);
      const message = this.formatReadingMessage(reading, language);

      await ctx.editMessageText(message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error('Error in handleDailyReading:', error);
      const language = this.getUserLanguage(ctx);
      const texts = getMenuTexts(language);
      await ctx.answerCallbackQuery(texts.messages.drawingFailed);
    }
  }

  private async handleHistory(ctx: TarotBotContext): Promise<void> {
    try {
      const language = this.getUserLanguage(ctx);
      const texts = getMenuTexts(language);
      
      if (!ctx.user) {
        await ctx.answerCallbackQuery(texts.messages.pleaseRegister);
        return;
      }

      const history = await this.tarotService.getUserReadingHistory(ctx.user._id!, 3);

      if (history.length === 0) {
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(texts.messages.noHistory);
        return;
      }

      let message = `${texts.messages.recentReadings}\n\n`;

      history.forEach((reading, index) => {
        // 将毫秒时间戳转换为Date对象进行格式化
        const date = new Date(reading.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : 'en-US');
        const position = reading.isReversed ? (language === 'zh' ? '逆位' : language === 'en' ? 'Reversed' : language === 'ja' ? '逆位置' : '역위치') : (language === 'zh' ? '正位' : language === 'en' ? 'Upright' : language === 'ja' ? '正位置' : '정위치');
        message += `${index + 1}\. ${date}\n`;
        message += `   🃏 ${reading.card.name} (${position})\n\n`;
      });

      message += texts.messages.viewFullHistory;

      await ctx.answerCallbackQuery();
      await ctx.editMessageText(message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error('Error in handleHistory:', error);
      const language = this.getUserLanguage(ctx);
      const texts = getMenuTexts(language);
      await ctx.answerCallbackQuery(texts.messages.historyFailed);
    }
  }

  private async handleTarotKnowledge(ctx: TarotBotContext): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const texts = getMenuTexts(language);
    const content = texts.content.tarotKnowledge;
    
    const knowledgeMessage = `${content.title}\n\n` +
      `${content.composition}\n` +
      `${content.majorArcana}\n` +
      `${content.minorArcana}\n\n` +
      `${content.suits}\n` +
      `${content.wands}\n` +
      `${content.cups}\n` +
      `${content.swords}\n` +
      `${content.pentacles}\n\n` +
      `${content.conclusion}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(knowledgeMessage, { parse_mode: "Markdown" });
  }

  private async handleAppIntroduction(ctx: TarotBotContext): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const texts = getMenuTexts(language);
    const content = texts.content.appIntroduction;
    
    const introMessage = `${content.title}\n\n` +
      `${content.features}\n` +
      `${content.beautifulUI}\n` +
      `${content.interactiveExperience}\n` +
      `${content.detailedAnalysis}\n` +
      `${content.personalTracking}\n` +
      `${content.multipleMethods}\n\n` +
      `${content.conclusion}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(introMessage, { parse_mode: "Markdown" });
  }

  private async handleUserGuide(ctx: TarotBotContext): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const texts = getMenuTexts(language);
    const content = texts.content.userGuide;
    
    const guideMessage = `${content.title}\n\n` +
      `${content.quickStart}\n` +
      `${content.step1}\n` +
      `${content.step2}\n` +
      `${content.step3}\n\n` +
      `${content.mainFeatures}\n` +
      `${content.dailyCard}\n` +
      `${content.historyRecord}\n` +
      `${content.miniApp}\n\n` +
      `${content.tips}\n` +
      `${content.tip1}\n` +
      `${content.tip2}\n` +
      `${content.tip3}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(guideMessage, { parse_mode: "MarkdownV2" });
  }

  private async handleTarotIntroduction(ctx: TarotBotContext): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const texts = getMenuTexts(language);
    const content = texts.content.tarotIntroduction;
    
    const introMessage = `${content.title}\n\n` +
      `${content.description}\n\n` +
      `${content.coreValues}\n` +
      `${content.selfReflection}\n` +
      `${content.innerWisdom}\n` +
      `${content.lifeDirection}\n` +
      `${content.personalGrowth}\n\n` +
      `${content.principles}\n` +
      `${content.principle1}\n` +
      `${content.principle2}\n` +
      `${content.principle3}\n\n` +
      `${content.conclusion}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(introMessage, { parse_mode: "Markdown" });
  }

  private async handleFAQ(ctx: TarotBotContext): Promise<void> {
    const language = this.getUserLanguage(ctx);
    const texts = getMenuTexts(language);
    const content = texts.content.faq;
    
    const faqMessage = `${content.title}\n\n` +
      `${content.q1}\n` +
      `${content.a1}\n\n` +
      `${content.q2}\n` +
      `${content.a2}\n\n` +
      `${content.q3}\n` +
      `${content.a3}\n\n` +
      `${content.q4}\n` +
      `${content.a4}\n\n` +
      `${content.q5}\n` +
      `${content.a5}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(faqMessage, { parse_mode: "Markdown" });
  }

  private formatReadingMessage(reading: any, language: SupportedLanguage): string {
    const texts = getMenuTexts(language);
    const position = reading.isReversed ? 
      (language === 'zh' ? '逆位' : language === 'en' ? 'Reversed' : language === 'ja' ? '逆位置' : '역위치') : 
      (language === 'zh' ? '正位' : language === 'en' ? 'Upright' : language === 'ja' ? '正位置' : '정위치');
    
    // 将毫秒时间戳转换为Date对象进行格式化
    const date = new Date(reading.date).toLocaleDateString(
      language === 'zh' ? 'zh-CN' : 
      language === 'ja' ? 'ja-JP' : 
      language === 'ko' ? 'ko-KR' : 'en-US'
    );

    return `🔮 *${date} ${texts.messages.todayReading}*\n\n` +
      `🃏 **${reading.card.name}** (${position})\n\n` +
      `${reading.interpretation}\n\n` +
      `🌟 _${texts.messages.wishMessage}_`;
  }
}