import { useRef, useEffect, useState } from 'react';
import { Menu, BarChart3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { ChatBubble } from '@/components/ChatBubble';
import { SimilaritySlider } from '@/components/SimilaritySlider';
import { Composer } from '@/components/Composer';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { askQuestion } from '@/services/api';
import { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';

export default function Chat() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { messages, setMessages, threshold, setThreshold, addMessage, replaceLoadingWithMessage, clearMessages, updateSessionStats } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    addMessage(loadingMessage);

    try {
      const response = await askQuestion(content, threshold);
      
      const assistantMessage: Message = {
        id: `${Date.now()}-response`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        meta: response.meta,
      };

      replaceLoadingWithMessage(assistantMessage);
      updateSessionStats(assistantMessage);
    } catch (error) {
      console.error('Error asking question:', error);
      
      let errorMessage = 'Failed to get response. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorMsg: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        error: errorMessage,
      };
      replaceLoadingWithMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <header className="glass-card-strong border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Vector Semantic Cache
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              aria-label="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/observability')}
            aria-label="Go to observability"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Connection Banner */}
      {!isOnline && (
        <div className="px-4 py-2">
          <ConnectionBanner />
        </div>
      )}

      {/* Chat Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Ask anything</h2>
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed font-light tracking-wide">
                Experience instant AI responses powered by semantic caching. 
                Similar questions return cached answers in milliseconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map(message => (
              <ChatBubble
                key={message.id}
                message={message}
                onRetry={message.error ? handleRetry : undefined}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Similarity Slider */}
      <div className="px-4 pb-2">
        <div className="max-w-3xl mx-auto">
          <SimilaritySlider value={threshold} onChange={setThreshold} />
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <Composer
            onSend={handleSend}
            disabled={isLoading}
            isOffline={!isOnline}
          />
        </div>
      </div>
    </div>
  );
}