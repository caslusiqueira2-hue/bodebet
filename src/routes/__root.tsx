import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { DepositModal } from '@/components/DepositModal';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import type { Session } from '@supabase/supabase-js';

interface RouterContext {
  session: Session | null;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsDepositOpen(true);
    document.addEventListener('open-deposit-modal', handleOpen);
    return () => document.removeEventListener('open-deposit-modal', handleOpen);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {session && (
        <>
          <DepositModal 
            isOpen={isDepositOpen} 
            onClose={() => setIsDepositOpen(false)} 
            userId={session.user.id} 
          />
          <ProfileCompletionModal />
        </>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}
