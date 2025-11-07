/**
 * Chat interface component with input and output areas
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Message, ChatResponse } from '../../types/api';
import { sendChatMessage, APIError } from '../../services/api';

interface ChatMessage extends Message {
  id: string;
  timestamp: Date;
  emotion?: string;
  intensity?: number;
}

interface ChatInterfaceProps {
  onResponseReceived?: (response: ChatResponse) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onResponseReceived,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send request to backend
      const response = await sendChatMessage({
        message: userMessage.content,
        conversation_history: conversationHistory,
      });

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        emotion: response.emotion,
        intensity: response.intensity,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Notify parent component
      if (onResponseReceived) {
        onResponseReceived(response);
      }
    } catch (err) {
      const errorMessage =
        err instanceof APIError
          ? err.detail || err.message
          : 'Failed to send message';

      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-lg ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center text-white mt-8">
            <p className="text-lg font-semibold drop-shadow-lg">アバターに話しかけてみましょう</p>
            <p className="text-sm mt-2 drop-shadow-md">メッセージを入力してEnterキーを押してください</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              {message.emotion && (
                <p className="text-xs mt-1 opacity-70">
                  感情: {message.emotion} ({Math.round((message.intensity || 0) * 100)}%)
                </p>
              )}
              <p className="text-xs mt-1 opacity-50">
                {message.timestamp.toLocaleTimeString('ja-JP')}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-900/80 backdrop-blur-sm rounded-lg mx-4 mb-2">
          <p className="text-red-200 text-sm">エラー: {error}</p>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力... (Shift+Enterで改行)"
            disabled={isLoading}
            rows={2}
            className="flex-1 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
};
