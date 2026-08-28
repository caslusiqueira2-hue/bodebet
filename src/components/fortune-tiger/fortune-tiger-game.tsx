import { useState } from 'react';
import { ChevronDown, Sparkles, Wallet } from 'lucide-react';
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
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 relative flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
      
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url("/fortune-tiger/premium/bg.jpg")' }}
      />
      {/* Dark overlay for better contrast */}
      <div className="fixed inset-0 z-0 bg-black/60" />

      {/* --- CENTRAL SLOT MACHINE CHASSIS --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center mt-2">
        
        {/* LOGO */}
        <div className="mb-2">
          <TigerLogo className="scale-75 md:scale-90 origin-bottom" />
        </div>

        {/* MACHINE CABINET */}
        <div className="relative w-full rounded-t-[3rem] rounded-b-[2rem] bg-gradient-to-b from-[#2a0510] via-[#150205] to-[#0a0002] border-[4px] border-b-[8px] border-[#d4af37] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_10px_30px_rgba(255,0,0,0.2)] p-4 pt-0 flex flex-col items-center">
          
          {/* TIGER INTEGRATED INTO TOP OF MACHINE */}
          <div className="relative -mt-12 mb-4 z-20">
            <TigerCharacter className={cn("transition-transform duration-500", game.isSpinning ? "scale-95" : "scale-100 hover:scale-105")} />
            {/* Ornamental wings/sides for tiger integration */}
            <div className="absolute top-1/2 -left-8 w-16 h-8 bg-[#d4af37] rounded-l-full -z-10 shadow-[0_5px_10px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            <div className="absolute top-1/2 -right-8 w-16 h-8 bg-[#d4af37] rounded-r-full -z-10 shadow-[0_5px_10px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
          </div>

          {/* THE REELS */}
          <div className="w-full px-1 mb-4">
            <Reels
              grid={game.grid}
              spinningReels={game.spinningReels}
              winningCells={game.winningCells}
            />
          </div>

          {/* WIN MESSAGE DISPLAY (Digital Panel look) */}
          <div className="w-full bg-[#050002] border-2 border-[#d4af37]/40 rounded-xl py-3 px-4 mb-4 min-h-[5rem] flex items-center justify-center relative overflow-hidden shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]">
            {game.lastPayout && game.lastPayout > 0 ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300 relative z-10">
                <span className="text-[11px] uppercase font-black tracking-[0.2em] text-[#ffdf70] mb-0.5 shadow-black drop-shadow-md">
                  Ganhou!
                </span>
                <span
                  className={cn(
                    'font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-[#fff7a1] via-[#ffd700] to-[#b8860b] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
                    tier === 'mega' ? 'text-5xl' : tier === 'grande' ? 'text-4xl' : 'text-3xl',
                  )}
                  style={{ WebkitTextStroke: '1px #8a4400' }}
                >
                  R$ {game.lastPayout.toFixed(2)}
                </span>
                {/* Glow behind text */}
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl -z-10" />
              </div>
            ) : (
              <span className="text-sm font-bold uppercase tracking-widest text-[#d4af37]/50">
                {game.message || 'Boa Sorte!'}
              </span>
            )}
          </div>

          {/* CONTROLS (Integrated into cabinet) */}
          <div className="w-full">
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

        </div>

        {/* --- SECONDARY INFO TOGGLE --- */}
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/70 hover:text-[#d4af37] transition-colors px-4 py-2 bg-black/40 rounded-full border border-[#d4af37]/30 backdrop-blur-sm"
        >
          Informações do Jogo <ChevronDown className={cn("w-4 h-4 transition-transform", showInfo && "rotate-180")} />
        </button>

        {/* --- SECONDARY INFO PANELS --- */}
        {showInfo && (
          <div className="w-full mt-4 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-[#d4af37]/20">
              <SpinHistory history={game.history} />
            </div>
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-[#d4af37]/20">
              <TigerVault
                cost={game.vaultCost}
                prize={game.vaultPrize}
                tries={game.vaultTries}
                opened={game.vaultOpen}
                message={game.vaultMessage}
                disabled={game.isSpinning}
                onTry={game.tryVault}
              />
            </div>
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-[#d4af37]/20">
              <Paytable />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

