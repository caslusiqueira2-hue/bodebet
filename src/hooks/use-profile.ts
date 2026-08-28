import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface Profile {
  id: string;
  balance: number;
  role: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    
    async function fetchProfile() {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
      } else if (error && error.code === 'PGRST116') {
        // No row found, create it
        const newProfile = { id: user.id, balance: 0, role: 'user', email: user.email };
        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile);
      }
    }
    fetchProfile();
  }, [user]);

  const persistBalance = async (newBalance: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
  };

  return { profile, loading: false, persistBalance };
}
