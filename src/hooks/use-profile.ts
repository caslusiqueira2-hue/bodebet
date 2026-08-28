import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  balance: number;
  role: string;
  email?: string;
  full_name?: string;
  cpf?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  is_completed?: boolean;
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
      const role = userEmail === ADMIN_EMAIL ? 'admin' : (data.role ?? 'user');
      if (userEmail === ADMIN_EMAIL && data.role !== 'admin') {
        supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then(() => {});
      }
      setProfile({ ...data, role });
    } else if (error?.code === 'PGRST116') {
      const isAdmin = userEmail === ADMIN_EMAIL;
      const newProfile: Profile = { 
        id: userId, balance: 0, role: isAdmin ? 'admin' : 'user', email: userEmail, is_completed: false 
      };
      await supabase.from('profiles').insert([newProfile]);
      setProfile(newProfile);
    }
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setLoading(true);
        loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const persistBalance = async (newBalance: number) => {
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, balance: newBalance } : null);
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', profile.id);
  };

  const updateProfileData = async (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    await supabase.from('profiles').update(updates).eq('id', profile.id);
  };

  return { profile, loading, persistBalance, updateProfileData };
}
