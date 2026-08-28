import { AviatorStage } from './aviator-stage';
import { BetPanel } from './bet-panel';
import { BetsBoard } from './bets-board';
import { HistoryBar } from './history-bar';
import { useAviator } from './use-aviator';

export function AviatorGame() {
  const game = useAviator();

  return (
    <div className="min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 bg-black relative flex flex-col items-center overflow-x-hidden">
      
      {/* Absolute background color block just in case */}
      <div className="absolute inset-0 bg-[#050002] -z-10" />
      
      <div className="w-full max-w-4xl flex flex-col gap-4 relative z-10">
        
        {/* Top History Bar */}
        <HistoryBar history={game.history} />

        {/* The Flight Stage & Bets Panel Grid */}
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          
          {/* Main Flight Area */}
          <div className="w-full flex flex-col">
            <AviatorStage
              phase={game.phase}
              multiplier={game.multiplier}
              elapsed={game.elapsed}
              countdown={game.countdown}
            />
          </div>

          {/* Side Control Panel (or bottom on mobile) */}
          <div className="w-full h-full">
            <BetPanel
              phase={game.phase}
              multiplier={game.multiplier}
              balance={game.balance}
              bet={game.bet}
              queuedBet={game.queuedBet}
              autoCashout={game.autoCashout}
              onAutoCashoutChange={game.setAutoCashout}
              onPlaceBet={game.placeBet}
              onCancelBet={game.cancelBet}
              onCashOut={game.cashOut}
              notice={game.notice}
            />
          </div>
        </div>

        {/* Bets Board hidden under an accordion */}
        <div className="mt-4">
          <BetsBoard liveBets={game.liveBets} myBets={game.myBets} />
        </div>

      </div>
    </div>
  );
}

