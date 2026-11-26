import React from 'react';
import styled from 'styled-components';
import { LocalizedTarotCard, SupportedLanguage } from '../../domain/entities/TarotCard';
import { getTelegramThemeColor, hapticFeedback } from '../../infrastructure/telegram/useTelegramWebApp';

interface TarotCardProps {
  card: LocalizedTarotCard;
  language: SupportedLanguage;
  showDetails?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const CardContainer = styled.div<{ size: 'small' | 'medium' | 'large'; clickable: boolean }>`
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  width: ${props => {
    switch (props.size) {
      case 'small': return '120px';
      case 'medium': return '200px';
      case 'large': return '280px';
      default: return '200px';
    }
  }};
  
  &:hover {
    transform: ${props => props.clickable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.clickable ? '0 6px 16px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  }
`;

const CardImage = styled.div<{ size: 'small' | 'medium' | 'large'; isReversed?: boolean }>`
  width: 100%;
  height: ${props => {
    switch (props.size) {
      case 'small': return '180px';
      case 'medium': return '300px';
      case 'large': return '420px';
      default: return '300px';
    }
  }};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
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

const CardSymbol = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  color: white;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'medium': return '36px';
      case 'large': return '48px';
      default: return '36px';
    }
  }};
  font-weight: bold;
  text-align: center;
  z-index: 1;
`;

const CardContent = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px';
      case 'medium': return '16px';
      case 'large': return '20px';
      default: return '16px';
    }
  }};
`;

const CardName = styled.h3<{ size: 'small' | 'medium' | 'large' }>`
  margin: 0 0 8px 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '14px';
      case 'medium': return '18px';
      case 'large': return '22px';
      default: return '18px';
    }
  }};
  font-weight: 600;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  text-align: center;
`;

const CardDescription = styled.p<{ size: 'small' | 'medium' | 'large' }>`
  margin: 0 0 12px 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '11px';
      case 'medium': return '13px';
      case 'large': return '15px';
      default: return '13px';
    }
  }};
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
  text-align: center;
  line-height: 1.4;
`;

const Keywords = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-bottom: ${props => props.size === 'small' ? '8px' : '12px'};
`;

const Keyword = styled.span<{ size: 'small' | 'medium' | 'large' }>`
  background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  color: ${() => getTelegramThemeColor('button_text_color', '#ffffff')};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '2px 6px';
      case 'medium': return '4px 8px';
      case 'large': return '6px 10px';
      default: return '4px 8px';
    }
  }};
  border-radius: 12px;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '10px';
      case 'medium': return '11px';
      case 'large': return '12px';
      default: return '11px';
    }
  }};
  font-weight: 500;
`;

const MeaningSection = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  margin-top: ${props => props.size === 'small' ? '8px' : '12px'};
  padding-top: ${props => props.size === 'small' ? '8px' : '12px'};
  border-top: 1px solid ${() => getTelegramThemeColor('hint_color', '#e0e0e0')};
`;

const MeaningTitle = styled.h4<{ size: 'small' | 'medium' | 'large' }>`
  margin: 0 0 6px 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 600;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
`;

const MeaningText = styled.p<{ size: 'small' | 'medium' | 'large' }>`
  margin: 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '11px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  line-height: 1.5;
`;

const ReversedIndicator = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  position: absolute;
  top: ${props => props.size === 'small' ? '4px' : '8px'};
  right: ${props => props.size === 'small' ? '4px' : '8px'};
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: ${props => props.size === 'small' ? '2px 4px' : '4px 6px'};
  border-radius: 4px;
  font-size: ${props => props.size === 'small' ? '8px' : '10px'};
  font-weight: bold;
`;

const getCardSymbol = (card: LocalizedTarotCard): string => {
  const categoryName = card.category?.name || '';
  const suitName = card.suit?.name || '';
  
  if (categoryName.includes('大阿卡纳') || categoryName.includes('Major')) return '✨';
  if (suitName.includes('圣杯') || suitName.includes('Cups')) return '🏆';
  if (suitName.includes('权杖') || suitName.includes('Wands')) return '🔥';
  if (suitName.includes('宝剑') || suitName.includes('Swords')) return '⚔️';
  if (suitName.includes('星币') || suitName.includes('Pentacles')) return '💰';
  return '🔮';
};

export const TarotCard: React.FC<TarotCardProps> = ({ 
  card, 
  language, 
  showDetails = false, 
  onClick,
  size = 'medium'
}) => {
  const handleClick = () => {
    if (onClick) {
      hapticFeedback('light');
      onClick();
    }
  };

  const displayName = card.name;
  const displayDescription = card.description;
  
  // 处理 keywords 字段
  let displayKeywords: string[] = [];
  
  try {
    if (card.keywords && typeof card.keywords === 'object') {
      // 新的对象格式 {upright: string[], reversed: string[]}
      if (card.isReversed && Array.isArray(card.keywords.reversed)) {
        displayKeywords = card.keywords.reversed;
      } else if (Array.isArray(card.keywords.upright)) {
        displayKeywords = card.keywords.upright;
      }
    }
  } catch (error) {
    console.warn('Error processing keywords:', error);
    displayKeywords = [];
  }
  
  // 处理 meaning 字段
  let displayMeaning = '';
  
  try {
    if (typeof card.meaning === 'object') {
      displayMeaning = card.isReversed ? card.meaning.reversed : card.meaning.upright;
    }
  } catch (error) {
    console.warn('Error processing meaning:', error);
    displayMeaning = '';
  }

  return (
    <CardContainer 
      size={size}
      clickable={!!onClick}
      onClick={handleClick}
    >
      <CardImage size={size} isReversed={card.isReversed}>
        {card.isReversed && (
          <ReversedIndicator size={size}>
            {language === 'en' ? 'REV' : '逆位'}
          </ReversedIndicator>
        )}
        <CardSymbol size={size}>
          {getCardSymbol(card)}
        </CardSymbol>
      </CardImage>
      
      <CardContent size={size}>
        <CardName size={size}>{displayName}</CardName>
        
        {showDetails && (
          <>
            <CardDescription size={size}>{displayDescription}</CardDescription>
            
            <Keywords size={size}>
              {displayKeywords.slice(0, size === 'small' ? 2 : 4).map((keyword, index) => (
                <Keyword key={index} size={size}>{keyword}</Keyword>
              ))}
            </Keywords>
            
            <MeaningSection size={size}>
              <MeaningTitle size={size}>
                {card.isReversed 
                  ? (language === 'en' ? 'Reversed Meaning' : '逆位含义')
                  : (language === 'en' ? 'Upright Meaning' : '正位含义')
                }
              </MeaningTitle>
              <MeaningText size={size}>{displayMeaning}</MeaningText>
            </MeaningSection>
          </>
        )}
      </CardContent>
    </CardContainer>
  );
};