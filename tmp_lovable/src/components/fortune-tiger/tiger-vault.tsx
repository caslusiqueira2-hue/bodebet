import { KeyRound, Lock, LockOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/casino-data'

type TigerVaultProps = {
  cost: number
  prize: number
  tries: number
  opened: boolean
  message: string | null
  disabled: boolean
  onTry: () => void
}

/**
 * Mini-jogo "Cofre do Tigre": cada tentativa desconta fichas do saldo
 * fictício. Nenhum pagamento real, PIX ou depósito está envolvido.
 */
export function TigerVault({
  cost,
  prize,
  tries,
  opened,
  message,
  disabled,
  onTry,
}: TigerVaultProps) {
  return (
    <section
      aria-labelledby="cofre-tigre-title"
      className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="cofre-tigre-title" className="font-display text-sm font-bold">
          Tente abrir o cofre
        </h2>
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {tries} tentativa{tries === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-3">
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-lg border transition-colors',
            opened
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-border/60 bg-secondary text-muted-foreground',
          )}
        >
          {opened ? <LockOpen className="size-6" /> : <Lock className="size-6" />}
        </div>
        <p className="text-xs text-muted-foreground">
          Cada tentativa custa {formatBRL(cost)} em fichas demo e paga {formatBRL(prize)} se o
          cofre abrir.
        </p>
      </div>

      <Button onClick={onTry} disabled={disabled} className="font-semibold">
        <KeyRound className="size-4" />
        Tentar abrir o cofre
      </Button>

      <p
        aria-live="polite"
        className={cn(
          'min-h-8 text-center text-xs font-medium',
          opened && message ? 'text-accent' : 'text-muted-foreground',
        )}
      >
        {message ?? 'Nenhum valor real é movimentado — apenas fichas de demonstração.'}
      </p>
    </section>
  )
}
