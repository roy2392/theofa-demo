import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "הקלד הודעה"
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = '40px';
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight > 40) {
      textarea.style.height = Math.min(scrollHeight, 100) + 'px';
    }
  };

  useEffect(() => {
    if (textareaRef.current && !message) {
      textareaRef.current.style.height = '40px';
    }
  }, [message]);

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <div className="chat-input-field">
          <div className="input-icons">
            <Smile size={20} className="input-icon" />
          </div>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="chat-input"
            style={{ minHeight: '40px' }}
          />
          
          <div className="input-icons">
            <Paperclip size={20} className="input-icon" />
          </div>
        </div>
        
        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="send-button"
          >
            <Send size={18} />
          </button>
        ) : (
          <button 
            className="mic-button"
            disabled={disabled}
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
};