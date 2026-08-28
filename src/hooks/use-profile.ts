import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  balance: number;
  role: string;
  email?: string;
}

const ADMIN_EMAIL = 'christianlucas12@gmail.com';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string, userEmail: string | undefined) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      // Força admin se for o email correto, independente do banco
      const role = userEmail === ADMIN_EMAIL ? 'admin' : (data.role ?? 'user');
      // Atualiza silenciosamente no banco se necessário
      if (userEmail === ADMIN_EMAIL && data.role !== 'admin') {
        supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then(() => {});
      }
      setProfile({ ...data, role });
    } else if (error?.code === 'PGRST116') {
      // Perfil não existe — cria automaticamente
      const isAdmin = userEmail === ADMIN_EMAIL;
      const newProfile: Profile = { id: userId, balance: 0, role: isAdmin ? 'admin' : 'user', email: userEmail };
      await supabase.from('profiles').insert([newProfile]);
      setProfile(newProfile);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Usa getSession() — igual ao __root.tsx — para não ter corrida de dados
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Atualiza quando a sessão mudar (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true);
        loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const persistBalance = async (newBalance: number) => {
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, balance: newBalance } : null);
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', profile.id);
  };

  return { profile, loading, persistBalance };
}
