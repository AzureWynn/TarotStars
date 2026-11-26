import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../infrastructure/store';
import { useTelegramWebApp, getTelegramThemeColor, hapticFeedback } from '../../infrastructure/telegram/useTelegramWebApp';
import { TarotCard } from '../TarotCard/TarotCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { TarotApplicationService } from '../../application/services/TarotApplicationService';
import { DailyReading } from '../../domain/entities/TarotCard';

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



const WelcomeMessage = styled.div`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${() => getTelegramThemeColor('link_color', '#2481cc')};
`;

interface DailyTarotProps {
  tarotService: TarotApplicationService;
}

export const DailyTarot: React.FC<DailyTarotProps> = ({ tarotService }) => {
  const { language } = useSelector((state: RootState) => state.tarot);
  const { user, isReady, isTelegramEnvironment } = useTelegramWebApp();
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const lastLanguageRef = useRef(language);

  useEffect(() => {
    console.log('DailyTarot useEffect triggered:', {
      isReady,
      isTelegramEnvironment,
      hasUser: !!user,
      userId: user?.id,
      userName: user?.first_name,
      hasLoaded: hasLoadedRef.current
    });
    
    const fetchDailyReading = async () => {
      if (!isReady) {
        console.log('Telegram WebApp not ready yet');
        return;
      }
      
      // 在Telegram环境中，等待用户数据
      if (isTelegramEnvironment && (!user || !user.id)) {
        console.log('Waiting for Telegram user data', { hasUser: !!user, userId: user?.id });
        return;
      }
      
      // 检查语言是否变化，如果变化则重置加载标志
      if (lastLanguageRef.current !== language) {
        console.log('Language changed from', lastLanguageRef.current, 'to', language, ', resetting load flag');
        hasLoadedRef.current = false;
        lastLanguageRef.current = language;
      }
      
      // 防止重复加载
      if (hasLoadedRef.current) {
        console.log('Daily reading already loaded, skipping');
        return;
      }
      
      // 在Telegram环境中且有用户数据时获取数据
      if (isTelegramEnvironment && user?.id) {
        console.log('Fetching daily reading for user:', user.id);
        setLoading(true);
        setError(null);
        hasLoadedRef.current = true;
        try {
          const reading = await tarotService.getDailyReading(language);
          setDailyReading(reading);
        } catch (err) {
          console.error('Error fetching daily reading:', err);
          setError(err instanceof Error ? err.message : '获取今日占卜失败，请重试');
          hasLoadedRef.current = false; // 如果失败，重置标志以允许重试
        } finally {
          setLoading(false);
        }
      }
      
      // 在非Telegram环境中，如果有用户数据也尝试获取（用于调试或特殊情况）
      if (!isTelegramEnvironment && user?.id) {
        console.log('Fetching daily reading for user in non-Telegram environment:', user.id);
        setLoading(true);
        setError(null);
        hasLoadedRef.current = true;
        try {
          const reading = await tarotService.getDailyReading(language);
          setDailyReading(reading);
        } catch (err) {
          console.error('Error fetching daily reading:', err);
          setError(err instanceof Error ? err.message : '获取今日占卜失败，请重试');
          hasLoadedRef.current = false; // 如果失败，重置标志以允许重试
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDailyReading();
  }, [tarotService, isReady, user?.id, isTelegramEnvironment, language]);

  const handleRefresh = () => {
    hapticFeedback('light');
    setError(null);
    hasLoadedRef.current = false; // 重置加载标志，允许重新加载
    // 添加一个小延迟，让用户看到刷新动作
    setTimeout(async () => {
      // 在Telegram环境中且有用户数据时刷新
      if (isTelegramEnvironment && user?.id) {
        console.log('Refreshing daily reading for user:', user.id);
        setLoading(true);
        try {
          const reading = await tarotService.getDailyReading(language);
          setDailyReading(reading);
        } catch (err) {
          console.error('Error refreshing daily reading:', err);
          setError(err instanceof Error ? err.message : '刷新今日占卜失败，请重试');
        } finally {
          setLoading(false);
        }
      }
      
      // 在非Telegram环境中，如果有用户数据也尝试刷新
      if (!isTelegramEnvironment && user?.id) {
        console.log('Refreshing daily reading for user in non-Telegram environment:', user.id);
        setLoading(true);
        try {
          const reading = await tarotService.getDailyReading(language);
          setDailyReading(reading);
        } catch (err) {
          console.error('Error refreshing daily reading:', err);
          setError(err instanceof Error ? err.message : '刷新今日占卜失败，请重试');
        } finally {
          setLoading(false);
        }
      }
    }, 300);
  };

  const formatDate = (timestamp: number) => { // 毫秒级时间戳
    const today = new Date(timestamp);
    return language === 'en' 
      ? today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : today.toLocaleDateString('zh-CN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
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
          <Title>{language === 'en' ? 'Daily Tarot' : '每日塔罗'}</Title>
          <Subtitle>
            {language === 'en' 
              ? 'Discover what the cards have in store for you today'
              : '探索今日塔罗牌为你带来的启示'
            }
          </Subtitle>
        </Header>

        <WelcomeMessage>
          {language === 'en' 
            ? <>Welcome! This is a demo version. For full features, please use the <UserName 
                as="a" 
                href="https://t.me/tarot_stars_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ cursor: 'pointer', textDecoration: 'none' }}
              >Telegram Mini App</UserName>.</>
            : <>欢迎！这是演示版本。要使用完整功能，请使用<UserName 
                as="a" 
                href="https://t.me/tarot_stars_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ cursor: 'pointer', textDecoration: 'none' }}
              >Telegram小程序</UserName>。</>
          }
        </WelcomeMessage>

        <CardContainer>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔮</div>
            <h3 style={{ marginBottom: '16px', color: getTelegramThemeColor('text_color', '#000000') }}>
              {language === 'en' ? 'Demo Mode' : '演示模式'}
            </h3>
            <p style={{ color: getTelegramThemeColor('hint_color', '#666666'), lineHeight: '1.6' }}>
              {language === 'en' 
                ? 'To get your personalized daily tarot reading, please access this app through Telegram.'
                : '要获取个性化的每日塔罗占卜，请通过Telegram访问此应用。'
              }
            </p>
          </div>
        </CardContainer>
      </Container>
    );
  }

  const rawSuit = dailyReading?.card?.suit as unknown;
  const suitName = typeof rawSuit === 'string'
    ? rawSuit
    : (rawSuit as { name?: string } | undefined)?.name;

  return (
    <Container>
      <Header>
        <Title>{language === 'en' ? 'Daily Tarot' : '每日塔罗'}</Title>
        <Subtitle>
          {language === 'en' 
            ? 'Discover what the cards have in store for you today'
            : '探索今日塔罗牌为你带来的启示'
          }
        </Subtitle>
      </Header>

      {user && (
        <WelcomeMessage>
          {language === 'en' 
            ? <>Welcome, <UserName>{user.first_name}</UserName>!</>
            : <>欢迎，<UserName>{user.first_name}</UserName>！</>
          }
        </WelcomeMessage>
      )}

      {loading && (
        <LoadingSpinner 
          message={language === 'en' ? 'Drawing your daily card...' : '正在为你抽取今日牌面...'} 
        />
      )}

      {error && (
        <ErrorMessage
          message={error.includes('获取今日占卜失败') ? '获取今日占卜出问题，请重试' : error}
          onRetry={handleRefresh}
          language={language}
        />
      )}

      {dailyReading && !loading && dailyReading.card && (
        <CardContainer>
          <TarotCard 
            card={{
              cardId: dailyReading.card.cardId,
              name: dailyReading.card.name,
              description: dailyReading.card.description,
              meaning: dailyReading.card.meaning,
              keywords: dailyReading.card.keywords,
              advice: dailyReading.card.advice ? { upright: dailyReading.card.advice, reversed: dailyReading.card.advice } : undefined,
              number: dailyReading.card.number || 0,
              arcana: dailyReading.card.category?.name === '大阿卡纳' ? 'major' : 'minor',
              suit: suitName ? {
                name: suitName as any,
                symbol: suitName
              } : undefined,
              category: {
                name: dailyReading.card.category?.name || (language === 'en' ? 'Major Arcana' : '大阿卡纳'),
                type: dailyReading.card.category?.name === '大阿卡纳' ? 'major' : 'minor'
              },
              imageUrl: dailyReading.card.images?.original,
              isReversed: dailyReading.isReversed,
              language: language
            }}
            language={language}
            showDetails={true}
          />
          
          <InterpretationCard>
            <InterpretationTitle>
              {language === 'en' ? 'Today\'s Reading' : '今日解读'}
            </InterpretationTitle>
            <InterpretationText>
              {dailyReading.interpretation}
            </InterpretationText>
          </InterpretationCard>
          
          <div style={{ textAlign: 'center', fontSize: '14px', color: getTelegramThemeColor('hint_color', '#666666') }}>
            {formatDate(typeof dailyReading.date === 'string' ? new Date(dailyReading.date).getTime() : dailyReading.date)}
          </div>
        </CardContainer>
      )}
    </Container>
  );
};