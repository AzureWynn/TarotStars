import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState, AppDispatch } from '../../infrastructure/store';
import { fetchReadingHistory, clearError } from '../../infrastructure/store/tarotSlice';
import { useTelegramWebApp, getTelegramThemeColor, hapticFeedback } from '../../infrastructure/telegram/useTelegramWebApp';
// TarotCard component import removed as it's not used in this file
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
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

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HistoryItem = styled.div`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CardName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
`;

const CardPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CardImage = styled.div`
  width: 60px;
  height: 90px;
  background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardType = styled.div`
  font-size: 14px;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
  margin-bottom: 4px;
`;

const CardMeaning = styled.div`
  font-size: 12px;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
`;

const InterpretationPreview = styled.p`
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  color: ${() => getTelegramThemeColor('button_text_color', '#ffffff')};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 20px auto 0;
  display: block;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ReadingHistoryProps {
  onReadingSelect?: (reading: DailyReading) => void;
}

export const ReadingHistory: React.FC<ReadingHistoryProps> = ({ onReadingSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { recentReadings, loading, error, language } = useSelector((state: RootState) => state.tarot);
  const { user, isReady } = useTelegramWebApp();

  // 检测是否在Telegram环境中
  const isTelegramEnvironment = useMemo(() => {
    return !!(window as any).Telegram?.WebApp;
  }, []);

  useEffect(() => {
    const fetchHistory = () => {
      if (!isReady) {
        console.log('Telegram WebApp not ready yet');
        return;
      }
      
      // 在Telegram环境中，等待用户数据
      if (isTelegramEnvironment && (!user || !user.id)) {
        console.log('Waiting for Telegram user data', { hasUser: !!user, userId: user?.id });
        return;
      }
      
      // 只在Telegram环境中获取数据
      if (isTelegramEnvironment && user?.id) {
        const userId = user.id.toString();
        console.log('Fetching reading history for user:', userId, 'language:', language);
        dispatch(fetchReadingHistory(userId));
      }
    };
    
    fetchHistory();
  }, [dispatch, isReady, user?.id, isTelegramEnvironment, language]);

  const handleRefresh = () => {
    hapticFeedback('light');
    dispatch(clearError());
    // 只在Telegram环境中且有用户数据时刷新
    if (isTelegramEnvironment && user?.id) {
      const userId = user.id.toString();
      console.log('Refreshing reading history for user:', userId);
      dispatch(fetchReadingHistory(userId));
    }
  };

  const handleReadingClick = (reading: DailyReading) => {
    hapticFeedback('light');
    if (onReadingSelect) {
      onReadingSelect(reading);
    }
  };

  const formatDate = (timestamp: number) => { // 毫秒级时间戳
    const date = new Date(timestamp);
    return language === 'en' 
      ? date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      : date.toLocaleDateString('zh-CN', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
  };

  const getCardEmoji = (cardName: string) => {
    // 根据卡片名称返回相应的emoji
    if (cardName.includes('愚者') || cardName.includes('Fool')) return '🃏';
    if (cardName.includes('魔术师') || cardName.includes('Magician')) return '🎩';
    if (cardName.includes('女祭司') || cardName.includes('Priestess')) return '🔮';
    if (cardName.includes('皇后') || cardName.includes('Empress')) return '👑';
    if (cardName.includes('皇帝') || cardName.includes('Emperor')) return '⚔️';
    if (cardName.includes('教皇') || cardName.includes('Hierophant')) return '⛪';
    if (cardName.includes('恋人') || cardName.includes('Lovers')) return '💕';
    if (cardName.includes('战车') || cardName.includes('Chariot')) return '🏇';
    if (cardName.includes('力量') || cardName.includes('Strength')) return '🦁';
    if (cardName.includes('隐士') || cardName.includes('Hermit')) return '🏮';
    if (cardName.includes('命运') || cardName.includes('Fortune')) return '🎡';
    if (cardName.includes('正义') || cardName.includes('Justice')) return '⚖️';
    if (cardName.includes('倒吊人') || cardName.includes('Hanged')) return '🙃';
    if (cardName.includes('死神') || cardName.includes('Death')) return '💀';
    if (cardName.includes('节制') || cardName.includes('Temperance')) return '🍷';
    if (cardName.includes('恶魔') || cardName.includes('Devil')) return '😈';
    if (cardName.includes('塔') || cardName.includes('Tower')) return '🗼';
    if (cardName.includes('星星') || cardName.includes('Star')) return '⭐';
    if (cardName.includes('月亮') || cardName.includes('Moon')) return '🌙';
    if (cardName.includes('太阳') || cardName.includes('Sun')) return '☀️';
    if (cardName.includes('审判') || cardName.includes('Judgement')) return '📯';
    if (cardName.includes('世界') || cardName.includes('World')) return '🌍';
    return '🔮'; // 默认emoji
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
          <Title>{language === 'en' ? 'Reading History' : '占卜历史'}</Title>
          <Subtitle>
            {language === 'en' 
              ? 'Review your past tarot readings and insights'
              : '回顾你的塔罗占卜历史和洞察'
            }
          </Subtitle>
        </Header>

        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
          <h3 style={{ marginBottom: '16px', color: getTelegramThemeColor('text_color', '#000000') }}>
            {language === 'en' ? 'Demo Mode' : '演示模式'}
          </h3>
          <p style={{ color: getTelegramThemeColor('hint_color', '#666666'), lineHeight: '1.6' }}>
            {language === 'en' 
              ? <>Your reading history will be available when you use the <a 
                  href="https://t.me/tarot_stars_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: getTelegramThemeColor('link_color', '#2481cc'), 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >Telegram Mini App</a>.</>
              : <>当你使用<a 
                  href="https://t.me/tarot_stars_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: getTelegramThemeColor('link_color', '#2481cc'), 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >Telegram小程序</a>时，你的占卜历史将在这里显示。</>
            }
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{language === 'en' ? 'Reading History' : '占卜历史'}</Title>
        <Subtitle>
          {language === 'en' 
            ? 'Review your past tarot readings and insights'
            : '回顾你的塔罗占卜历史和洞察'
          }
        </Subtitle>
      </Header>

      {loading && (
        <LoadingSpinner 
          message={language === 'en' ? 'Loading your reading history...' : '正在加载你的占卜历史...'} 
        />
      )}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
          language={language}
        />
      )}

      {!loading && !error && (!recentReadings || recentReadings.length === 0) && (
        <EmptyState>
          <EmptyIcon>🔮</EmptyIcon>
          <EmptyText>
            {language === 'en' 
              ? 'No readings yet. Start your tarot journey!'
              : '还没有记录。开始你的塔罗之旅吧！'
            }
          </EmptyText>
        </EmptyState>
      )}

      {!loading && !error && recentReadings && recentReadings.length > 0 && (
        <HistoryList>
          {recentReadings.map((reading) => (
            reading.card && (
              <HistoryItem 
                key={reading.id} 
                onClick={() => handleReadingClick(reading)}
              >
                <ItemHeader>
                  <CardName>
                    {reading.card.name}
                    {reading.isReversed && (
                      <span style={{ color: getTelegramThemeColor('hint_color', '#666666'), fontSize: '14px', marginLeft: '8px' }}>
                        {language === 'en' ? '(Reversed)' : '(逆位)'}
                      </span>
                    )}
                  </CardName>
                  <DateText>{formatDate(typeof reading.date === 'string' ? new Date(reading.date).getTime() : reading.date)}</DateText>
                </ItemHeader>
                
                <CardPreview>
                  <CardImage>
                    {getCardEmoji(reading.card.name)}
                  </CardImage>
                  <CardInfo>
                    <CardType>
                      {reading.card.category?.name === '大阿卡纳' ? (language === 'en' ? 'Major Arcana' : '大阿卡纳') : (language === 'en' ? 'Minor Arcana' : '小阿卡纳')}
                    </CardType>
                    <CardMeaning>
                      {reading.isReversed 
                        ? reading.card.meaning.reversed 
                        : reading.card.meaning.upright
                      }
                    </CardMeaning>
                  </CardInfo>
                </CardPreview>
                
                <InterpretationPreview>
                  {reading.interpretation}
                </InterpretationPreview>
              </HistoryItem>
            )
          ))}
        </HistoryList>
      )}

      <RefreshButton 
        onClick={handleRefresh}
        disabled={loading}
      >
        {language === 'en' ? 'Refresh' : '刷新'}
      </RefreshButton>
    </Container>
  );
};