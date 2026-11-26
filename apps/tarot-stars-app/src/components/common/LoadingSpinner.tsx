import React from 'react';
import styled, { keyframes } from 'styled-components';
import { getTelegramThemeColor } from '../../infrastructure/telegram/useTelegramWebApp';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const Spinner = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  width: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'medium': return '40px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'medium': return '40px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  border: ${props => {
    switch (props.size) {
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  }} solid ${() => getTelegramThemeColor('hint_color', '#e0e0e0')};
  border-top: ${props => {
    switch (props.size) {
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  }} solid ${() => getTelegramThemeColor('button_color', '#2481cc')};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

const Message = styled.p<{ size: 'small' | 'medium' | 'large' }>`
  margin: 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  color: ${() => getTelegramThemeColor('hint_color', '#666666')};
  font-weight: 500;
`;

const MysticSymbols = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '16px';
      case 'medium': return '24px';
      case 'large': return '32px';
      default: return '24px';
    }
  }};
  margin-bottom: 12px;
  opacity: 0.7;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  return (
    <Container>
      <MysticSymbols size={size}>🔮✨🌙</MysticSymbols>
      <Spinner size={size} />
      <Message size={size}>{message}</Message>
    </Container>
  );
};