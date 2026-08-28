import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, Phone, MapPin, Image as ImageIcon, Loader2, ShieldCheck } from 'lucide-react';
import { useProfile } from '../hooks/use-profile';
import { toast } from 'sonner';

export function ProfileCompletionModal() {
  const { profile, updateProfileData } = useProfile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    address: '',
    photo_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se o perfil não foi carregado, ou se já está completo, não exibe o modal
  if (!profile || profile.is_completed) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.cpf || !formData.phone || !formData.address) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileData({
        ...formData,
        is_completed: true,
      });
      toast.success('Perfil atualizado com sucesso! Jogos liberados.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface w-full max-w-md rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col max-h-[95vh]"
      >
        <div className="p-6 border-b border-white/5 bg-background text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Complete seu Perfil</h2>
          <p className="text-sm text-textMuted">
            Para sua segurança e conformidade com nossas políticas, você precisa preencher seus dados pessoais antes de acessar os jogos e realizar saques/depósitos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <div>
            <label className="text-xs text-textMuted font-bold uppercase mb-1 flex items-center gap-2"><User className="w-3 h-3"/> Nome Completo *</label>
            <input
              type="text" name="full_name"
              value={formData.full_name} onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="Digite seu nome completo" required
            />
          </div>

          <div>
            <label className="text-xs text-textMuted font-bold uppercase mb-1 flex items-center gap-2"><FileText className="w-3 h-3"/> CPF *</label>
            <input
              type="text" name="cpf"
              value={formData.cpf} onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="000.000.000-00" required
            />
          </div>

          <div>
            <label className="text-xs text-textMuted font-bold uppercase mb-1 flex items-center gap-2"><Phone className="w-3 h-3"/> Telefone (WhatsApp) *</label>
            <input
              type="text" name="phone"
              value={formData.phone} onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="(11) 99999-9999" required
            />
          </div>

          <div>
            <label className="text-xs text-textMuted font-bold uppercase mb-1 flex items-center gap-2"><MapPin className="w-3 h-3"/> Endereço Completo *</label>
            <input
              type="text" name="address"
              value={formData.address} onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="Rua, Número, Bairro, Cidade - UF" required
            />
          </div>

          <div>
            <label className="text-xs text-textMuted font-bold uppercase mb-1 flex items-center gap-2"><ImageIcon className="w-3 h-3"/> URL da Foto (Opcional)</label>
            <input
              type="url" name="photo_url"
              value={formData.photo_url} onChange={handleChange}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="https://exemplo.com/sua-foto.jpg"
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SALVAR E LIBERAR JOGOS'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
