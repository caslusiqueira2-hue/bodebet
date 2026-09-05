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
    
    if (game === 'fortune-tiger') {
      const apiUrl = window.location.origin.replace('http://', '').replace('https://', '');
      setIframeUrl(`/126/index.html?btt=1&t=${profile.id}&api=${apiUrl}`);
      setLoading(false);
      return;
    }

    // Check if the VPS API URL is configured in the environment
    const API_URL = import.meta.env.VITE_PGSOFT_API_URL;
    const AGENT_TOKEN = import.meta.env.VITE_PGSOFT_AGENT_TOKEN;
    const SECRET_KEY = import.meta.env.VITE_PGSOFT_SECRET_KEY;

    if (!API_URL || !AGENT_TOKEN || !SECRET_KEY) {
      setError(
        'A API da PG Soft ainda não está configurada na nuvem. \n\n' +
        'Você comprou os arquivos do servidor (Node.js/MySQL), mas eles precisam ser instalados em uma VPS (ex: Hostinger, DigitalOcean) usando o tutorial que você recebeu.\n\n' +
        'Quando sua VPS estiver online, adicione as chaves no arquivo .env.local da plataforma e suba essa atualização:'
      );
      setLoading(false);
      return;
    }

    const launchGame = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/game_launch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentToken: AGENT_TOKEN,
            secretKey: SECRET_KEY,
            user_code: profile.id,
            game_code: game,
            user_balance: profile.balance
          })
        });

        const data = await response.json();
        if (data.status === 1 && data.launch_url) {
          setIframeUrl(data.launch_url);
        } else {
          setError(data.message || 'Erro ao comunicar com a API PG Soft.');
        }
      } catch (err) {
        setError('Falha ao conectar no servidor da API (Verifique se a VPS está online e aceitando conexões HTTPS).');
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
