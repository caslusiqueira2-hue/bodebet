import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowDownToLine, 
  Wallet, 
  ArrowUpFromLine, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Check,
  Tag,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/use-profile';
import { generatePix } from '../api/sigilopay';
import type { PixRequest, PixResponse } from '../api/sigilopay';
import { validatePromoCode, recordPromoCodeUsage, type PromoCode } from '../lib/promo-codes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'deposit' | 'withdraw';
}

export function DepositModal({ isOpen, onClose, userId, initialTab = 'deposit' }: Props) {
  const { profile, persistBalance } = useProfile();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);
  
  // Deposit States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [client, setClient] = useState({ name: '', email: '', document: '', phone: '' });
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [pixKey, setPixKey] = useState<string>('');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);

  // Common States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'deposit');
      setError(null);
      setSuccess(null);
      if (profile) {
        setClient(prev => ({
          name: prev.name || profile.full_name || '',
          email: prev.email || profile.email || '',
          document: prev.document || profile.cpf || '',
          phone: prev.phone || profile.phone || ''
        }));
      }
    }
  }, [isOpen, initialTab, profile]);

  // Bloquear scroll do fundo e garantir ocultação da barra inferior
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.setAttribute('data-deposit-open', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-deposit-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-deposit-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escutar a transação em tempo real para Depósito
  useEffect(() => {
    if (activeTab === 'deposit' && step === 2 && pixData?.transaction?.id) {
      const channel = supabase
        .channel(`transaction-${pixData.transaction.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `id=eq.${pixData.transaction.id}` },
          (payload) => {
            if (payload.new.status === 'PAID') {
              setStep(3); // Sucesso!
            }
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [step, pixData, activeTab]);

  // Buscar saques pendentes
  const fetchPendingWithdrawals = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', userId)
      .eq('status', 'WITHDRAW_PENDING')
      .order('created_at', { ascending: false });
    if (data) setPendingWithdrawals(data);
  };

  useEffect(() => {
    if (activeTab === 'withdraw' && isOpen) {
      fetchPendingWithdrawals();
    }
  }, [activeTab, isOpen]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setValidatingPromo(true);
    setPromoMsg(null);
    
    try {
      const res = await validatePromoCode(promoInput);
      if (res.valid && res.promo) {
        setAppliedPromo(res.promo);
        setPromoMsg({ text: res.message, isError: false });
      } else {
        setAppliedPromo(null);
        setPromoMsg({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setPromoMsg({ text: 'Erro ao validar código.', isError: true });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMsg(null);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }
    if (!client.name || !client.email || !client.document || !client.phone) {
      setError("Preencha todos os dados solicitados para gerar o Pix.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const multiplier = appliedPromo?.multiplier || 1;
    const finalCredit = depositAmount * multiplier;

    try {
      const data: PixRequest = { 
        amount: depositAmount, 
        creditAmount: finalCredit,
        promoCode: appliedPromo?.code,
        client, 
        profileId: userId 
      };
      
      const response = await generatePix(data);
      setPixData(response);
      setStep(2);

      if (appliedPromo) {
        recordPromoCodeUsage(appliedPromo.code);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao gerar o Pix.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pixData?.pix.code) {
      navigator.clipboard.writeText(pixData.pix.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const simulatePaymentReceived = async () => {
    if (pixData?.transaction?.id) {
       await supabase.from('transactions').update({ status: 'PAID' }).eq('id', pixData.transaction.id);
       const { data: p } = await supabase.from('profiles').select('balance').eq('id', userId).single();
       if (p) {
         const multiplier = appliedPromo?.multiplier || 1;
         const finalCredit = depositAmount * multiplier;
         await persistBalance(Number(p.balance) + finalCredit);
       }
       setStep(3);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 50) {
      setError("O valor mínimo para saque é R$ 50.");
      return;
    }
    if (!pixKey) {
      setError("Informe sua chave Pix para receber o saque.");
      return;
    }
    
    const currentBalance = profile?.balance || 0;
    if (withdrawAmount > currentBalance) {
      setError("Saldo insuficiente para este saque.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await persistBalance(currentBalance - withdrawAmount);
      
      await supabase.from('transactions').insert([{
        profile_id: userId,
        amount: withdrawAmount,
        status: 'WITHDRAW_PENDING'
      }]);

      setSuccess("Solicitação processada com sucesso! Pix em andamento para sua conta.");
      fetchPendingWithdrawals();
      setWithdrawAmount(50);
      setPixKey('');
    } catch (err: any) {
      setError(err.message || "Erro ao processar saque.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setError(null);
    setSuccess(null);
    setStep(1);
    setPixData(null);
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  const promoMultiplier = appliedPromo?.multiplier || 1;
  const calculatedCredit = depositAmount * promoMultiplier;

  return (
    <div className="deposit-modal-overlay fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-[#120a1f] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] relative my-auto"
      >
        {/* TAB HEADER */}
        <div className="shrink-0 flex border-b border-white/10 bg-background/80 rounded-t-xl overflow-hidden relative">
          <button
            onClick={() => { setActiveTab('deposit'); setError(null); setSuccess(null); setStep(1); }}
            className={`flex-1 py-3.5 sm:py-4 text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'bg-primary text-white border-b-2 border-primary shadow'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Depositar
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setError(null); setSuccess(null); }}
            className={`flex-1 py-3.5 sm:py-4 text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'withdraw'
                ? 'bg-primary text-white border-b-2 border-primary shadow'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4" /> Sacar
          </button>
          <button 
            onClick={resetAndClose} 
            className="absolute right-3 top-2.5 sm:top-3 bg-white/10 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB: DEPOSIT */}
        {activeTab === 'deposit' && (
          <>
            {step === 1 && (
              <form onSubmit={handleDeposit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3.5">
                  {/* Saldo em Conta */}
                  <div className="flex justify-between items-center bg-background/80 border border-white/10 rounded-xl p-3 shadow-sm">
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Saldo em Conta</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">R$ {(profile?.balance || 0).toFixed(2)}</span>
                  </div>

                  {/* Alertas */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-red-400 text-xs font-semibold flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* VALOR DO DEPÓSITO */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Valor do Depósito (R$)</label>
                      {appliedPromo && (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Receberá: R$ {calculatedCredit.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[10, 20, 50].map(val => (
                        <button
                          key={val} 
                          type="button" 
                          onClick={() => setDepositAmount(val)}
                          className={`py-2 sm:py-2.5 rounded-xl text-sm font-bold border transition-all ${
                            depositAmount === val 
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/30 scale-[1.02]' 
                              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white font-bold focus:border-emerald-400 focus:outline-none text-sm"
                      min="2" 
                      step="0.01" 
                      required
                    />
                  </div>

                  {/* CÓDIGO PROMOCIONAL */}
                  <div className="bg-background/90 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        Código Promocional
                      </label>
                      {appliedPromo && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded">
                          {appliedPromo.multiplier}x Dobra Saldo
                        </span>
                      )}
                    </div>

                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Código {appliedPromo.code} Ativo!
                          </span>
                          <span className="text-xs text-white/90 font-semibold mt-0.5">
                            Você deposita R$ {depositAmount.toFixed(2)} e recebe <strong className="text-emerald-400 font-black text-sm">R$ {calculatedCredit.toFixed(2)}</strong> na banca!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-xs text-red-400 hover:text-red-300 font-bold px-2.5 py-1 bg-red-500/10 rounded-lg border border-red-500/25 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Digite seu cupom (ex: DOBRO)"
                          className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-white placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={validatingPromo || !promoInput.trim()}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow"
                        >
                          {validatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                        </button>
                      </div>
                    )}

                    {promoMsg && !appliedPromo && (
                      <p className={`text-xs font-semibold ${promoMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                        {promoMsg.text}
                      </p>
                    )}
                  </div>

                  {/* NOME COMPLETO */}
                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-1 block tracking-wider">Nome Completo</label>
                    <input 
                      type="text" 
                      value={client.name} 
                      onChange={(e) => setClient({ ...client, name: e.target.value })} 
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white focus:border-emerald-400 focus:outline-none text-sm" 
                      placeholder="Seu nome" 
                      required 
                    />
                  </div>

                  {/* E-MAIL */}
                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-1 block tracking-wider">E-mail</label>
                    <input 
                      type="email" 
                      value={client.email} 
                      onChange={(e) => setClient({ ...client, email: e.target.value })} 
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white focus:border-emerald-400 focus:outline-none text-sm" 
                      placeholder="seu@email.com" 
                      required 
                    />
                  </div>

                  {/* CPF E TELEFONE */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-bold uppercase mb-1 block tracking-wider">CPF</label>
                      <input 
                        type="text" 
                        value={client.document} 
                        onChange={(e) => setClient({ ...client, document: e.target.value })} 
                        className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white focus:border-emerald-400 focus:outline-none text-sm" 
                        placeholder="000.000.000-00" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-bold uppercase mb-1 block tracking-wider">Telefone</label>
                      <input 
                        type="text" 
                        value={client.phone} 
                        onChange={(e) => setClient({ ...client, phone: e.target.value })} 
                        className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white focus:border-emerald-400 focus:outline-none text-sm" 
                        placeholder="(11) 99999-9999" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* STICKY FOOTER CTA - BOTÃO VERDE NEON PULSANTE E BRILHANTE */}
                <div className="p-3 sm:p-4 bg-[#120a1f] border-t border-white/10 shrink-0 z-30 shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full btn-pix-neon py-3.5 sm:py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all flex justify-center items-center gap-2 border-none cursor-pointer select-none active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-black font-black text-base sm:text-lg">
                        <Sparkles className="w-5 h-5 fill-black text-black shrink-0" />
                        GERAR PIX R$ {depositAmount.toFixed(2)}
                        {appliedPromo ? ` (RECEBA R$ ${calculatedCredit.toFixed(2)})` : ''}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && pixData && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center text-center gap-4">
                  <div>
                    <h3 className="text-white font-black text-xl mb-1">Pague via Pix</h3>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Aguardando confirmação do pagamento...
                    </p>
                    {appliedPromo && (
                      <span className="inline-block mt-2 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                        ✨ Cupom {appliedPromo.code} ativo: Você receberá R$ {calculatedCredit.toFixed(2)}!
                      </span>
                    )}
                  </div>

                  {pixData.pix.image || pixData.pix.code ? (
                    <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
                      <img 
                        src={pixData.pix.image || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.pix.code)}`} 
                        alt="QR Code Pix" 
                        className="w-44 h-44 sm:w-48 sm:h-48" 
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 sm:w-48 sm:h-48 bg-background border border-white/10 rounded-xl flex items-center justify-center text-muted-foreground text-xs p-4">
                      QR Code indisponível
                    </div>
                  )}

                  <div className="w-full">
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block text-left">Pix Copia e Cola</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={pixData.pix.code} 
                        className="flex-1 bg-background/90 border border-white/15 rounded-xl p-3 text-white text-xs font-mono select-all" 
                      />
                      <button 
                        type="button"
                        onClick={copyToClipboard} 
                        className="bg-[#00e701] hover:bg-[#00c801] text-black px-4 rounded-xl transition-colors flex items-center justify-center font-bold cursor-pointer"
                        title="Copiar código"
                      >
                        {copied ? <Check className="w-5 h-5 text-black" /> : <Copy className="w-5 h-5 text-black" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-[#120a1f] border-t border-white/10 shrink-0 z-30 shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
                  <button 
                    type="button"
                    onClick={simulatePaymentReceived} 
                    className="w-full bg-[#00e701] hover:bg-[#00c801] text-black text-sm sm:text-base font-black uppercase tracking-wider py-3.5 sm:py-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
                    Já realizei o pagamento Pix
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden justify-center items-center p-6 text-center gap-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-white font-black text-2xl">Depósito Confirmado!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {appliedPromo 
                    ? `Parabéns! O bônus de dobro foi creditado: R$ ${calculatedCredit.toFixed(2)} já estão na sua conta.`
                    : `O valor de R$ ${depositAmount.toFixed(2)} já foi adicionado ao seu saldo com sucesso.`}
                </p>
                <button 
                  type="button"
                  onClick={resetAndClose} 
                  className="w-full btn-pix-neon py-3.5 sm:py-4 rounded-xl font-black text-base uppercase tracking-wider mt-4 transition-transform active:scale-95 text-black"
                >
                  CONTINUAR JOGANDO
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
              {/* Saldo em Conta */}
              <div className="flex justify-between items-center bg-background/80 border border-white/10 rounded-xl p-3 shadow-sm">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Saldo em Conta</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">R$ {(profile?.balance || 0).toFixed(2)}</span>
              </div>

              {/* Alertas */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-red-400 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block tracking-wider">Valor do Saque (R$)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 500, profile?.balance || 0].map((val, i) => {
                    const isAll = i === 3;
                    if (isAll && val < 50) return null;
                    return (
                      <button
                        key={i} 
                        type="button" 
                        onClick={() => setWithdrawAmount(Math.max(50, Math.floor(val)))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          withdrawAmount === val 
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {isAll ? 'TUDO' : `R$ ${val}`}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="number" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white font-bold focus:border-primary focus:outline-none text-sm"
                  min="50" 
                  step="0.01" 
                  max={profile?.balance || 0} 
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block tracking-wider">Chave Pix de Destino</label>
                <input
                  type="text" 
                  value={pixKey} 
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-background/90 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white focus:border-primary focus:outline-none text-sm"
                  placeholder="CPF, E-mail, Celular ou Chave Aleatória" 
                  required
                />
              </div>

              {pendingWithdrawals.length > 0 && (
                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-white text-xs font-bold uppercase mb-2.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Meus Saques Recentes
                  </h4>
                  <div className="flex flex-col gap-2">
                    {pendingWithdrawals.map(w => (
                      <div key={w.id} className="bg-background/70 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm font-bold">Saque: R$ {Number(w.amount).toFixed(2)}</p>
                          <p className="text-amber-400 text-xs flex items-center gap-1 mt-0.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> Em processamento via Pix
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-[#120a1f] border-t border-white/10 shrink-0 z-30 shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
              <button
                type="submit" 
                disabled={isLoading || (profile?.balance || 0) < withdrawAmount}
                className="w-full bg-[#f5b625] hover:bg-[#eab308] text-black font-black text-sm sm:text-base uppercase tracking-wider py-3.5 sm:py-4 rounded-xl transition-transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-[#f5b625]/25 border-none cursor-pointer select-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : 'SOLICITAR SAQUE PIX'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
