
import { AviatorStage } from './aviator-stage'
import { BetPanel } from './bet-panel'
import { BetsBoard } from './bets-board'
import { HistoryBar } from './history-bar'
import { useAviator } from './use-aviator'

export function AviatorGame() {
  const game = useAviator()

  return (
    <div className="flex flex-col gap-4">
      <HistoryBar history={game.history} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <AviatorStage
          phase={game.phase}
          multiplier={game.multiplier}
          elapsed={game.elapsed}
          countdown={game.countdown}
        />

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

      <BetsBoard liveBets={game.liveBets} myBets={game.myBets} />
    </div>
  )
}
