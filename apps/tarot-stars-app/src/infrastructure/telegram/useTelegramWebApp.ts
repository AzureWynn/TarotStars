import { useState, useEffect } from 'react';
import { TelegramWebApp, TelegramUser } from './types';

export interface TelegramWebAppState {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegramEnvironment: boolean;
  themeParams: TelegramWebApp['themeParams'];
  colorScheme: 'light' | 'dark';
}

// 检测是否在Telegram Mini App环境中
const detectTelegramEnvironment = (): boolean => {
  // 检查User-Agent中是否包含Telegram相关标识
  const userAgent = navigator.userAgent.toLowerCase();
  const isTelegramUA = userAgent.includes('telegram') || 
                      userAgent.includes('tgwebapp') ||
                      userAgent.includes('tg_webview') ||
                      userAgent.includes('telegrambot');
  
  // 检查URL参数中是否有Telegram相关参数
  const urlParams = new URLSearchParams(window.location.search);
  const hasTelegramParams = urlParams.has('tgWebAppData') || 
                           urlParams.has('tgWebAppVersion') ||
                           urlParams.has('tgWebAppPlatform') ||
                           urlParams.has('tgWebAppThemeParams');
  
  // 检查是否有Telegram相关的全局对象
  const hasTelegramWebApp = !!(window.Telegram?.WebApp);
  const hasTelegramWebviewProxy = !!(window as any).TelegramWebviewProxy;
  const hasTelegramGameProxy = !!(window as any).TelegramGameProxy;
  
  // 检查referrer是否来自Telegram
  const referrer = document.referrer.toLowerCase();
  const isTelegramReferrer = referrer.includes('telegram') || referrer.includes('t.me');
  
  // 检查是否在iframe中（Telegram Mini App通常在iframe中运行）
  const isInIframe = window !== window.top;
  
  // 检查URL hash中是否有Telegram参数
  const hash = window.location.hash.toLowerCase();
  const hasTelegramHash = hash.includes('tgwebappdata') || hash.includes('tgwebappversion');
  
  // 检查是否有Telegram特有的CSS类或属性
  const hasTelegramClass = document.documentElement.classList.contains('tg') ||
                          document.body.classList.contains('tg-body');
  
  console.log('Environment detection:', {
    userAgent: userAgent,
    isTelegramUA,
    hasTelegramParams,
    hasTelegramWebApp,
    hasTelegramWebviewProxy,
    hasTelegramGameProxy,
    isTelegramReferrer,
    isInIframe,
    hasTelegramHash,
    hasTelegramClass,
    referrer,
    hash: window.location.hash,
    search: window.location.search
  });
  
  // 如果有任何明确的Telegram标识，则认为是Telegram环境
  return isTelegramUA || 
         hasTelegramParams || 
         hasTelegramWebApp || 
         hasTelegramWebviewProxy || 
         hasTelegramGameProxy ||
         isTelegramReferrer ||
         hasTelegramHash ||
         hasTelegramClass;
};

export const useTelegramWebApp = (): TelegramWebAppState => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [themeParams, setThemeParams] = useState<TelegramWebApp['themeParams']>({});
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 首先检测环境
    const isInTelegramEnv = detectTelegramEnvironment();
    
    const initTelegramWebApp = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize WebApp
        tg.ready();
        tg.expand();
        
        // Set state
        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
        setThemeParams(tg.themeParams || {});
        setColorScheme(tg.colorScheme || 'light');
        setIsTelegramEnvironment(true);
        setIsReady(true);
        
        // Configure WebApp
        tg.enableClosingConfirmation();
        
        // Set theme colors
        if (tg.themeParams.bg_color) {
          tg.setBackgroundColor(tg.themeParams.bg_color);
        }
        
        if (tg.themeParams.bg_color) {
          tg.setHeaderColor(tg.themeParams.bg_color);
        }
        
        // Request fullscreen if available
        try {
          tg.requestFullscreen();
        } catch (error) {
          console.log('Fullscreen not available:', error);
        }
        
        console.log('Telegram WebApp initialized:', {
          version: tg.version,
          platform: tg.platform,
          user: tg.initDataUnsafe?.user,
          themeParams: tg.themeParams
        });
      } else {
        // 如果检测到是Telegram环境但WebApp对象不可用
        if (isInTelegramEnv) {
          console.log('Detected Telegram environment but WebApp not available yet');
          setIsTelegramEnvironment(true);
          setIsReady(true);
          setUser(null); // 在Telegram环境中但WebApp未加载时，用户为null
        } else {
          console.log('Not in Telegram environment, setting defaults');
          setIsTelegramEnvironment(false);
          setIsReady(true);
          setUser(null);
        }
        
        // 设置默认主题
        setColorScheme('light');
        setThemeParams({
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff',
          secondary_bg_color: '#f1f1f1'
        });
      }
    };

    // Check if Telegram script is already loaded
    if (window.Telegram?.WebApp) {
      initTelegramWebApp();
    } else {
      // Wait for script to load
      const checkTelegram = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkTelegram);
          initTelegramWebApp();
        }
      }, 100);

      // Cleanup interval after 5 seconds
      setTimeout(() => {
        clearInterval(checkTelegram);
        if (!isReady) {
          console.log('Telegram WebApp not loaded after 5 seconds, using environment detection result');
          // 使用环境检测的结果，而不是强制设置为false
          setIsTelegramEnvironment(isInTelegramEnv);
          setIsReady(true);
          setColorScheme('light');
          setThemeParams({
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff',
            secondary_bg_color: '#f1f1f1'
          });
          setUser(null);
        }
      }, 5000);

      return () => clearInterval(checkTelegram);
    }
  }, []);

  return {
    webApp,
    user,
    isReady,
    isTelegramEnvironment,
    themeParams,
    colorScheme
  };
};

// Utility functions
export const getTelegramThemeColor = (colorKey: keyof TelegramWebApp['themeParams'], fallback: string): string => {
  if (window.Telegram?.WebApp?.themeParams?.[colorKey]) {
    return window.Telegram.WebApp.themeParams[colorKey]!;
  }
  return fallback;
};

export const isTelegramWebApp = (): boolean => {
  return !!(window.Telegram?.WebApp);
};

export const showTelegramAlert = (message: string): void => {
  if (window.Telegram?.WebApp) {
    // Use Telegram's native alert if available
    alert(message);
  } else {
    alert(message);
  }
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light'): void => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    if (type === 'success' || type === 'error' || type === 'warning') {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    } else {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  }
};