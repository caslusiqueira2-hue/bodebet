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
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const persistBalance = async (newBalance: number) => {
    if (!user) return;
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
  };

  return { profile, loading: false, persistBalance };
}
