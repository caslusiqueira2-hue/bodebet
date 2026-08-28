import { SymbolIcon } from './symbol-icon'
import { MIN_CLUSTER, symbolLookup, type TumbleConfig } from '@/lib/tumble-slot-engine'

export function TumblePaytable({ config }: { config: TumbleConfig }) {
  const lookup = symbolLookup(config)
  const ordered = [config.scatter.id, ...config.symbols.map((symbol) => symbol.id)]

  return (
    <section
      aria-labelledby="tumble-paytable-title"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="tumble-paytable-title" className="font-display text-sm font-bold">
          Tabela de prêmios
        </h2>
        <span className="text-[11px] text-muted-foreground">x aposta</span>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-3 gap-y-1 text-xs">
        <span />
        <span />
        <span className="text-right text-[10px] uppercase text-muted-foreground">8+</span>
        <span className="text-right text-[10px] uppercase text-muted-foreground">10+</span>
        <span className="text-right text-[10px] uppercase text-muted-foreground">12+</span>

        {ordered.map((id) => {
          const symbol = lookup[id]
          const isScatter = id === config.scatter.id

          return (
            <div key={id} className="contents">
              <SymbolIcon id={id} className="size-5" />
              <span className="truncate text-muted-foreground">
                {symbol.name}
                {isScatter ? ' · scatter' : ''}
              </span>
              {symbol.pays.map((pay, index) => (
                <span key={index} className="text-right font-semibold tabular-nums">
                  {pay}x
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <p className="border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted-foreground">
        {MIN_CLUSTER} ou mais símbolos iguais em qualquer posição pagam. Os premiados somem, novos
        caem e as quedas continuam enquanto houver combinação. 4 ou mais {config.scatter.name}{' '}
        liberam {config.scatter.freeSpins} rodadas grátis.
        {config.multipliers ? ' Orbes de multiplicador somam e multiplicam o prêmio da rodada.' : ''}
      </p>
    </section>
  )
}
