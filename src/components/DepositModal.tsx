import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, Wallet, ArrowUpFromLine, Copy, CheckCircle2, AlertCircle, Loader2, Clock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/use-profile';
import { generatePix } from '../api/sigilopay';
import type { PixRequest, PixResponse } from '../api/sigilopay';

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
    }
  }, [isOpen, initialTab]);

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
    
    try {
      const data: PixRequest = { amount: depositAmount, client, profileId: userId };
      const response = await generatePix(data);
      setPixData(response);
      setStep(2);
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
         await persistBalance(Number(p.balance) + depositAmount);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#120a1f] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex border-b border-white/10 bg-background/80 rounded-t-xl overflow-hidden relative">
          <button
            onClick={() => { setActiveTab('deposit'); setError(null); setSuccess(null); setStep(1); }}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'bg-primary text-white border-b-2 border-primary shadow'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Depositar
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'withdraw'
                ? 'bg-primary text-white border-b-2 border-primary shadow'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4" /> Sacar
          </button>
          <button 
            onClick={resetAndClose} 
            className="absolute right-3 top-3 bg-white/10 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          <div className="mb-6 flex justify-between items-center bg-background/80 border border-white/10 rounded-xl p-4 shadow-sm">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Saldo em Conta</span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">R$ {(profile?.balance || 0).toFixed(2)}</span>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-red-400 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-medium">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'deposit' && (
            <>
              {step === 1 && (
                <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleDeposit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block tracking-wider">Valor do Depósito (R$)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[20, 50, 100].map(val => (
                        <button
                          key={val} 
                          type="button" 
                          onClick={() => setDepositAmount(val)}
                          className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
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
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white font-bold focus:border-primary focus:outline-none"
                      min="1" 
                      step="0.01" 
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block tracking-wider">Nome Completo</label>
                    <input 
                      type="text" 
                      value={client.name} 
                      onChange={(e) => setClient({ ...client, name: e.target.value })} 
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm" 
                      placeholder="Seu nome" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block tracking-wider">E-mail</label>
                    <input 
                      type="email" 
                      value={client.email} 
                      onChange={(e) => setClient({ ...client, email: e.target.value })} 
                      className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm" 
                      placeholder="seu@email.com" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block tracking-wider">CPF</label>
                      <input 
                        type="text" 
                        value={client.document} 
                        onChange={(e) => setClient({ ...client, document: e.target.value })} 
                        className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm" 
                        placeholder="000.000.000-00" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-bold uppercase mb-1.5 block tracking-wider">Telefone</label>
                      <input 
                        type="text" 
                        value={client.phone} 
                        onChange={(e) => setClient({ ...client, phone: e.target.value })} 
                        className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm" 
                        placeholder="(11) 99999-9999" 
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-safe hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider py-4 rounded-xl mt-2 transition-transform active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-safe/20"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GERAR PIX DEPOSITAR'}
                  </button>
                </motion.form>
              )}

              {step === 2 && pixData && (
                <div className="flex flex-col items-center text-center gap-5">
                  <div>
                    <h3 className="text-white font-black text-xl mb-1">Pague via Pix</h3>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Aguardando confirmação do pagamento...
                    </p>
                  </div>
                  {pixData.pix.image || pixData.pix.code ? (
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <img 
                        src={pixData.pix.image || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.pix.code)}`} 
                        alt="QR Code Pix" 
                        className="w-48 h-48" 
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-background border border-white/10 rounded-xl flex items-center justify-center text-muted-foreground text-xs p-4">
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
                        onClick={copyToClipboard} 
                        className="bg-primary hover:bg-primary/90 text-white px-4 rounded-xl transition-colors flex items-center justify-center font-bold"
                        title="Copiar código"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="w-full mt-2">
                    <button 
                      onClick={simulatePaymentReceived} 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md"
                    >
                      Já realizei o pagamento Pix
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center gap-4 py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-black text-2xl">Depósito Confirmado!</h3>
                  <p className="text-muted-foreground text-sm">O valor já foi adicionado ao seu saldo com sucesso.</p>
                  <button 
                    onClick={resetAndClose} 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors"
                  >
                    CONTINUAR JOGANDO
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'withdraw' && (
            <motion.form 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleWithdraw} 
              className="flex flex-col gap-4"
            >
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
                  className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white font-bold focus:border-primary focus:outline-none"
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
                  className="w-full bg-background/90 border border-white/15 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm"
                  placeholder="CPF, E-mail, Celular ou Chave Aleatória" 
                  required
                />
              </div>

              <button
                type="submit" 
                disabled={isLoading || (profile?.balance || 0) < withdrawAmount}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl mt-2 transition-transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SOLICITAR SAQUE PIX'}
              </button>

              {pendingWithdrawals.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <h4 className="text-white text-xs font-bold uppercase mb-3 flex items-center gap-2">
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
            </motion.form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
