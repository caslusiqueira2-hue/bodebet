import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface Profile {
  id: string;
  balance: number;
  role: string;
  email?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      } else if (error && error.code === 'PGRST116') {
        // Perfil não existe — cria automaticamente
        const newProfile: Profile = {
          id: user.id,
          balance: 0,
          role: 'user',
          email: user.email,
        };
        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const persistBalance = async (newBalance: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
  };

  return { profile, loading, persistBalance };
}
