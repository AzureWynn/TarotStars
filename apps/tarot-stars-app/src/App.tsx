import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './infrastructure/store';
import styled, { createGlobalStyle } from 'styled-components';
import { createStore } from './infrastructure/store';
import { TarotApplicationServiceImpl } from './application/services/TarotApplicationService';
import { TarotApiService } from './infrastructure/api/TarotApiService';
import { DailyTarot } from './components/DailyTarot/DailyTarot';
import { ReadingHistory } from './components/History/ReadingHistory';
import { TarotIntegration } from './components/Tarot/TarotIntegration';
import { TabNavigation, TabType } from './components/Navigation/TabNavigation';
import { LanguageToggle } from './components/common/LanguageToggle';
import { useTelegramWebApp, getTelegramThemeColor } from './infrastructure/telegram/useTelegramWebApp';
import { setLanguage } from './infrastructure/store/tarotSlice';
import { SupportedLanguage } from './domain/entities/TarotCard';
// import TelegramGuide from './components/TelegramGuide';
import './infrastructure/telegram/types';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
    color: ${() => getTelegramThemeColor('text_color', '#000000')};
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  #root {
    min-height: 100vh;
    background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  }
  
  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${() => getTelegramThemeColor('secondary_bg_color', '#f1f1f1')};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${() => getTelegramThemeColor('hint_color', '#c1c1c1')};
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  position: relative;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-bottom: 1px solid ${() => getTelegramThemeColor('hint_color', '#e0e0e0')};
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')}95;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;



const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
`;

const LoadingText = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${() => getTelegramThemeColor('hint_color', '#e0e0e0')};
  border-top: 3px solid ${() => getTelegramThemeColor('button_color', '#2481cc')};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Create store with a temporary service instance
const tempTarotRepository = new TarotApiService();
const tempTarotService = new TarotApplicationServiceImpl(tempTarotRepository);
const store = createStore(tempTarotService);

// Create service instances with user data
const createTarotService = (user?: any) => {
  const tarotRepository = new TarotApiService(undefined, user);
  return new TarotApplicationServiceImpl(tarotRepository, user);
}

const AppContent: React.FC = () => {
  const { isReady, isTelegramEnvironment, user } = useTelegramWebApp();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = React.useState<TabType>('daily');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const language = useSelector((state: RootState) => state.tarot.language);
  
  // 创建带有用户数据的tarotService实例
  const tarotService = React.useMemo(() => createTarotService(user), [user]);

  // 稳定的用户ID引用，避免无限循环
  const userId = user?.id;
  const userLanguageCode = user?.language_code;
  
  // 初始化用户和语言设置
  React.useEffect(() => {
    const initializeUserAndLanguage = async () => {
      if (!isReady) return;
      
      // 如果不在 Telegram 环境中，使用默认设置并标记为已初始化
      if (!isTelegramEnvironment) {
        console.log('Not in Telegram environment, using default settings');
        dispatch(setLanguage('zh')); // 设置默认语言
        setIsInitialized(true);
        return;
      }
      
      // 如果在Telegram环境但用户数据还没准备好，等待
      if (!userId) {
        console.log('Waiting for user data...', { 
          hasUser: !!user, 
          userId: userId, 
          userFirstName: user?.first_name,
          telegramWebApp: !!window.Telegram?.WebApp,
          initDataUnsafe: window.Telegram?.WebApp?.initDataUnsafe,
          initData: window.Telegram?.WebApp?.initData
        });
        return;
      }
      
      try {
        // 首先确定应该使用的语言
        const telegramLanguage = userLanguageCode;
        let initialLanguage: SupportedLanguage = 'zh';
        
        if (telegramLanguage) {
          // 映射Telegram语言代码到支持的语言
          if (telegramLanguage.startsWith('en')) initialLanguage = 'en';
          else if (telegramLanguage.startsWith('ja')) initialLanguage = 'ja';
          else if (telegramLanguage.startsWith('ko')) initialLanguage = 'ko';
          else if (telegramLanguage.startsWith('zh')) initialLanguage = 'zh';
        }
        
        console.log('Telegram language code:', telegramLanguage, 'Mapped to:', initialLanguage);
        
        // 只在Telegram环境中调用API服务
        if (isTelegramEnvironment && userId) {
          // 使用确定的语言初始化用户
          const userData = await tarotService.initializeUser(initialLanguage);
          
          // 如果用户已存在且有languageCode，使用数据库中的语言设置
          if (userData && userData.languageCode) {
            const dbLanguage = userData.languageCode as SupportedLanguage;
            console.log('Database language:', dbLanguage);
            if (['zh', 'en', 'ja', 'ko'].includes(dbLanguage)) {
              dispatch(setLanguage(dbLanguage));
            } else {
              // 如果数据库中的语言不支持，使用初始语言
              dispatch(setLanguage(initialLanguage));
            }
          } else {
            // 如果没有数据库语言设置，使用初始语言
            dispatch(setLanguage(initialLanguage));
          }
        } else {
          // 非Telegram环境，直接使用初始语言
          dispatch(setLanguage(initialLanguage));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize user and language:', error);
        // 即使API调用失败，也要设置语言并标记为已初始化
        const telegramLanguage = userLanguageCode;
        let fallbackLanguage: SupportedLanguage = 'zh';
        
        if (telegramLanguage) {
          if (telegramLanguage.startsWith('en')) fallbackLanguage = 'en';
          else if (telegramLanguage.startsWith('ja')) fallbackLanguage = 'ja';
          else if (telegramLanguage.startsWith('ko')) fallbackLanguage = 'ko';
          else if (telegramLanguage.startsWith('zh')) fallbackLanguage = 'zh';
        }
        
        dispatch(setLanguage(fallbackLanguage));
        setIsInitialized(true);
      }
    };
    
    initializeUserAndLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isTelegramEnvironment, userId, userLanguageCode, dispatch]);

  // 在非Telegram环境中，显示功能受限的版本
  if (!isTelegramEnvironment) {
    return (
      <AppContainer>
        <GlobalStyle />
        <Header>
          <Logo>
            <span>🔮</span>
            <span>Tarot Stars</span>
          </Logo>
          <HeaderControls>
            <LanguageToggle />
          </HeaderControls>
        </Header>
        <main>
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            language={language}
          />
          {activeTab === 'daily' ? (
            <DailyTarot tarotService={tarotService} />
          ) : activeTab === 'history' ? (
            <ReadingHistory />
          ) : (
            <TarotIntegration language={language} />
          )}
        </main>
      </AppContainer>
    );
  }

  if (!isReady || !isInitialized) {
    let loadingMessage = '正在初始化 Telegram Mini App...';
    if (isReady && isTelegramEnvironment && (!user || !user.id)) {
      loadingMessage = '正在获取用户信息...';
    } else if (isReady) {
      loadingMessage = '正在加载用户设置...';
    }
    
    return (
      <LoadingContainer>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔮</div>
        <LoadingSpinner />
        <LoadingText>
          {loadingMessage}
        </LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <AppContainer>
      <GlobalStyle />
      <Header>
        <Logo>
          <span>🔮</span>
          <span>Tarot Stars</span>
        </Logo>
        <HeaderControls>
          <LanguageToggle />
        </HeaderControls>
      </Header>
      <main>
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={language}
        />
        {activeTab === 'daily' ? (
          <DailyTarot tarotService={tarotService} />
        ) : activeTab === 'history' ? (
          <ReadingHistory />
        ) : (
          <TarotIntegration language={language} />
        )}
      </main>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;