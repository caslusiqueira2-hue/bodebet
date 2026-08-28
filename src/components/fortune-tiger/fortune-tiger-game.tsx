import { Sparkles, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/casino-data';
import { winTier } from '@/lib/fortune-tiger-engine';
import { Reels } from './reels';
import { SpinControls } from './spin-controls';
import { SpinHistory } from './spin-history';
import { TigerVault } from './tiger-vault';
import { Paytable } from './paytable';
import { TigerLogo, TigerCharacter } from './tiger-assets';
import { useFortuneTiger } from './use-fortune-tiger';

export function FortuneTigerGame() {
  const game = useFortuneTiger();
  const tier = game.lastPayout && game.lastPayout > 0 ? winTier(game.lastMultiplier) : null;

  return (
    <div className="min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 bg-gradient-to-b from-[#1a050a] via-[#0d0204] to-black relative overflow-hidden flex flex-col items-center">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(150,0,30,0.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,180,0,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Particle overlay placeholder (could be animated via CSS) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

      {/* --- HEADER LOGO --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center mt-2 mb-8">
        <TigerLogo />
      </div>

      {/* --- MAIN GAME AREA --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* The Tiger Character sitting on top of the reels */}
        <div className="relative -mb-16 z-20">
          <TigerCharacter className={cn("transition-transform duration-500", game.isSpinning ? "scale-95" : "scale-100 hover:scale-105")} />
        </div>

        {/* The Reels Container */}
        <div className="w-full px-2">
          <Reels
            grid={game.grid}
            spinningReels={game.spinningReels}
            winningCells={game.winningCells}
          />
        </div>

        {/* Win Message Area */}
        <div className="h-24 w-full flex items-center justify-center my-2 relative">
          {game.lastPayout && game.lastPayout > 0 ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#d4af37] mb-1">
                Vencedor!
              </span>
              <span
                className={cn(
                  'font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-[#ffe259] to-[#ffa751] drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]',
                  tier === 'mega' ? 'text-5xl' : tier === 'grande' ? 'text-4xl' : 'text-3xl',
                )}
                style={{ WebkitTextStroke: '1px #8a4400' }}
              >
                + {formatBRL(game.lastPayout)}
              </span>
              {/* Optional: Add particles/coins here */}
            </div>
          ) : (
            <span
              aria-live="polite"
              className="text-sm font-bold uppercase tracking-widest text-white/40"
            >
              {game.message || 'Boa Sorte!'}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="w-full px-2 pb-8">
          <SpinControls
            bet={game.bet}
            balance={game.balance}
            isSpinning={game.isSpinning}
            autoSpins={game.autoSpins}
            turbo={game.turbo}
            onChangeBet={game.changeBet}
            onSpin={game.handleSpin}
            onStartAuto={game.startAuto}
            onStopAuto={game.stopAuto}
            onToggleTurbo={game.setTurbo}
            onReset={game.resetBalance}
          />
        </div>

        {/* Auxiliary Components */}
        <div className="w-full px-2 flex flex-col gap-4 pb-8 z-10 relative">
          <SpinHistory history={game.history} />
          
          <TigerVault
            cost={game.vaultCost}
            prize={game.vaultPrize}
            tries={game.vaultTries}
            opened={game.vaultOpen}
            message={game.vaultMessage}
            disabled={game.isSpinning}
            onTry={game.tryVault}
          />
          
          <Paytable />
        </div>
        
      </div>
    </div>
  );
}

