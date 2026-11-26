import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState, AppDispatch } from '../../infrastructure/store';
import { changeLanguage } from '../../infrastructure/store/tarotSlice';
import { getTelegramThemeColor, hapticFeedback, useTelegramWebApp } from '../../infrastructure/telegram/useTelegramWebApp';
import { SupportedLanguage } from '../../domain/entities/TarotCard';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active 
    ? getTelegramThemeColor('button_color', '#2481cc')
    : 'transparent'
  };
  color: ${props => props.$active 
    ? getTelegramThemeColor('button_text_color', '#ffffff')
    : getTelegramThemeColor('text_color', '#000000')
  };
  border: 1px solid ${() => getTelegramThemeColor('button_color', '#2481cc')};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
  margin-right: 4px;
`;

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  // { code: 'ja', label: '日本', flag: '🇯🇵' },
  // { code: 'ko', label: '한국', flag: '🇰🇷' }
];

export const LanguageToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { language } = useSelector((state: RootState) => state.tarot);
  const { user } = useTelegramWebApp();

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    if (newLanguage !== language) {
      hapticFeedback('light');
      dispatch(changeLanguage({ 
        language: newLanguage, 
        telegramUserId: user?.id 
      }));
    }
  };

  return (
    <ToggleContainer>
      <Label>🌐</Label>
      {languageOptions.map((option) => (
        <ToggleButton 
          key={option.code}
          $active={language === option.code}
          onClick={() => handleLanguageChange(option.code)}
          title={`${option.flag} ${option.label}`}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleContainer>
  );
};