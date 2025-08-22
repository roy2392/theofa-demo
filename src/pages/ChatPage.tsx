import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ChatContainer } from '../components/ChatContainer';
import { useChat } from '../hooks/useChat';
import { DynamicScenarios } from '../services/dynamicScenarios';
import { TravelScenario } from '../types';

export const ChatPage: React.FC = () => {
  const { scenario } = useParams<{ scenario: string }>();
  
  const scenarioConfig = scenario ? DynamicScenarios.getScenarioConfig(scenario) : null;
  
  if (!scenario || !scenarioConfig) {
    return <Navigate to="/" replace />;
  }

  const { messages, isTyping, sendMessage } = useChat(scenario as TravelScenario);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <ChatContainer
        messages={messages}
        onSendMessage={sendMessage}
        isTyping={isTyping}
        title={`${scenarioConfig.icon} ${scenarioConfig.title}`}
        subtitle="עוזר AI מקצועי • מופעל על ידי GPT-5"
      />

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
          <span>🤖</span>
          <span>מופעל על ידי בינה מלאכותית GPT-5</span>
          <span>•</span>
          <span>קישרי תעופה © 2024</span>
        </div>
      </div>
    </div>
  );
};