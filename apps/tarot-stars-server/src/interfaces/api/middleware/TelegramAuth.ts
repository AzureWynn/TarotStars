import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface TelegramWebAppData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
}

/**
 * 验证 Telegram Web App 数据的中间件
 * 根据 Telegram 官方文档验证数据完整性
 */
export function validateTelegramWebAppData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      res.status(500).json({ error: 'Bot token not configured' });
      return;
    }

    // 从请求头或请求体获取 Telegram Web App 数据
    const initData = req.headers['x-telegram-web-app-init-data'] as string || 
                     req.body.initData as string;

    if (!initData) {
      res.status(401).json({ error: 'Missing Telegram Web App init data' });
      return;
    }

    // 验证数据
    if (!verifyTelegramWebAppData(initData, botToken)) {
      res.status(401).json({ error: 'Invalid Telegram Web App data' });
      return;
    }

    // 解析用户数据
    const userData = parseTelegramWebAppData(initData);
    if (!userData.user) {
      res.status(401).json({ error: 'No user data in Telegram Web App data' });
      return;
    }

    // 将用户数据添加到请求对象
    req.telegramUser = userData.user;
    req.telegramAuthDate = userData.auth_date;

    next();
  } catch (error) {
    console.error('Error validating Telegram Web App data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * 验证 Telegram Web App 数据的完整性
 */
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // 移除 hash 参数
    urlParams.delete('hash');
    
    // 按字母顺序排序参数
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // 创建密钥
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // 计算期望的 hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    return expectedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram Web App data:', error);
    return false;
  }
}

/**
 * 解析 Telegram Web App 数据
 */
function parseTelegramWebAppData(initData: string): TelegramWebAppData {
  const urlParams = new URLSearchParams(initData);
  const result: any = {};

  for (const [key, value] of urlParams.entries()) {
    if (key === 'user') {
      try {
        result.user = JSON.parse(decodeURIComponent(value));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else if (key === 'auth_date') {
      result.auth_date = parseInt(value);
    } else if (key === 'hash') {
      result.hash = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 可选的验证中间件，用于开发环境跳过验证
 */
export function optionalTelegramAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_AUTH === 'true') {
    // 开发环境可以跳过验证，使用模拟用户数据
    req.telegramUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'zh'
    };
    req.telegramAuthDate = Math.floor(Date.now() / 1000);
    next();
    return;
  }

  validateTelegramWebAppData(req, res, next);
}

// 扩展 Request 接口
declare global {
  namespace Express {
    interface Request {
      telegramUser?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        is_premium?: boolean;
      };
      telegramAuthDate?: number;
    }
  }
}