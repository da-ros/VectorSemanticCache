import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/types';

interface SessionStats {
  totalQueries: number;
  totalHits: number;
  totalSavedLatency: number;
  recentHits: Array<{
    query: string;
    threshold: number;
    score: number;
    savedLatency: number;
    timestamp: number;
  }>;
}

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  replaceLoadingWithMessage: (newMessage: Message) => void;
  clearMessages: () => void;
  threshold: number;
  setThreshold: (threshold: number) => void;
  sessionStats: SessionStats;
  updateSessionStats: (message: Message) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threshold, setThreshold] = useState(0.70);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalQueries: 0,
    totalHits: 0,
    totalSavedLatency: 0,
    recentHits: []
  });

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    const savedThreshold = localStorage.getItem('chat-threshold');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load saved messages:', error);
      }
    }
    
    if (savedThreshold) {
      setThreshold(parseFloat(savedThreshold));
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Saving messages to localStorage:', messages.length, 'messages');
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save threshold to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chat-threshold', threshold.toString());
  }, [threshold]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const replaceLoadingWithMessage = (newMessage: Message) => {
    console.log('Replacing loading message with:', newMessage);
    setMessages(prev => [...prev.filter(m => !m.isLoading), newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chat-messages');
    // Reset session stats when clearing messages
    setSessionStats({
      totalQueries: 0,
      totalHits: 0,
      totalSavedLatency: 0,
      recentHits: []
    });
  };

  const updateSessionStats = (message: Message) => {
    if (message.role === 'assistant' && message.meta) {
      setSessionStats(prev => {
        const newStats = { ...prev };
        
        // Count as a query
        newStats.totalQueries += 1;
        
        if (message.meta?.hit) {
          // Count as a hit
          newStats.totalHits += 1;
          
          // Add saved latency
          if (message.meta.savedLatency) {
            newStats.totalSavedLatency += message.meta.savedLatency;
          }
          
          // Add to recent hits (keep only last 10)
          const recentHit = {
            query: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
            threshold: threshold,
            score: message.meta.score || 0,
            savedLatency: message.meta.savedLatency || 0,
            timestamp: message.timestamp.getTime() / 1000 // Convert to Unix timestamp
          };
          
          newStats.recentHits = [recentHit, ...newStats.recentHits].slice(0, 10);
        }
        
        return newStats;
      });
    }
  };

  const value: ChatContextType = {
    messages,
    setMessages,
    addMessage,
    replaceLoadingWithMessage,
    clearMessages,
    threshold,
    setThreshold,
    sessionStats,
    updateSessionStats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
