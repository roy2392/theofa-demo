import React from 'react';
import { Message } from '../types';
import { User, Bot, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`message-container ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="message-avatar avatar-ai">
          <Bot size={12} />
        </div>
      )}
      
      <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-ai'}`}>
        <div className="message-content">
          {message.content}
          <div className="flex justify-between items-end mt-1">
            <span className="message-timestamp">
              {message.timestamp.toLocaleTimeString('he-IL', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}
            </span>
            {isUser && (
              <div className="message-status">
                <CheckCheck size={12} className="message-tick" />
              </div>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="message-avatar">
          <User size={12} />
        </div>
      )}
    </div>
  );
};