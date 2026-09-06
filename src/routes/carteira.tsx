import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'
import { formatBRL } from '@/lib/casino-data'

export const Route = createFileRoute('/carteira')({
  component: CarteiraPage,
})

type TransactionItem = {
  id: string
  profile_id: string
  amount: number
  status: string
  created_at: string
}

function CarteiraPage() {
  const { profile, loading: profileLoading } = useProfile()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all')

  const fetchTransactions = async (userId: string) => {
    try {
      setLoadingTx(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTransactions(data)
      }
    } catch (err) {
      console.error('Erro ao carregar transações:', err)
    } finally {
      setLoadingTx(false)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions(profile.id)

      // Inscrição em tempo real para atualizações na tabela de transações
      const channel = supabase
        .channel(`carteira-tx-${profile.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `profile_id=eq.${profile.id}` },
          () => {
            fetchTransactions(profile.id)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.id])

  const openDeposit = () => {
    document.dispatchEvent(new CustomEvent('open-deposit-modal', { detail: { tab: 'deposit' } }))
  }

  const openWithdraw = () => {
    document.dispatchEvent(new CustomEvent('open-deposit-modal', { detail: { tab: 'withdraw' } }))
  }

  // Filtragem das transações
  const filteredTransactions = transactions.filter((tx) => {
    const isWithdrawal = tx.status?.toUpperCase().includes('WITHDRAW')
    if (filter === 'deposits') return !isWithdrawal
    if (filter === 'withdrawals') return isWithdrawal
    return true
  })

  // Cálculos de totais
  const totalDeposited = transactions
    .filter((tx) => tx.status === 'PAID')
    .reduce((acc, tx) => acc + Number(tx.amount || 0), 0)

  const totalWithdrawn = transactions
    .filter((tx) => tx.status?.toUpperCase().includes('WITHDRAW'))
    .reduce((acc, tx) => acc + Number(tx.amount || 0), 0)

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-24 lg:px-8 lg:pb-12">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            Voltar ao cassino
          </a>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <ShieldCheck className="size-3.5" />
            <span>Transações Seguras via Pix</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="size-7 text-primary" />
            Minha Carteira
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu saldo disponível, depósitos instantâneos e saques via Pix.
          </p>
        </div>

        {/* CARD PRINCIPAL DE SALDO */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c102b] via-[#140b22] to-[#0c0616] p-6 sm:p-8 shadow-2xl">
          {/* Efeito visual de fundo */}
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                Saldo Disponível
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                  {profileLoading ? (
                    <span className="animate-pulse opacity-60">R$ --,--</span>
                  ) : (
                    `R$ ${(profile?.balance || 0).toFixed(2)}`
                  )}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  BRL
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Disponível para jogar em todos os slots PG Soft, Mines, Double e Aviator.
              </p>
            </div>

            {/* BOTÕES DE AÇÃO: Alta Visibilidade e Contraste */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={openDeposit}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-safe hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 shadow-xl shadow-safe/25 border-2 border-yellow-300/40 cursor-pointer"
              >
                <ArrowDownToLine className="size-5" />
                + Fazer Depósito
              </button>

              <button
                type="button"
                onClick={openWithdraw}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 border-2 border-white/20 shadow-lg cursor-pointer"
              >
                <ArrowUpFromLine className="size-5 text-primary" />
                Solicitar Saque
              </button>
            </div>
          </div>
        </div>

        {/* RESUMO DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ArrowDownToLine className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Depositado
              </span>
              <span className="text-lg font-black text-white tabular-nums">
                {formatBRL(totalDeposited)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <ArrowUpFromLine className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total de Saques
              </span>
              <span className="text-lg font-black text-white tabular-nums">
                {formatBRL(totalWithdrawn)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status da Conta
              </span>
              <span className="text-sm font-bold text-emerald-400">
                Verificada • 100% Real
              </span>
            </div>
          </div>
        </div>

        {/* HISTÓRICO DE TRANSAÇÕES */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/60 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase">
                Histórico de Transações
              </h2>
              <p className="text-xs text-muted-foreground">
                Depósitos e saques realizados na sua conta
              </p>
            </div>

            {/* ABAS / FILTROS: Todos com alta visibilidade */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-background/80 p-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Todas ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('deposits')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'deposits'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Depósitos
              </button>
              <button
                type="button"
                onClick={() => setFilter('withdrawals')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'withdrawals'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Saques
              </button>
            </div>
          </div>

          {/* LISTA DE TRANSAÇÕES */}
          {loadingTx ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin text-primary mb-2" />
              <p className="text-xs font-semibold">Carregando movimentações...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-background/30 p-6">
              <Wallet className="size-10 text-muted-foreground/50 mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Nenhuma movimentação encontrada</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                {filter === 'deposits'
                  ? 'Você ainda não possui depósitos registrados.'
                  : filter === 'withdrawals'
                  ? 'Você ainda não possui solicitações de saque.'
                  : 'Faça seu primeiro depósito via Pix para começar a jogar agora.'}
              </p>
              <button
                type="button"
                onClick={openDeposit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-safe hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wide transition-all shadow"
              >
                <PlusCircle className="size-4" />
                Fazer Depósito via Pix
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredTransactions.map((tx) => {
                const isWithdrawal = tx.status?.toUpperCase().includes('WITHDRAW')
                const isPaid = tx.status === 'PAID'
                const isPending = tx.status?.toUpperCase().includes('PENDING')
                const date = new Date(tx.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-background/60 p-4 transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          isWithdrawal
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isWithdrawal ? (
                          <ArrowUpFromLine className="size-5" />
                        ) : (
                          <ArrowDownToLine className="size-5" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {isWithdrawal ? 'Saque Pix' : 'Depósito via Pix'}
                        </span>
                        <span className="text-xs text-muted-foreground">{date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Status Badge Visível */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : isPending ? (
                          <Clock className="size-3.5" />
                        ) : (
                          <AlertCircle className="size-3.5" />
                        )}
                        {isPaid
                          ? 'Aprovado'
                          : isPending
                          ? 'Processando'
                          : 'Cancelado'}
                      </span>

                      <span
                        className={`text-base font-black tabular-nums ${
                          isWithdrawal ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {isWithdrawal ? '-' : '+'} R$ {Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
