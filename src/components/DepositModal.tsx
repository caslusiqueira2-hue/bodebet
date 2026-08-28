import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, ArrowUpFromLine, Copy, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/use-profile';
import { generatePix } from '../api/sigilopay';
import type { PixRequest, PixResponse } from '../api/sigilopay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function DepositModal({ isOpen, onClose, userId }: Props) {
  const { profile, persistBalance } = useProfile();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  
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
      setError("Preencha todos os dados do cliente.");
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
      setError(err.message || "Erro desconhecido ao gerar o PIX.");
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
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 50) {
      setError("O valor mínimo para saque é R$ 50.");
      return;
    }
    if (!pixKey) {
      setError("Informe sua chave PIX.");
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

      setSuccess("Solicitação processada, pix em andamento.");
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
    setDepositAmount(50);
    setWithdrawAmount(50);
    setPixKey('');
    setStep(1);
    setPixData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex border-b border-white/10 mb-6 bg-background rounded-t-xl overflow-hidden">
          <button
            onClick={() => { setActiveTab('deposit'); setError(null); setSuccess(null); setStep(1); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'deposit' ? 'bg-primary text-white' : 'bg-surfaceHover text-textMuted hover:bg-white/10 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Depositar
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'withdraw' ? 'bg-primary text-white' : 'bg-surfaceHover text-textMuted hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4" /> Sacar
          </button>
          <button onClick={resetAndClose} className="absolute right-4 top-4 bg-black/40 p-2 rounded-full text-textMuted hover:text-white hover:bg-black/60 transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          <div className="mb-6 flex justify-between items-center bg-background border border-white/10 rounded-xl p-4">
            <span className="text-textMuted text-sm font-bold uppercase">Saldo Atual</span>
            <span className="text-xl font-black text-primary">R$ {(profile?.balance || 0).toFixed(2)}</span>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg bg-safe/10 border border-safe/20 text-safe text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'deposit' && (
            <>
              {step === 1 && (
                <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleDeposit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Valor (R$)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[20, 50, 100].map(val => (
                        <button
                          key={val} type="button" onClick={() => setDepositAmount(val)}
                          className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                            depositAmount === val ? 'bg-primary border-primary text-white' : 'bg-background border-white/5 text-textMuted hover:bg-surfaceHover'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                      min="1" step="0.01" required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Nome Completo</label>
                    <input type="text" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="Seu nome" required />
                  </div>
                  <div>
                    <label className="text-xs text-textMuted font-bold uppercase mb-1 block">E-mail</label>
                    <input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="seu@email.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-textMuted font-bold uppercase mb-1 block">CPF</label>
                      <input type="text" value={client.document} onChange={(e) => setClient({ ...client, document: e.target.value })} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="000.000.000-00" required />
                    </div>
                    <div>
                      <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Telefone</label>
                      <input type="text" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="(11) 99999-9999" required />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-safe hover:bg-yellow-500 text-black font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GERAR PIX'}
                  </button>
                </motion.form>
              )}
              {step === 2 && pixData && (
                <div className="flex flex-col items-center text-center gap-6">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Pague o PIX</h3>
                    <p className="text-sm text-textMuted flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Aguardando pagamento...
                    </p>
                  </div>
                  {pixData.pix.image || pixData.pix.code ? (
                    <div className="bg-white p-2 rounded-xl">
                      <img 
                        src={pixData.pix.image || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.pix.code)}`} 
                        alt="QR Code PIX" 
                        className="w-48 h-48" 
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-background border border-white/10 rounded-xl flex items-center justify-center text-textMuted text-xs p-4">
                      QR Code indisponível
                    </div>
                  )}
                  <div className="w-full">
                    <label className="text-xs text-textMuted font-bold uppercase mb-1 block text-left">Pix Copia e Cola</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={pixData.pix.code} className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-white text-xs" />
                      <button onClick={copyToClipboard} className="bg-primary hover:bg-primaryHover text-white p-3 rounded-lg transition-colors flex items-center justify-center">
                        {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-primary/10 border border-primary/20 rounded-lg p-4 text-left mt-2">
                    <button onClick={simulatePaymentReceived} className="w-full bg-primary hover:bg-primaryHover text-white text-sm font-bold py-2 rounded-lg">
                      [MOCK] Disparar Webhook
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="flex flex-col items-center text-center gap-4 py-8">
                  <div className="w-16 h-16 bg-safe/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-10 h-10 text-safe" />
                  </div>
                  <h3 className="text-white font-bold text-2xl">Depósito Confirmado!</h3>
                  <p className="text-textMuted">O valor foi adicionado ao seu saldo com sucesso!</p>
                  <button onClick={resetAndClose} className="w-full bg-surfaceHover hover:bg-white/10 text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                    VOLTAR AO JOGO
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'withdraw' && (
            <motion.form 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleWithdraw} className="flex flex-col gap-4"
            >
              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Valor do Saque (R$)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 500, profile?.balance || 0].map((val, i) => {
                    const isAll = i === 3;
                    if (isAll && val < 50) return null;
                    return (
                      <button
                        key={i} type="button" onClick={() => setWithdrawAmount(Math.max(50, val))}
                        className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                          withdrawAmount === val ? 'bg-primary border-primary text-white' : 'bg-background border-white/5 text-textMuted hover:bg-surfaceHover'
                        }`}
                      >
                        {isAll ? 'TUDO' : `R$ ${val}`}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  min="50" step="0.01" max={profile?.balance || 0} required
                />
              </div>

              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Chave PIX de Destino</label>
                <input
                  type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="CPF, E-mail, Telefone ou Aleatória" required
                />
              </div>

              <button
                type="submit" disabled={isLoading || (profile?.balance || 0) < withdrawAmount}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SOLICITAR SAQUE'}
              </button>

              {pendingWithdrawals.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="text-white text-sm font-bold uppercase mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Meus Saques
                  </h4>
                  <div className="flex flex-col gap-3">
                    {pendingWithdrawals.map(w => (
                      <div key={w.id} className="bg-background border border-white/5 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm font-bold">Solicitação de saque: {Number(w.amount).toFixed(2)}</p>
                          <p className="text-primary text-xs flex items-center gap-1 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> em processamento.
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
