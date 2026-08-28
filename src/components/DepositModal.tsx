import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/use-profile';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function DepositModal({ isOpen, onClose, userId }: Props) {
  const { profile, persistBalance } = useProfile();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  
  const [amount, setAmount] = useState<number>(50);
  const [pixKey, setPixKey] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Adiciona o saldo diretamente (Sem bloqueios do frontend anterior)
      const currentBalance = profile?.balance || 0;
      await persistBalance(currentBalance + amount);
      
      // Simula um registro de transação
      await supabase.from('transactions').insert([{
        profile_id: userId,
        amount: amount,
        type: 'DEPOSIT',
        status: 'PAID'
      }]);

      setSuccess(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao processar depósito.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }
    if (!pixKey) {
      setError("Informe sua chave PIX.");
      return;
    }
    
    const currentBalance = profile?.balance || 0;
    if (amount > currentBalance) {
      setError("Saldo insuficiente para este saque.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Remove o saldo diretamente
      await persistBalance(currentBalance - amount);
      
      // Simula um registro de transação
      await supabase.from('transactions').insert([{
        profile_id: userId,
        amount: amount,
        type: 'WITHDRAW',
        status: 'PAID'
      }]);

      setSuccess(`Saque de R$ ${amount.toFixed(2)} processado para a chave PIX informada.`);
      setTimeout(() => {
        resetAndClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao processar saque.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setError(null);
    setSuccess(null);
    setAmount(50);
    setPixKey('');
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
        {/* Header Tabs */}
        <div className="flex bg-background border-b border-white/5 relative">
          <button
            onClick={() => { setActiveTab('deposit'); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'deposit' ? 'text-white border-b-2 border-primary' : 'text-textMuted hover:text-white'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" /> Depósito
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'withdraw' ? 'text-white border-b-2 border-primary' : 'text-textMuted hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4" /> Saque
          </button>
          
          <button onClick={resetAndClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors">
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

          {activeTab === 'deposit' && !success && (
            <motion.form 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleDeposit} className="flex flex-col gap-4"
            >
              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Valor do Depósito (R$)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[20, 50, 100, 500].map(val => (
                    <button
                      key={val} type="button" onClick={() => setAmount(val)}
                      className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                        amount === val ? 'bg-primary border-primary text-white' : 'bg-background border-white/5 text-textMuted hover:bg-surfaceHover'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
                <input
                  type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  min="1" step="0.01" required
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-safe hover:bg-yellow-500 text-black font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'DEPOSITAR AGORA'}
              </button>
            </motion.form>
          )}

          {activeTab === 'withdraw' && !success && (
            <motion.form 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleWithdraw} className="flex flex-col gap-4"
            >
              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Valor do Saque (R$)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[20, 50, 100, profile?.balance || 0].map((val, i) => {
                    const isAll = i === 3;
                    if (isAll && val <= 0) return null;
                    return (
                      <button
                        key={i} type="button" onClick={() => setAmount(val)}
                        className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                          amount === val ? 'bg-primary border-primary text-white' : 'bg-background border-white/5 text-textMuted hover:bg-surfaceHover'
                        }`}
                      >
                        {isAll ? 'TUDO' : `R$ ${val}`}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  min="1" step="0.01" max={profile?.balance || 0} required
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
                type="submit" disabled={isLoading || (profile?.balance || 0) < amount}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SOLICITAR SAQUE'}
              </button>
            </motion.form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
