import { format } from 'date-fns';
import { Copy, RefreshCw } from 'lucide-react';
import { Message } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ChatBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export function ChatBubble({ message, onRetry }: ChatBubbleProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      description: 'Copied to clipboard',
      duration: 2000,
    });
  };

  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-4">
        <div className="chat-bubble-assistant max-w-[85%]">
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="flex justify-start mb-4">
        <div className="chat-bubble-assistant max-w-[85%] border-destructive">
          <p className="text-destructive mb-2">{message.error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-smooth"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'} max-w-[85%] relative group`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        {message.meta && (
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className={message.meta.hit ? 'badge-hit' : 'badge-miss'}>
                {message.meta.hit ? 'HIT' : 'MISS'}
              </span>
              {message.meta.score && (
                <span className="text-muted-foreground">
                  Score {message.meta.score.toFixed(2)}
                </span>
              )}
              <span className="text-muted-foreground">
                Lat {message.meta.latency}ms
              </span>
            </div>
            {message.meta.model && (
              <div className="text-xs text-muted-foreground">
                Model: {message.meta.model}
              </div>
            )}
          </div>
        )}
        
        <div className={`text-xs text-muted-foreground mt-2 ${isUser ? 'text-right' : ''}`}>
          {format(message.timestamp, 'HH:mm')}
        </div>
        
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
            aria-label="Copy message"
          >
            <Copy className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}