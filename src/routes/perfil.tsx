import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { 
  User, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Pencil, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Lock, 
  Calendar, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  Scale, 
  ExternalLink, 
  Crown, 
  HelpCircle 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'
import { formatBRL } from '@/lib/casino-data'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/perfil')({
  component: ProfilePage,
})

type TransactionItem = {
  id: string
  profile_id: string
  amount: number
  status: string
  sigilopay_id?: string | null
  pix_code?: string | null
  created_at: string
}

// Avatares VIP BodeBet pré-definidos
const PRESET_AVATARS = [
  {
    id: 'bode-gold',
    name: 'Bode de Ouro VIP',
    bg: 'from-amber-500 to-yellow-600',
    icon: '🐐',
    border: 'border-amber-400',
  },
  {
    id: 'coroa-real',
    name: 'Coroa Imperial',
    bg: 'from-purple-600 to-indigo-700',
    icon: '👑',
    border: 'border-purple-400',
  },
  {
    id: 'high-roller',
    name: 'High Roller Diamond',
    bg: 'from-emerald-500 to-teal-700',
    icon: '💎',
    border: 'border-emerald-400',
  },
  {
    id: 'fortune-tiger',
    name: 'Tigre da Sorte',
    bg: 'from-orange-500 to-amber-700',
    icon: '🐅',
    border: 'border-orange-400',
  },
  {
    id: 'champion-flame',
    name: 'Chama Vencedora',
    bg: 'from-rose-600 to-red-700',
    icon: '🔥',
    border: 'border-rose-400',
  },
  {
    id: 'clube-ouro',
    name: 'Ás da Fortuna',
    bg: 'from-amber-400 to-yellow-500',
    icon: '♠️',
    border: 'border-yellow-300',
  },
]

