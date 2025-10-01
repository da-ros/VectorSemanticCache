import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isOffline?: boolean;
}

export function Composer({ onSend, disabled, isOffline }: ComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="glass-card-strong rounded-xl p-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 bg-background rounded-lg border-2 border-primary focus:border-primary focus:outline-none resize-none min-h-[48px] max-h-[200px] transition-smooth"
          rows={1}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary/60 hover:text-primary disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
        {isOffline && message.trim() && (
          <span className="absolute right-12 top-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
            Queued (offline)
          </span>
        )}
      </div>
    </form>
  );
}