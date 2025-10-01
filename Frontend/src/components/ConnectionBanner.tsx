import { AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function ConnectionBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="glass-card border-l-4 border-l-destructive px-4 py-3 flex items-center gap-2 animate-fade-in">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <span className="text-sm text-foreground">
        You're offline. Requests will queue.
      </span>
    </div>
  );
}