import React from 'react';
import styled from 'styled-components';
import { getTelegramThemeColor, hapticFeedback } from '../../infrastructure/telegram/useTelegramWebApp';
import { SupportedLanguage } from '../../domain/entities/TarotCard';

const NavContainer = styled.div`
  display: flex;
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const NavButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${props => props.$active 
    ? getTelegramThemeColor('button_color', '#2481cc')
    : 'transparent'
  };
  color: ${props => props.$active 
    ? getTelegramThemeColor('button_text_color', '#ffffff')
    : getTelegramThemeColor('text_color', '#000000')
  };
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const TabIcon = styled.span`
  font-size: 16px;
`;

const TabText = styled.span`
  font-size: 14px;
`;

export type TabType = 'daily' | 'history';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: SupportedLanguage;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  language 
}) => {
  const handleTabClick = (tab: TabType) => {
    if (tab !== activeTab) {
      hapticFeedback('light');
      onTabChange(tab);
    }
  };

  const getTabLabels = (language: SupportedLanguage) => {
    const labels = {
      zh: { daily: '今日', history: '历史' },
      en: { daily: 'Daily', history: 'History' },
      ja: { daily: '今日', history: '履歴' },
      ko: { daily: '오늘', history: '기록' }
    };
    return labels[language] || labels.zh;
  };

  const tabLabels = getTabLabels(language);
  
  const tabs = [
    {
      id: 'daily' as TabType,
      icon: '🔮',
      label: tabLabels.daily,
    },
    {
      id: 'history' as TabType,
      icon: '📚',
      label: tabLabels.history,
    },
  ];

  return (
    <NavContainer>
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => handleTabClick(tab.id)}
        >
          <TabIcon>{tab.icon}</TabIcon>
          <TabText>{tab.label}</TabText>
        </NavButton>
      ))}
    </NavContainer>
  );
};