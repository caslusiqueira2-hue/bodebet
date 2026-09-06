import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { games } from '@/lib/casino-data';

export const Route = createFileRoute('/games/pgsoft')({
  validateSearch: (search: Record<string, unknown>) => ({
    game: typeof search.game === 'string' ? search.game : 'fortune-tiger',
  }),
  component: PGSoftIntegration,
});

function PGSoftIntegration() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  
  const searchParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('game')
    : null;
  const game = searchParam || search.game || 'fortune-tiger';

  const { profile, loading: profileLoading } = useProfile();
  
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const launchedGameRef = useRef<string | null>(null);
  const gameData = games.find((g) => g.id === game);

  const launchGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtém ou cria ID persistente e estável no navegador do jogador
      let userCode = profile?.id;
      if (!userCode && typeof window !== 'undefined') {
        let stored = localStorage.getItem('bodebet_player_id');
        if (!stored) {
          stored = 'player_' + Math.random().toString(36).substring(2, 9);
          localStorage.setItem('bodebet_player_id', stored);
        }
        userCode = stored;
      }
      if (!userCode) userCode = 'player_guest';

      const userBalance = profile?.balance ? Math.round(Number(profile.balance)) : 100;

      const response = await fetch('/api/v1/game_launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentToken: '508e1011-d04b-4d18-bb47-87261a0dd7c1',
          secretKey: 'b59cc5b2-a04f-48c1-8b6a-b3784ef8cf37',
          user_code: userCode,
          game_code: game || 'fortune-tiger',
          user_balance: userBalance,
        }),
      });

      const data = await response.json();

      if (data.status === 1 && data.launch_url) {
        const urlObj = new URL(data.launch_url);
        const currentHost = window.location.host;
        
        urlObj.protocol = window.location.protocol;
        urlObj.host = currentHost;
        urlObj.searchParams.set('api', currentHost);
        urlObj.searchParams.set('or', currentHost);
        
        launchedGameRef.current = game;
        setIframeUrl(urlObj.toString());
      } else {
        launchedGameRef.current = null;
        setError(data.msg || data.message || 'Erro ao inicializar o jogo no servidor.');
      }
    } catch (err: any) {
      launchedGameRef.current = null;
      setError('Falha ao conectar à API PG Soft: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.balance, game]);

  useEffect(() => {
    if (profileLoading) return;
    
    // Dispara o launch se ainda não foi lançado para este jogo
    if (launchedGameRef.current !== game) {
      launchGame();
    }
  }, [profileLoading, game, launchGame]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* Barra Superior Flutuante */}
      <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
        <button 
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 bg-black/70 hover:bg-black/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg transition-all active:scale-95"
          title="Voltar ao Início"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Voltar</span>
        </button>

        <button 
          onClick={() => {
            launchedGameRef.current = null;
            launchGame();
          }}
          className="flex items-center gap-2 bg-black/70 hover:bg-black/90 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 shadow-lg transition-all active:scale-95 text-white/80 hover:text-white"
          title="Recarregar Jogo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Recarregar</span>
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-neutral-950">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37]" />
          <p className="font-bold uppercase tracking-widest text-[#d4af37]/90 text-sm">
            Carregando {gameData?.name || 'Jogo PG Soft'}...
          </p>
          <span className="text-xs text-white/40">Iniciando sessão com alta velocidade</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950">
          <div className="max-w-md bg-red-950/40 border border-red-500/50 p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center gap-5 shadow-2xl">
            <AlertCircle className="w-14 h-14 text-red-500" />
            <h2 className="text-xl font-bold uppercase text-red-400">Falha na Inicialização</h2>
            <p className="text-white/80 text-sm leading-relaxed">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button 
                onClick={() => {
                  launchedGameRef.current = null;
                  launchGame();
                }}
                className="flex-1 py-3.5 bg-primary hover:bg-primary/90 rounded-xl font-bold transition-all uppercase text-sm text-white shadow-lg"
              >
                Tentar Novamente
              </button>
              <button 
                onClick={() => navigate({ to: '/' })}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all uppercase text-sm text-white"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {iframeUrl && !loading && !error && (
        <div className="flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <iframe 
            src={iframeUrl} 
            className="w-full h-full border-none sm:max-w-[440px] sm:shadow-2xl bg-black"
            allow="autoplay; fullscreen; screen-wake-lock; orientation-lock"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
