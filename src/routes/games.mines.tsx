import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useMinesGame } from '@/hooks/useMinesGame';
import { GameBoard } from '@/components/GameBoard';
import { Controls } from '@/components/Controls';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { MultiplierDisplay } from '@/components/MultiplierDisplay';
import { GameResultOverlay } from '@/components/GameResultOverlay';
import { StatsHistoryPanel } from '@/components/StatsHistoryPanel';
import { DepositModal } from '@/components/DepositModal';
import { Bomb, LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/games/mines')({
  component: MinesGameRoute,
});

function MinesGameRoute() {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  if (!userId) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando Jogo...</div>;

  return <Game userId={userId} />;
}

function Game({ userId }: { userId: string }) {
  const game = useMinesGame(userId);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Header (Preservado do antigo App.tsx) */}
      <header className="bg-surface border-b border-white/5 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-textMuted hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <Bomb className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-black text-white tracking-widest italic hidden sm:block">MINES</h1>
            {game.role === 'admin' && (
              <span className="ml-2 bg-primary/20 text-primary border border-primary/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:block">
                Admin
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <BalanceDisplay 
            balance={game.balance} 
            onDepositClick={() => setIsDepositOpen(true)}
          />
          <button 
            onClick={handleLogout}
            className="text-textMuted hover:text-danger transition-colors p-2"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)}
        userId={userId}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 flex flex-col xl:flex-row gap-8 items-start justify-center max-w-[1400px] mx-auto w-full">
        
        {/* Left Side: Game Board & Overlay */}
        <div className="flex-1 w-full max-w-[600px] flex flex-col gap-6 mx-auto xl:mx-0 relative">
          <div className="relative">
            <GameBoard 
              tiles={game.tiles}
              gameState={game.gameState}
              onTileClick={game.revealTile}
            />
            <GameResultOverlay 
              gameState={game.gameState}
              payout={game.gameState === 'WON' ? game.bet * game.currentMultiplier : game.potentialPayout}
              multiplier={game.currentMultiplier}
            />
          </div>
          
          <MultiplierDisplay 
            currentMultiplier={game.currentMultiplier}
            nextMultiplier={game.nextMultiplier}
          />

          {/* Desktop Controls */}
          <div className="hidden xl:block">
            <Controls 
              gameState={game.gameState}
              bet={game.bet}
              setBet={game.setBet}
              balance={game.balance}
              minesCount={game.minesCount}
              setMinesCount={game.setMinesCount}
              startGame={game.startGame}
              cashOut={game.cashOut}
              resetGame={game.resetGame}
              potentialPayout={game.potentialPayout}
            />
          </div>
        </div>

        {/* Right Side / Bottom: Controls & Stats */}
        <div className="w-full max-w-[600px] xl:max-w-[400px] flex flex-col gap-6 mx-auto xl:mx-0">
          {/* Mobile/Tablet Controls */}
          <div className="xl:hidden w-full">
            <Controls 
              gameState={game.gameState}
              bet={game.bet}
              setBet={game.setBet}
              balance={game.balance}
              minesCount={game.minesCount}
              setMinesCount={game.setMinesCount}
              startGame={game.startGame}
              cashOut={game.cashOut}
              resetGame={game.resetGame}
              potentialPayout={game.potentialPayout}
            />
          </div>

          <StatsHistoryPanel history={game.history} stats={game.stats} />
        </div>
      </main>
    </div>
  );
}
