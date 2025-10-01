import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';

export default function Observability() {
  const navigate = useNavigate();
  const { sessionStats } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate derived stats
  const avgSavedLatency = sessionStats.totalHits > 0 
    ? sessionStats.totalSavedLatency / sessionStats.totalHits 
    : 0;
  
  const hitRate = sessionStats.totalQueries > 0 
    ? sessionStats.totalHits / sessionStats.totalQueries 
    : 0;

  const fetchStats = async () => {
    // No need to fetch from API, we're using session stats
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="glass-card-strong border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Observability</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            disabled={isLoading}
            aria-label="Refresh stats"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4">
                <div className="skeleton h-6 w-32 mb-2 rounded" />
                <div className="skeleton h-10 w-24 rounded" />
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="skeleton h-6 w-24 mb-2 rounded" />
                <div className="skeleton h-10 w-16 rounded" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="skeleton h-32 w-full rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Avg Saved (Hits)</h3>
                <p className="text-2xl font-bold text-primary">{avgSavedLatency.toFixed(2)} ms</p>
                <p className="text-xs text-muted-foreground">{sessionStats.totalHits} hits this session</p>
              </div>
              <div className="glass-card rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Hit Rate</h3>
                <p className="text-2xl font-bold text-primary">{Math.round(hitRate * 100)}%</p>
                <p className="text-xs text-muted-foreground">{sessionStats.totalQueries} queries this session</p>
              </div>
            </div>


            {/* Recent Hits List */}
            <div className="glass-card rounded-xl">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium">Recent Cache Hits</h3>
              </div>
              {sessionStats.recentHits.length > 0 ? (
                <div className="divide-y divide-border">
                  {sessionStats.recentHits.map((hit, i) => (
                    <div key={i} className="p-4 hover:bg-muted/20 transition-smooth">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium flex-1 mr-2">
                          "{hit.query}"
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {hit.threshold.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            s={hit.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Saved {hit.savedLatency.toFixed(2)}ms at {format(new Date(hit.timestamp * 1000), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No hits yet—ask something on Chat.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}