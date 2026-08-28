import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, ShieldAlert, Plus, Users, Settings, Save, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
});

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  is_completed: boolean;
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

  const [minesDifficulty, setMinesDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSessionEmail(session?.user?.email ?? null);
        setSessionLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSessionEmail(session?.user?.email ?? null);
        setSessionLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sessionLoading || !sessionEmail) return;

    if (sessionEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast.error(`Acesso negado. Seu e-mail (${sessionEmail}) não é administrador.`);
      navigate({ to: '/' });
    } else {
      fetchUsers();
      fetchSettings();
    }
  }, [sessionEmail, sessionLoading, navigate]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data as UserProfile[]);
    if (error) toast.error('Erro ao buscar usuários');
  }

  async function fetchSettings() {
    // Busca a configuração global (ID 1)
    const { data } = await supabase
      .from('global_settings')
      .select('mines_difficulty')
      .eq('id', 1)
      .single();
    
    if (data && data.mines_difficulty) {
      setMinesDifficulty(data.mines_difficulty);
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from('global_settings')
        .upsert({ id: 1, mines_difficulty: minesDifficulty });
      
      if (error) throw error;
      toast.success('Configurações salvas com sucesso! A banca agora opera com esta dificuldade.');
    } catch (err) {
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

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

  if (sessionLoading || !sessionEmail || sessionEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-white">Carregando painel administrativo...</div>;
  }

  const filteredUsers = users.filter(u => 
    u.id.includes(search) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.cpf && u.cpf.includes(search))
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
                placeholder="Pesquisar por email, nome, CPF ou ID..." 
                className="pl-10 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-4">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt="Foto de perfil" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-textMuted text-sm font-bold border border-white/5">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-lg">{user.full_name || 'Usuário Não Concluído'}</span>
                        {user.role === 'admin' && (
                          <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded uppercase font-bold">Admin</span>
                        )}
                        {user.is_completed ? (
                          <span className="bg-safe/20 text-safe text-xs px-2 py-0.5 rounded uppercase font-bold">Verificado</span>
                        ) : (
                          <span className="bg-warning/20 text-warning text-xs px-2 py-0.5 rounded uppercase font-bold">Incompleto</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-textMuted flex flex-col gap-1 mt-2">
                        <p><strong className="text-white/70">E-mail:</strong> {user.email || 'N/A'}</p>
                        <p><strong className="text-white/70">CPF:</strong> {user.cpf || 'N/A'}</p>
                        <p><strong className="text-white/70">Telefone:</strong> {user.phone || 'N/A'}</p>
                        <p><strong className="text-white/70">Endereço:</strong> {user.address || 'N/A'}</p>
                        <p><strong className="text-white/70">ID:</strong> <span className="font-mono text-xs">{user.id}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 bg-background p-4 rounded-lg border border-white/5 min-w-[250px]">
                    <div>
                      <p className="text-xs text-textMuted uppercase font-bold mb-1">Saldo em Conta</p>
                      <p className="text-2xl font-black text-safe">R$ {Number(user.balance).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        placeholder="Valor"
                        className="bg-card"
                        value={amountToAdd[user.id] || ''}
                        onChange={(e) => setAmountToAdd(prev => ({ ...prev, [user.id]: e.target.value }))}
                      />
                      <Button 
                        onClick={() => handleAddBalance(user.id, Number(user.balance))}
                        className="bg-primary hover:bg-primaryHover text-white gap-2 whitespace-nowrap"
                      >
                        <Plus className="size-4" /> Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">A Banca Sempre Vence</h2>
              
              <div className="mb-6">
                <p className="text-sm text-textMuted mb-6 flex items-start gap-2 bg-warning/10 border border-warning/20 p-3 rounded-lg text-warning">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  Altere a dificuldade dos jogos originais (como o Mines) para manipular a probabilidade real de vitória e garantir o lucro da casa. A interface visual do jogo permanecerá idêntica para o jogador.
                </p>

                <label className="text-sm font-bold text-white uppercase mb-3 block">
                  Dificuldade do Mines
                </label>
                <div className="flex flex-col gap-3">
                  
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${minesDifficulty === 'easy' ? 'bg-primary/20 border-primary' : 'bg-background border-white/10 hover:border-white/30'}`}>
                    <input 
                      type="radio" 
                      name="minesDifficulty" 
                      value="easy" 
                      checked={minesDifficulty === 'easy'} 
                      onChange={() => setMinesDifficulty('easy')}
                      className="w-4 h-4 accent-primary" 
                    />
                    <div>
                      <p className="font-bold text-white">Modo Fácil (Probabilidade Real)</p>
                      <p className="text-xs text-textMuted mt-1">O jogo funciona 100% na matemática real. Os resultados dependem puramente da sorte matemática.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${minesDifficulty === 'medium' ? 'bg-primary/20 border-primary' : 'bg-background border-white/10 hover:border-white/30'}`}>
                    <input 
                      type="radio" 
                      name="minesDifficulty" 
                      value="medium" 
                      checked={minesDifficulty === 'medium'} 
                      onChange={() => setMinesDifficulty('medium')}
                      className="w-4 h-4 accent-primary" 
                    />
                    <div>
                      <p className="font-bold text-white">Modo Médio (Casa Vence Mais)</p>
                      <p className="text-xs text-textMuted mt-1">Reduz as chances de vitória do jogador em 15% por clique. Bombas secretas podem aparecer onde seria seguro.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${minesDifficulty === 'hard' ? 'bg-primary/20 border-primary' : 'bg-background border-white/10 hover:border-white/30'}`}>
                    <input 
                      type="radio" 
                      name="minesDifficulty" 
                      value="hard" 
                      checked={minesDifficulty === 'hard'} 
                      onChange={() => setMinesDifficulty('hard')}
                      className="w-4 h-4 accent-primary" 
                    />
                    <div>
                      <p className="font-bold text-white">Modo Difícil (Lucro Máximo)</p>
                      <p className="text-xs text-textMuted mt-1">Reduz drasticamente as chances do jogador em 40% por clique. Extremamente difícil ganhar lucros altos.</p>
                    </div>
                  </label>

                </div>
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full bg-primary hover:bg-primaryHover text-white gap-2 font-bold py-6 text-lg"
              >
                {isSavingSettings ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Configurações</>}
              </Button>

            </div>

          </div>
        )}

      </main>
      
      <SiteFooter />
    </div>
  );
}