function maskCPF(cpf?: string) {
  if (!cpf) return 'Não cadastrado'
  const clean = cpf.replace(/\D/g, '')
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.***.***-${clean.slice(9)}`
  }
  return cpf.replace(/(\d{3})\d{6}(\d{2})/, '$1.***.***-$2')
}

function formatPhone(phone?: string) {
  if (!phone) return 'Não cadastrado'
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  }
  return phone
}

function formatMemberSince(dateStr?: string) {
  if (!dateStr) return 'Membro desde 2026'
  try {
    const d = new Date(dateStr)
    const month = d.toLocaleDateString('pt-BR', { month: 'long' })
    const year = d.getFullYear()
    return `Membro desde ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`
  } catch {
    return 'Membro desde 2026'
  }
}

function formatDateTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function ProfilePage() {
  const { profile, loading: profileLoading, updateProfileData } = useProfile()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [activeTab, setActiveTab] = useState<'dados' | 'transacoes' | 'seguranca'>('dados')
  const [txFilter, setTxFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all')

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    photo_url: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        photo_url: profile.photo_url || '',
      })
    }
  }, [profile, isEditOpen])

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

      const channel = supabase
        .channel(`perfil-tx-${profile.id}`)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleOpenDeposit = () => {
    document.dispatchEvent(new CustomEvent('open-deposit-modal', { detail: { tab: 'deposit' } }))
  }

  const handleOpenWithdraw = () => {
    document.dispatchEvent(new CustomEvent('open-deposit-modal', { detail: { tab: 'withdraw' } }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem selecionada é muito pesada. Tamanho máximo: 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          setEditForm((prev) => ({ ...prev, photo_url: dataUrl }))
          toast.success('Foto carregada com sucesso! Clique em salvar para confirmar.')
        }
      }
      img.src = readerEvent.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!editForm.full_name.trim()) {
      toast.error('O nome completo não pode ficar em branco.')
      return
    }

    setIsSaving(true)
    try {
      await updateProfileData({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        photo_url: editForm.photo_url.trim(),
      })
      toast.success('Perfil atualizado com sucesso!')
      setIsEditOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar o perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  const paidDeposits = transactions.filter((tx) => tx.status === 'PAID')
  const totalDeposited = paidDeposits.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)

  const withdrawals = transactions.filter((tx) => tx.status?.toUpperCase().includes('WITHDRAW'))
  const totalWithdrawn = withdrawals.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)

  const currentBalance = profile?.balance || 0
  const netResult = currentBalance + totalWithdrawn - totalDeposited

  const filteredTransactions = transactions.filter((tx) => {
    const isWithdrawal = tx.status?.toUpperCase().includes('WITHDRAW')
    if (txFilter === 'deposits') return !isWithdrawal
    if (txFilter === 'withdrawals') return isWithdrawal
    return true
  })

  const username = profile?.email
    ? `@${profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')}`
    : '@bode_vip'

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Usuário VIP'

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-28 lg:px-8 lg:pb-16">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            Voltar ao cassino
          </a>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" />
              <span>Conta Protegida</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
              <Crown className="size-3.5" />
              <span>Membro VIP</span>
            </span>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b112c] via-[#130b20] to-[#0b0614] p-6 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="size-24 sm:size-28 rounded-full ring-4 ring-primary/40 p-1 bg-gradient-to-br from-primary/30 to-amber-500/20 shadow-xl overflow-hidden flex items-center justify-center">
                  {profile?.photo_url ? (
                    profile.photo_url.startsWith('preset:') ? (
                      <span className="text-4xl select-none">
                        {PRESET_AVATARS.find((a) => a.id === profile.photo_url?.replace('preset:', ''))?.icon || '🐐'}
                      </span>
                    ) : (
                      <img
                        src={profile.photo_url}
                        alt={displayName}
                        className="size-full rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    )
                  ) : (
                    <div className="size-full rounded-full bg-gradient-to-br from-primary to-purple-900 flex items-center justify-center text-white font-black text-3xl shadow-inner">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="absolute bottom-0 right-0 size-8 rounded-full bg-safe text-black hover:bg-yellow-400 p-1.5 shadow-lg border-2 border-[#130b20] transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                  title="Alterar foto de perfil"
                >
                  <Camera className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Ativa
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {profile?.email || 'Email não disponível'}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-white/60">
                  <Calendar className="size-3.5 text-amber-400/80" />
                  <span>{formatMemberSince(profile?.created_at)}</span>
                  <span>•</span>
                  <span className="text-yellow-400 font-semibold">
                    ID: #{profile?.id ? profile.id.slice(0, 8) : '00000000'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col lg:flex-row items-center justify-center gap-2.5">
              <Button
                variant="default"
                onClick={() => setIsEditOpen(true)}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold shadow-md h-10 px-4 cursor-pointer"
              >
                <Pencil className="size-4 text-primary" />
                <span>Editar Perfil</span>
              </Button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-10 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-xs font-bold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="size-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-[#1b122c] to-[#11091d] p-5 shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Saldo Disponível
              </span>
              <div className="size-9 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                <Wallet className="size-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-400">
                {profileLoading ? 'Carregando...' : formatBRL(currentBalance)}
              </div>
              <p className="text-[0.72rem] text-muted-foreground mt-1">
                Disponível para apostas e saque via Pix
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <Button
                size="sm"
                onClick={handleOpenDeposit}
                className="bg-safe text-black hover:bg-yellow-400 font-extrabold text-xs h-8 gap-1 shadow cursor-pointer"
              >
                <ArrowDownToLine className="size-3.5" />
                Depositar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenWithdraw}
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs h-8 gap-1 cursor-pointer"
              >
                <ArrowUpFromLine className="size-3.5" />
                Sacar
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-5 shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Depositado
              </span>
              <div className="size-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowDownToLine className="size-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
                {loadingTx ? '...' : formatBRL(totalDeposited)}
              </div>
              <p className="text-[0.72rem] text-muted-foreground mt-1">
                {paidDeposits.length} recarga(s) confirmada(s) via Pix
              </p>
            </div>

            <div className="text-[0.72rem] text-white/50 pt-2 border-t border-white/5 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-400" />
              <span>Aprovação automática em segundos</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-5 shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Sacado
              </span>
              <div className="size-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ArrowUpFromLine className="size-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-400">
                {loadingTx ? '...' : formatBRL(totalWithdrawn)}
              </div>
              <p className="text-[0.72rem] text-muted-foreground mt-1">
                {withdrawals.length} solicitação(ões) de saque Pix
              </p>
            </div>

            <div className="text-[0.72rem] text-white/50 pt-2 border-t border-white/5 flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-blue-400" />
              <span>Transferência direta para seu CPF</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-5 shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Balanço Geral
              </span>
              <div className="size-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                {netResult >= 0 ? <TrendingUp className="size-5" /> : <Scale className="size-5" />}
              </div>
            </div>

            <div>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  netResult >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {loadingTx ? '...' : `${netResult >= 0 ? '+' : ''}${formatBRL(netResult)}`}
              </div>
              <p className="text-[0.72rem] text-muted-foreground mt-1">
                {netResult >= 0 ? 'Resultado financeiro positivo' : 'Movimentação líquida da conta'}
              </p>
            </div>

            <div className="text-[0.72rem] text-white/50 pt-2 border-t border-white/5 flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" />
              <span>Saldo + Saques - Depósitos</span>
            </div>
          </div>
        </div>

        {/* 3. TABS */}
        <div className="flex border-b border-border/80 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dados'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <User className="size-4" />
            Dados da Conta
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transacoes')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'transacoes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <Clock className="size-4" />
            Histórico de Transações ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seguranca')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'seguranca'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <ShieldCheck className="size-4" />
            Segurança & Verificação
          </button>
        </div>

        {/* TAB 1: DADOS DA CONTA */}
        {activeTab === 'dados' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    Informações Cadastrais
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visualize os dados vinculados à sua conta na plataforma.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="gap-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-bold self-start sm:self-auto cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  Editar Dados
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex items-start gap-3.5">
                  <div className="size-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold">Nome Completo</span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {profile?.full_name || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="size-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                        E-mail de Acesso
                        <Lock className="size-3 text-amber-400" title="Campo protegido por segurança" />
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5">
                        {profile?.email || 'Não informado'}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-400 shrink-0">
                    Verificado
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="size-9 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                        CPF do Titular
                        <Lock className="size-3 text-amber-400" title="Campo protegido por segurança" />
                      </span>
                      <span className="text-sm font-bold text-white mt-0.5 font-mono">
                        {maskCPF(profile?.cpf)}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-400 shrink-0">
                    Titular Pix
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex items-start gap-3.5">
                  <div className="size-9 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold">Telefone / WhatsApp</span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {formatPhone(profile?.phone)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex items-start gap-3.5 md:col-span-2">
                  <div className="size-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold">Endereço Cadastrado</span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {profile?.address || 'Não cadastrado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-400 font-bold block mb-0.5">Proteção de Dados e Titularidade Pix:</strong>
                  Por conformidade com as regras financeiras do Banco Central, o CPF e o E-mail de cadastro permanecem protegidos. Todos os saques Pix solicitados são transferidos estritamente para a conta bancária vinculada ao mesmo CPF cadastrado.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTÓRICO DE TRANSAÇÕES */}
        {activeTab === 'transacoes' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    Extrato de Movimentações
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acompanhe todos os seus depósitos e saques em tempo real.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTxFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      txFilter === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    Todos ({transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('deposits')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      txFilter === 'deposits'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    Depósitos ({paidDeposits.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('withdrawals')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      txFilter === 'withdrawals'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    Saques ({withdrawals.length})
                  </button>
                </div>
              </div>

              {loadingTx ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <span className="text-xs font-semibold">Carregando histórico...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                    <Clock className="size-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Nenhuma transação encontrada</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {txFilter === 'all'
                      ? 'Você ainda não realizou depósitos ou saques em sua conta.'
                      : txFilter === 'deposits'
                      ? 'Nenhum depósito registrado até o momento.'
                      : 'Nenhum saque solicitado até o momento.'}
                  </p>
                  <Button
                    size="sm"
                    onClick={handleOpenDeposit}
                    className="mt-2 bg-safe text-black hover:bg-yellow-400 font-bold cursor-pointer"
                  >
                    Fazer um Depósito Pix
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/5 mt-2">
                  {filteredTransactions.map((tx) => {
                    const isWithdrawal = tx.status?.toUpperCase().includes('WITHDRAW')
                    const isPaid = tx.status === 'PAID' || tx.status === 'WITHDRAW_PAID'
                    const isPending =
                      tx.status === 'PENDING' || tx.status === 'WITHDRAW_PENDING'

                    return (
                      <div
                        key={tx.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isWithdrawal
                                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {isWithdrawal ? (
                              <ArrowUpFromLine className="size-5" />
                            ) : (
                              <ArrowDownToLine className="size-5" />
                            )}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {isWithdrawal ? 'Saque Pix' : 'Depósito Pix'}
                              </span>
                              <span className="text-[0.68rem] text-muted-foreground font-mono">
                                #{tx.id.slice(0, 8)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(tx.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                          <div
                            className={`text-base font-black tracking-tight ${
                              isWithdrawal ? 'text-white' : 'text-emerald-400'
                            }`}
                          >
                            {isWithdrawal ? `- ${formatBRL(tx.amount)}` : `+ ${formatBRL(tx.amount)}`}
                          </div>

                          <div className="flex items-center gap-1">
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-400">
                                <CheckCircle2 className="size-3" />
                                Concluído
                              </span>
                            )}
                            {isPending && isWithdrawal ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs font-bold text-emerald-400">pix processado.</span>
                                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400">
                                  pendente
                                </span>
                              </div>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[0.68rem] font-bold text-amber-400">
                                <Clock className="size-3" />
                                Aguardando Pagamento
                              </span>
                            ) : null}
                            {!isPaid && !isPending && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[0.68rem] font-bold text-red-400">
                                <AlertCircle className="size-3" />
                                {tx.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SEGURANÇA & VERIFICAÇÃO */}
        {activeTab === 'seguranca' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                <ShieldCheck className="size-5 text-emerald-400" />
                Segurança & Proteção da Conta
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex flex-col gap-2">
                  <div className="size-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Chave Pix Titular</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pagamentos de saques são validados obrigatoriamente para a mesma chave do CPF registrado.
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex flex-col gap-2">
                  <div className="size-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Lock className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Criptografia SSL 256-bit</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Todas as comunicações e sessões autenticadas utilizam criptografia de nível bancário de ponta a ponta.
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-background/60 p-4 flex flex-col gap-2">
                  <div className="size-9 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                    <Sparkles className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Pix Automático</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Integração bancária com processamento automatizado 24 horas por dia, 7 dias por semana.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-background/40">
                <div className="flex items-center gap-3">
                  <HelpCircle className="size-5 text-primary" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Precisa alterar CPF ou E-mail?</span>
                    <span className="text-muted-foreground">
                      Fale diretamente com nossa equipe de suporte ao vivo no WhatsApp.
                    </span>
                  </div>
                </div>

                <a
                  href="/suporte"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg"
                >
                  <span>Central de Suporte</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: EDITAR PERFIL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#120a1c] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 size-8 rounded-full bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="size-4 text-primary" />
                  Editar Dados do Perfil
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Atualize suas informações pessoais e sua foto de perfil.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="overflow-y-auto custom-scrollbar py-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Foto de Perfil / Avatar
                  </label>

                  <div className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-background/60">
                    <div className="size-16 rounded-full ring-2 ring-primary/50 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-purple-900 shrink-0">
                      {editForm.photo_url ? (
                        editForm.photo_url.startsWith('preset:') ? (
                          <span className="text-2xl select-none">
                            {PRESET_AVATARS.find((a) => a.id === editForm.photo_url?.replace('preset:', ''))?.icon || '🐐'}
                          </span>
                        ) : (
                          <img
                            src={editForm.photo_url}
                            alt="Preview"
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        )
                      ) : (
                        <span className="text-xl font-black text-white">
                          {(editForm.full_name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold h-8 gap-1.5 self-start cursor-pointer"
                      >
                        <Camera className="size-3.5 text-primary" />
                        Escolher Foto do Aparelho
                      </Button>
                      <span className="text-[0.68rem] text-muted-foreground">
                        JPG, PNG ou WEBP até 5MB. Redimensionamento automático.
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[0.7rem] font-semibold text-muted-foreground block mb-2">
                      Ou escolha um Avatar VIP BodeBet:
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, photo_url: `preset:${avatar.id}` }))}
                          className={`size-11 rounded-xl flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-pointer border ${
                            editForm.photo_url === `preset:${avatar.id}`
                              ? `${avatar.border} ring-2 ring-primary scale-105 bg-white/10`
                              : 'border-white/10 bg-white/5'
                          }`}
                          title={avatar.name}
                        >
                          {avatar.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[0.68rem] text-muted-foreground block mb-1">
                      Ou insira o link direto de uma imagem na web:
                    </label>
                    <input
                      type="url"
                      value={editForm.photo_url.startsWith('preset:') ? '' : editForm.photo_url}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, photo_url: e.target.value }))}
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Telefone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-background/40 p-3 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Lock className="size-3.5 text-amber-400" />
                      E-mail e CPF Protegidos
                    </span>
                    <span className="text-[0.68rem] text-amber-400">Somente via Suporte</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-white/70">
                    <div className="bg-white/5 p-2 rounded truncate text-[0.75rem]">
                      {profile?.email}
                    </div>
                    <div className="bg-white/5 p-2 rounded text-[0.75rem] font-mono">
                      {maskCPF(profile?.cpf)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="border-white/10 text-white hover:bg-white/10 cursor-pointer"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-safe text-black hover:bg-yellow-400 font-extrabold gap-2 px-6 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  )
}
