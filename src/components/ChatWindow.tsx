import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: Array<{
    id: string;
    content: string;
    source: string;
    chapter?: string;
    lesson?: string;
  }>;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, initialContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextText, setContextText] = useState(initialContext || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add initial context message if provided
  useEffect(() => {
    if (initialContext) {
      setMessages([{
        id: 'context-' + Date.now(),
        content: `You asked about: "${initialContext}"`,
        role: 'assistant',
        timestamp: new Date(),
      }]);
    }
  }, [initialContext]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Construct the API URL - using local backend
      const backendUrl = 'http://localhost:8000';
      const apiUrl = `${backendUrl}/api/rag/query`;

      console.log('Making request to:', apiUrl);
      console.log('Request payload:', {
        query: inputValue,
        context: contextText || "",
      });

      // Detect language to send appropriate parameter
      const detectLanguage = (text: string): string => {
        // Simple heuristic to detect if text contains Urdu characters
        const urduPattern = /[\u0600-\u06FF]/;
        return urduPattern.test(text) ? 'ur' : 'en';
      };

      // Call backend API with timeout using a more reliable timeout mechanism
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );

      const responsePromise = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          context: contextText || "",
          language: detectLanguage(inputValue) // Detect language and send parameter
        })
      });

      // Race the API call with timeout
      const response = await Promise.race([responsePromise, timeoutPromise]) as Response;

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        content: data.response || "I received your message, but couldn't generate a response. The backend may not be available.",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);

      // Determine error message based on error type
      let errorMessageText = 'Sorry, I encountered an error processing your request. Please try again.';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (error.message.includes('Failed to fetch')) {
          errorMessageText = 'Unable to connect to the AI service. The backend server may not be running.';
        } else {
          errorMessageText = 'Network error occurred. Please check your connection.';
        }
      } else if (error.message?.includes('timeout')) {
        errorMessageText = 'Request timed out. The AI service may be slow to respond.';
      } else if (error instanceof Error) {
        errorMessageText = `Error: ${error.message}`;
      }

      // Add error message
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        content: errorMessageText,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setContextText('');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/img/profile-pic.png"
              alt="Profile"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <h3>Physical AI Assistant</h3>
              <p>Ask about the textbook content</p>
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className="chat-clear-btn"
            onClick={clearChat}
            title="Clear chat"
            disabled={messages.length === 0}
          >
            Clear
          </button>
          <button
            className="chat-close-btn"
            onClick={onClose}
            title="Close chat"
          >
            ×
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h4>Hello! I'm your Physical AI & Humanoid Robotics assistant.</h4>
            <p>Ask me anything about the textbook content, and I'll help you find relevant information.</p>
            {contextText && (
              <div className="chat-context-preview">
                <p><strong>Context:</strong> {contextText.substring(0, 100)}{contextText.length > 100 ? '...' : ''}</p>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}-message`}>
            <div className="message-content">
              {message.content}
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="message-sources">
                <h5>Sources:</h5>
                <ul>
                  {message.sources.map((source, idx) => (
                    <li key={idx}>{source.content.substring(0, 100)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        {contextText && (
          <div className="chat-context-bar">
            <span>Context: {contextText.substring(0, 50)}{contextText.length > 50 ? '...' : ''}</span>
            <button
              type="button"
              onClick={() => setContextText('')}
              className="remove-context-btn"
            >
              Remove
            </button>
          </div>
        )}
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Physical AI & Humanoid Robotics..."
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;