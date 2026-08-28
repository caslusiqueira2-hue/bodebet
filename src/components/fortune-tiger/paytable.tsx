import Image from '@/components/ui/image'
import { paylineNames, symbols } from '@/lib/fortune-tiger-engine'

export function Paytable() {
  return (
    <section
      aria-labelledby="paytable-title"
      className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4"
    >
      <h2 id="paytable-title" className="font-display text-sm font-bold">
        Tabela de prêmios
      </h2>

      <ul className="flex flex-col gap-1.5">
        {symbols.map((symbol) => (
          <li
            key={symbol.id}
            className="flex items-center gap-3 rounded-lg bg-secondary/50 px-2 py-1.5"
          >
            <Image
              src={symbol.image || '/placeholder.svg'}
              alt=""
              width={40}
              height={40}
              className="size-9 shrink-0 rounded-md object-contain"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold">{symbol.name}</span>
              {symbol.wild ? (
                <span className="text-[11px] text-accent">Curinga · substitui todos</span>
              ) : null}
            </div>
            <span className="ml-auto shrink-0 font-display text-sm font-bold tabular-nums text-accent">
              {symbol.payout}x
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          5 linhas ativas
        </span>
        <ul className="flex flex-wrap gap-1.5">
          {paylineNames.map((name) => (
            <li
              key={name}
              className="rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Cada linha paga o multiplicador do símbolo sobre a aposta do giro. Três símbolos iguais
          em qualquer uma das 5 linhas formam prêmio.
        </p>
      </div>
    </section>
  )
}
