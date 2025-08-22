import { useState, useCallback, useEffect } from 'react';
import { Message, TravelScenario } from '../types';
import { openAiService, ChatMessage } from '../services/openai';
import { DynamicScenarios } from '../services/dynamicScenarios';

export const useChat = (scenario: TravelScenario) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const scenarioConfig = DynamicScenarios.getScenarioConfig(scenario);
    return [{
      id: '1',
      content: scenarioConfig?.initialMessage || 'שלום! איך אוכל לעזור לך?',
      sender: 'ai',
      timestamp: new Date(),
    }];
  });
  
  const [isTyping, setIsTyping] = useState(false);

  // Initialize conversation manager when hook is created
  useEffect(() => {
    openAiService.initializeConversation(scenario);
  }, [scenario]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const scenarioConfig = DynamicScenarios.getScenarioConfig(scenario);
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: scenarioConfig?.systemPrompt || 'You are a helpful travel assistant.'
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user',
          content
        }
      ];

      const response = await openAiService.sendMessage(chatMessages, scenario, content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'מצטער, אירעה שגיאה. אנא נסה שוב.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, scenario]);

  return {
    messages,
    isTyping,
    sendMessage,
  };
};