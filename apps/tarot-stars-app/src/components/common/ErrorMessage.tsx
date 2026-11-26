import React from 'react';
import styled from 'styled-components';
import { getTelegramThemeColor, hapticFeedback } from '../../infrastructure/telegram/useTelegramWebApp';
import { SupportedLanguage } from '../../domain/entities/TarotCard';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  language?: SupportedLanguage;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
  background: ${() => getTelegramThemeColor('bg_color', '#ffffff')};
  border-radius: 12px;
  margin: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #e74c3c;
`;

const ErrorText = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: ${() => getTelegramThemeColor('text_color', '#000000')};
  line-height: 1.5;
  max-width: 300px;
`;

const RetryButton = styled.button`
  background: ${() => getTelegramThemeColor('button_color', '#2481cc')};
  color: ${() => getTelegramThemeColor('button_text_color', '#ffffff')};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const getErrorMessages = (language: SupportedLanguage) => {
  const messages = {
    zh: {
      title: '哎呀！出了点问题',
      retry: '重试',
      defaultMessage: '遇到了意外错误，请重试。'
    },
    en: {
      title: 'Oops! Something went wrong',
      retry: 'Try Again',
      defaultMessage: 'We encountered an unexpected error. Please try again.'
    },
    ja: {
      title: 'おっと！何か問題が発生しました',
      retry: '再試行',
      defaultMessage: '予期しないエラーが発生しました。もう一度お試しください。'
    },
    ko: {
      title: '앗! 문제가 발생했습니다',
      retry: '다시 시도',
      defaultMessage: '예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.'
    }
  };
  return messages[language] || messages.zh;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  language = 'zh' 
}) => {
  const messages = getErrorMessages(language);
  
  const handleRetry = () => {
    if (onRetry) {
      hapticFeedback('light');
      onRetry();
    }
  };

  return (
    <Container>
      <ErrorIcon>🔮💫</ErrorIcon>
      <ErrorTitle>{messages.title}</ErrorTitle>
      <ErrorText>
        {message || messages.defaultMessage}
      </ErrorText>
      {onRetry && (
        <RetryButton onClick={handleRetry}>
          {messages.retry}
        </RetryButton>
      )}
    </Container>
  );
};