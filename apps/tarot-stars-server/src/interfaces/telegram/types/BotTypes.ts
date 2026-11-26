import { Context, SessionFlavor } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { MenuFlavor } from "@grammyjs/menu";
import { User } from '../../../domain/entities/UserEntities';

export type TarotConversation = Conversation<TarotBotContext>;

export interface BotConfig {
  botAdminId: number;
  isDeveloper: boolean;
  miniAppUrl: string;
}

export interface SessionData {
  user?: User;
  lastReadingDate?: number; // 毫秒级时间戳
  isFirstTime?: boolean;
}

export type TarotBotContext = Context &
  ConversationFlavor &
  MenuFlavor & {
    config: BotConfig;
    user?: User;
  } & SessionFlavor<SessionData>;

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface WebAppData {
  data: string;
  button_text: string;
}