import React from 'react';
import styled from 'styled-components';

const GuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 400;
  opacity: 0.9;
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
  opacity: 0.8;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 500px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
`;

const StepText = styled.div`
  flex: 1;
  text-align: left;
`;

const BotButton = styled.a`
  display: inline-block;
  padding: 1rem 2rem;
  background: #0088cc;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
  
  &:hover {
    background: #006699;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 136, 204, 0.4);
  }
`;

const TelegramIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

interface TelegramGuideProps {
  botUsername?: string;
}

const TelegramGuide: React.FC<TelegramGuideProps> = ({ botUsername = 'your_bot' }) => {
  const botUrl = `https://t.me/${botUsername}`;

  return (
    <GuideContainer>
      <TelegramIcon>📱</TelegramIcon>
      <Title>塔罗星辰</Title>
      <Subtitle>请通过 Telegram 使用</Subtitle>
      <Description>
        这是一个 Telegram Mini App，需要在 Telegram 中打开才能正常使用。
        请按照以下步骤访问应用：
      </Description>
      
      <StepsContainer>
        <Step>
          <StepNumber>1</StepNumber>
          <StepText>打开 Telegram 应用</StepText>
        </Step>
        <Step>
          <StepNumber>2</StepNumber>
          <StepText>搜索并打开我们的机器人</StepText>
        </Step>
        <Step>
          <StepNumber>3</StepNumber>
          <StepText>点击菜单按钮启动 Mini App</StepText>
        </Step>
      </StepsContainer>
      
      <BotButton href={botUrl} target="_blank" rel="noopener noreferrer">
        🚀 打开 Telegram Bot
      </BotButton>
    </GuideContainer>
  );
};

export default TelegramGuide;