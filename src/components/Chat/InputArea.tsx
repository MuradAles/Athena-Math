/**
 * InputArea component
 * Text input for user messages with send functionality
 */

import { useState, KeyboardEvent, ChangeEvent } from 'react';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const InputArea = ({ onSendMessage, disabled = false }: InputAreaProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="input-area">
      <div className="input-area__wrapper">
        <textarea
          className="input-area__textarea"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            resize: 'none',
          }}
        />
        <button
          className="btn btn-primary input-area__button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

