import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { TarotApplicationServiceImpl } from '../../application/services/TarotApplicationService';
import { DailyReading, SupportedLanguage } from '../../domain/entities/TarotCard';
import { getTelegramThemeColor, hapticFeedback, useTelegramWebApp } from '../../infrastructure/telegram/useTelegramWebApp';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: ${() => getTelegramThemeColor('secondary_bg_color', '#f8f9fa')};
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin: 0;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const NewCardDisplay = styled.div`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const CardImage = styled.div<{ isReversed?: boolean }>`
  width: 200px;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  transform: ${props => props.isReversed ? 'rotate(180deg)' : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
  }
`;

const CardSymbol = styled.div`
  color: white;
  font-size: 48px;
  font-weight: bold;
  z-index: 1;
`;

const CardName = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const CardDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
`;

const InterpretationCard = styled.div`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const InterpretationTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const InterpretationText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const DrawButton = styled.button`
  background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  color: ${() => getTelegramThemeColor('button_text_color', '#ffffff')};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 20px;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  text-align: center;
  border-left: 4px solid ${() => getTelegramThemeColor('link_color', '#2481cc')};
  font-size: 14px;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

interface TarotIntegrationProps {
  language: SupportedLanguage;
}

export const TarotIntegration: React.FC<TarotIntegrationProps> = ({ language }) => {
  const { isTelegramEnvironment, user, isReady } = useTelegramWebApp();
  const [appService] = useState(() => new TarotApplicationServiceImpl());
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getLocalizedTexts = (language: SupportedLanguage) => {
    const texts = {
      zh: {
        title: '新版塔罗占卜',
        subtitle: '体验全新的多语言塔罗系统',
        drawCard: '抽取今日塔罗牌',
        interpretation: '牌面解读',
        loading: '正在抽取塔罗牌...',
        existingReading: '您今日已抽取过塔罗牌',
        position: {
          upright: '正位',
          reversed: '逆位'
        }
      },
      en: {
        title: 'New Tarot Reading',
        subtitle: 'Experience the new multilingual tarot system',
        drawCard: 'Draw Today\'s Tarot Card',
        interpretation: 'Card Interpretation',
        loading: 'Drawing tarot card...',
        existingReading: 'You have already drawn a card today',
        position: {
          upright: 'Upright',
          reversed: 'Reversed'
        }
      },
      ja: {
        title: '新しいタロット占い',
        subtitle: '新しい多言語タロットシステムを体験',
        drawCard: '今日のタロットカードを引く',
        interpretation: 'カード解釈',
        loading: 'タロットカードを引いています...',
        existingReading: '今日はすでにカードを引いています',
        position: {
          upright: '正位置',
          reversed: '逆位置'
        }
      },
      ko: {
        title: '새로운 타로 점술',
        subtitle: '새로운 다국어 타로 시스템을 경험하세요',
        drawCard: '오늘의 타로 카드 뽑기',
        interpretation: '카드 해석',
        loading: '타로 카드를 뽑고 있습니다...',
        existingReading: '오늘 이미 카드를 뽑으셨습니다',
        position: {
          upright: '정위치',
          reversed: '역위치'
        }
      }
    };
    return texts[language] || texts.zh;
  };

  const texts = getLocalizedTexts(language);

  useEffect(() => {
    const initializeUser = async () => {
      // 如果不在Telegram环境中，直接标记为已初始化，不进行API调用
      if (!isTelegramEnvironment) {
        console.log('TarotIntegration: Not in Telegram environment, skipping user initialization');
        setIsInitialized(true);
        return;
      }
      
      // 如果在Telegram环境但还没准备好或用户数据不存在，等待
       if (!isReady || !user || !user.id) {
         console.log('TarotIntegration: Waiting for Telegram data...', { 
           isReady, 
           hasUser: !!user, 
           hasUserId: !!user?.id,
           telegramWebApp: !!(window as any).Telegram?.WebApp,
           initDataUnsafe: (window as any).Telegram?.WebApp?.initDataUnsafe
         });
         return;
       }
      
      try {
        setLoading(true);
        await appService.initializeUser(language);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [appService, language, isTelegramEnvironment, isReady, user]);

  const loadDailyReading = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reading = await appService.getDailyReading(language);
      setDailyReading(reading);
    } catch (error) {
      console.error('Failed to load daily reading:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reading');
    } finally {
      setLoading(false);
    }
  }, [appService, language]);

  useEffect(() => {
    if (isInitialized) {
      loadDailyReading();
    }
  }, [language, isInitialized, loadDailyReading]);

  const handleDrawCard = async () => {
    hapticFeedback('medium');
    await loadDailyReading();
  };

  const handleRetry = () => {
    setError(null);
    loadDailyReading();
  };

  if (!isReady && isTelegramEnvironment) {
    return (
      <Container>
        <LoadingSpinner message={language === 'en' ? 'Initializing...' : '正在初始化...'} />
      </Container>
    );
  }

  // 在非Telegram环境中显示演示内容
  if (!isTelegramEnvironment) {
    return (
      <Container>
        <Header>
          <Title>{language === 'en' ? 'Tarot Reading' : '塔罗占卜'}</Title>
          <Subtitle>
            {language === 'en' 
              ? 'Discover insights through the ancient art of tarot'
              : '通过古老的塔罗艺术探索内心的洞察'
            }
          </Subtitle>
        </Header>

        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔮</div>
          <h3 style={{ marginBottom: '16px', color: getTelegramThemeColor('text_color', '#000000') }}>
            {language === 'en' ? 'Demo Mode' : '演示模式'}
          </h3>
          <p style={{ color: getTelegramThemeColor('hint_color', '#666666'), lineHeight: '1.6' }}>
            {language === 'en' 
              ? <>Interactive tarot readings are available in the <a 
                  href="https://t.me/tarot_stars_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: getTelegramThemeColor('link_color', '#2481cc'), 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >Telegram Mini App</a>.</>
              : <>互动式塔罗占卜功能在<a 
                  href="https://t.me/tarot_stars_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: getTelegramThemeColor('link_color', '#2481cc'), 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >Telegram小程序</a>中提供。</>
            }
          </p>
        </div>
      </Container>
    );
  }

  if (loading && !dailyReading) {
    return (
      <Container>
        <LoadingSpinner message={texts.loading} />
      </Container>
    );
  }

  if (error && !dailyReading) {
    return (
      <Container>
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          language={language}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{texts.title}</Title>
        <Subtitle>{texts.subtitle}</Subtitle>
      </Header>

      <CardContainer>
        {dailyReading?.isExistingReading && (
          <StatusMessage>
            {texts.existingReading}
          </StatusMessage>
        )}

        {dailyReading ? (
          <>
            <NewCardDisplay>
              <CardImage isReversed={dailyReading.isReversed}>
                <CardSymbol>🔮</CardSymbol>
              </CardImage>
              
              <CardName>
                {dailyReading.card.name}
                {dailyReading.isReversed && ` (${texts.position.reversed})`}
              </CardName>
              
              <CardDescription>
                {dailyReading.card.description}
              </CardDescription>
            </NewCardDisplay>

            <InterpretationCard>
              <InterpretationTitle>{texts.interpretation}</InterpretationTitle>
              <InterpretationText>
                {dailyReading.interpretation}
              </InterpretationText>
            </InterpretationCard>
          </>
        ) : (
          <DrawButton onClick={handleDrawCard} disabled={loading}>
            {loading ? texts.loading : texts.drawCard}
          </DrawButton>
        )}
      </CardContainer>
    </Container>
  );
};