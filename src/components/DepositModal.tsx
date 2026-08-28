import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { generatePix } from '../api/sigilopay';
import type { PixRequest, PixResponse } from '../api/sigilopay';
import { formatCurrency } from '../utils/gameMath';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function DepositModal({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(50);
  const [client, setClient] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Escutar a transação em tempo real!
  useEffect(() => {
    if (step === 2 && pixData?.transaction?.id) {
      const channel = supabase
        .channel(`transaction-${pixData.transaction.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `id=eq.${pixData.transaction.id}`,
          },
          (payload) => {
            if (payload.new.status === 'PAID') {
              setStep(3); // Vai para tela de Sucesso!
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [step, pixData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }
    if (!client.name || !client.email || !client.document || !client.phone) {
      setError("Preencha todos os dados do cliente.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data: PixRequest = { amount, client, profileId: userId };
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
    // Isso é só para você testar clicando, simulando o webhook!
    if (pixData?.transaction?.id) {
       await supabase
        .from('transactions')
        .update({ status: 'PAID' })
        .eq('id', pixData.transaction.id);
        
       // Além do status, o webhook também adiciona o saldo no banco. Simulando:
       const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
       if (profile) {
         await supabase.from('profiles').update({ balance: Number(profile.balance) + amount }).eq('id', userId);
       }
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setPixData(null);
    setAmount(50);
    setClient({ name: '', email: '', document: '', phone: '' });
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
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-background">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Depositar via PIX</h2>
          <button onClick={resetAndClose} className="text-textMuted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Valor (R$)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                        amount === val ? 'bg-primary border-primary text-white' : 'bg-background border-white/5 text-textMuted hover:bg-surfaceHover'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Nome Completo</label>
                <input
                  type="text"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="Seu nome"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block">E-mail</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-textMuted font-bold uppercase mb-1 block">CPF</label>
                  <input
                    type="text"
                    value={client.document}
                    onChange={(e) => setClient({ ...client, document: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-textMuted font-bold uppercase mb-1 block">Telefone</label>
                  <input
                    type="text"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-safe hover:bg-yellow-500 text-black font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'GERAR PIX'
                )}
              </button>
            </form>
          )}

          {step === 2 && pixData && (
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <h3 className="text-white font-bold text-xl mb-1">Pague o PIX</h3>
                <p className="text-sm text-textMuted flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Aguardando confirmação...
                </p>
              </div>

              {pixData.pix.image ? (
                <div className="bg-white p-2 rounded-xl">
                  <img src={pixData.pix.image} alt="QR Code PIX" className="w-48 h-48" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-background border border-white/10 rounded-xl flex items-center justify-center text-textMuted text-xs p-4">
                  QR Code indisponível
                </div>
              )}

              <div className="w-full">
                <label className="text-xs text-textMuted font-bold uppercase mb-1 block text-left">Pix Copia e Cola</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixData.pix.code}
                    className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-white text-xs"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-primary hover:bg-primaryHover text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="w-full bg-primary/10 border border-primary/20 rounded-lg p-4 text-left mt-2">
                 <p className="text-primary text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Esta tela mudará automaticamente quando a SigiloPay confirmar o pagamento via Webhook Supabase. Você pode simular o Webhook clicando abaixo:
                </p>
                <button
                  onClick={simulatePaymentReceived}
                  className="w-full mt-3 bg-primary hover:bg-primaryHover text-white text-sm font-bold py-2 rounded-lg"
                >
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
              <p className="text-textMuted">O valor de {formatCurrency(amount)} foi adicionado ao seu saldo com sucesso através do Webhook!</p>
              
              <button
                onClick={resetAndClose}
                className="w-full bg-surfaceHover hover:bg-white/10 text-white font-bold py-4 rounded-xl mt-4 transition-colors"
              >
                VOLTAR AO JOGO
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
