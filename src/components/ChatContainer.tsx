import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  disabled = false,
  title = "הבוט של קישרי תעופה",
  subtitle = "מקוון"
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[80vh] max-h-[600px] chat-background rounded-lg overflow-hidden shadow-lg">
      {/* Chat Header */}
      <div className="chat-header rounded-t-lg">
        <div className="chat-header-content">
          <div className="header-avatar relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
              <img 
                src="/logo-kisheri.png" 
                alt="קישרי תעופה" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="header-info flex-1 min-w-0">
            <h3 className="text-white font-medium text-[17px] leading-[22px] truncate">{title}</h3>
            <p className="text-white/85 text-[13px] leading-[18px] mt-0.5">
              {isTyping ? (
                <span className="flex items-center gap-1">
                  מקליד
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-pulse"></span>
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                  </span>
                </span>
              ) : subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 chat-messages">
        <div className="max-w-4xl mx-auto space-y-1">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={onSendMessage}
        disabled={disabled || isTyping}
      />
    </div>
  );
};