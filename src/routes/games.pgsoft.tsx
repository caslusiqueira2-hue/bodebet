import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { games } from '@/lib/casino-data';

export const Route = createFileRoute('/games/pgsoft')({
  component: PGSoftIntegration,
});

function PGSoftIntegration() {
  const { game } = Route.useSearch<{ game: string }>();
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const gameData = games.find((g) => g.id === game);

  useEffect(() => {
    if (!profile) return;

    const launchGame = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/v1/game_launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentToken: '508e1011-d04b-4d18-bb47-87261a0dd7c1',
            secretKey: 'b59cc5b2-a04f-48c1-8b6a-b3784ef8cf37',
            user_code: profile.id,
            game_code: game || 'fortune-tiger',
            user_balance: Number(profile.balance) || 100,
          }),
        });

        const data = await response.json();
        if (data.status === 1 && data.launch_url) {
          const urlObj = new URL(data.launch_url);
          const currentOrigin = window.location.origin;
          const currentHost = window.location.host;
          
          urlObj.protocol = window.location.protocol;
          urlObj.host = currentHost;
          urlObj.searchParams.set('api', currentHost);
          urlObj.searchParams.set('or', currentHost);
          
          setIframeUrl(urlObj.toString());
        } else {
          setError(data.message || 'Erro ao inicializar o jogo no servidor.');
        }
      } catch (err: any) {
        setError('Falha ao conectar à API PG Soft: ' + (err?.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };

    launchGame();
  }, [profile, game]);


  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col relative">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 bg-black/50 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Sair</span>
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37]" />
          <p className="font-bold uppercase tracking-widest text-[#d4af37]/80">Conectando ao provedor...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-xl bg-red-950/40 border border-red-500/50 p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center gap-6">
            <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
            <h2 className="text-xl sm:text-2xl font-black uppercase text-red-400">Servidor Desconectado</h2>
            <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{error}</p>
            
            <div className="bg-black/50 p-4 rounded-xl w-full text-left font-mono text-xs text-white/60 border border-white/5">
              VITE_PGSOFT_API_URL=http://IP_DA_SUA_VPS:3000<br/>
              VITE_PGSOFT_AGENT_TOKEN=seu_token<br/>
              VITE_PGSOFT_SECRET_KEY=sua_secret
            </div>

            <button 
              onClick={() => navigate({ to: '/' })}
              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors uppercase mt-2"
            >
              Voltar ao Cassino
            </button>
          </div>
        </div>
      )}

      {iframeUrl && !loading && !error && (
        <div className="flex-1 w-full h-screen bg-[#111]">
          <iframe 
            src={iframeUrl} 
            className="w-full h-full border-none mx-auto sm:max-w-[430px] sm:shadow-2xl bg-black"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
