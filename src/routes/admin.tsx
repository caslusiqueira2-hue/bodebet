import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, ShieldAlert, Plus, Users, Settings } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
});

type UserProfile = {
  id: string;
  email: string | null;
  balance: number;
  role: string;
  created_at: string;
};

const ADMIN_EMAIL = 'christianlucas12@gmail.com';

function AdminDashboard() {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [amountToAdd, setAmountToAdd] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  // Verifica a sessão diretamente — não depende do useProfile para autorização
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionEmail(session?.user?.email ?? null);
      setSessionLoading(false);
    });
  }, []);

  // Redireciona apenas se tiver certeza que não é admin
  useEffect(() => {
    if (!sessionLoading && sessionEmail !== ADMIN_EMAIL) {
      toast.error('Acesso negado. Apenas administradores.');
      navigate({ to: '/' });
    }
  }, [sessionEmail, sessionLoading, navigate]);

  useEffect(() => {
    if (sessionEmail === ADMIN_EMAIL) {
      fetchUsers();
    }
  }, [sessionEmail]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    if (error) toast.error('Erro ao buscar usuários');
  }

  const handleAddBalance = async (userId: string, currentBalance: number) => {
    const amountStr = amountToAdd[userId];
    const amount = parseFloat(amountStr);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Digite um valor válido e positivo para adicionar.');
      return;
    }

    const newBalance = currentBalance + amount;

    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (error) {
      toast.error('Erro ao adicionar saldo');
    } else {
      toast.success(`Saldo adicionado com sucesso!`);
      setAmountToAdd(prev => ({ ...prev, [userId]: '' }));
      fetchUsers(); // Recarrega a lista
    }
  };

  if (sessionLoading || sessionEmail !== ADMIN_EMAIL) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-white">Carregando painel administrativo...</div>;
  }

  const filteredUsers = users.filter(u => 
    u.id.includes(search) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pt-8 pb-28 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        </div>

        <div className="flex gap-4 border-b border-border">
          <button 
            className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('users')}
          >
            <div className="flex items-center gap-2"><Users className="size-4"/> Usuários</div>
          </button>
          <button 
            className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="flex items-center gap-2"><Settings className="size-4"/> Configurações Globais</div>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar por email ou ID..." 
                className="pl-10 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Usuário (E-mail)</th>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Saldo Atual</th>
                    <th className="px-6 py-4 font-medium">Cargo</th>
                    <th className="px-6 py-4 font-medium text-right">Adicionar Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-foreground font-medium">{u.email || 'Sem e-mail (Antigo)'}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{u.id}</td>
                      <td className="px-6 py-4 text-primary font-bold">R$ {u.balance.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-24 h-9 bg-background"
                          min="0"
                          value={amountToAdd[u.id] || ''}
                          onChange={(e) => setAmountToAdd(prev => ({ ...prev, [u.id]: e.target.value }))}
                        />
                        <Button 
                          size="sm" 
                          className="bg-safe text-black hover:bg-yellow-500"
                          onClick={() => handleAddBalance(u.id, u.balance)}
                        >
                          <Plus className="size-4 mr-1" />
                          Adicionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Limites Globais (Simulação)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Aposta Mínima (R$)</label>
                  <Input type="number" defaultValue="1.00" className="mt-1 bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Aposta Máxima (R$)</label>
                  <Input type="number" defaultValue="1000.00" className="mt-1 bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status do Cassino</label>
                  <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option>Ativo (Aceitando Apostas)</option>
                    <option>Manutenção (Bloqueado)</option>
                  </select>
                </div>
                <Button className="w-full mt-2">Salvar Configurações Globais</Button>
              </div>
            </div>
          </div>
        )}

      </main>
      <SiteFooter />
    </div>
  );
}
