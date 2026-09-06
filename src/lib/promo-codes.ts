import { supabase } from '@/lib/supabase';

export type PromoCode = {
  id: string;
  code: string;
  multiplier: number; // default 2 (dobra o valor)
  active: boolean;
  description?: string;
  created_at: string;
  uses_count: number;
};

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-dobro',
    code: 'DOBRO',
    multiplier: 2,
    active: true,
    description: 'Bônus de 100%: seu primeiro depósito dobra de valor automaticamente!',
    created_at: new Date().toISOString(),
    uses_count: 0,
  },
  {
    id: 'promo-bode100',
    code: 'BODE100',
    multiplier: 2,
    active: true,
    description: 'Bônus VIP da BodeBet: dobre o valor do seu depósito via Pix.',
    created_at: new Date().toISOString(),
    uses_count: 0,
  }
];

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('global_settings')
      .select('mines_difficulty')
      .eq('id', 2)
      .single();

    if (error || !data || !data.mines_difficulty) {
      // Se ainda não existir a linha 2, salva a inicial
      await savePromoCodes(DEFAULT_PROMO_CODES);
      return DEFAULT_PROMO_CODES;
    }

    const parsed = JSON.parse(data.mines_difficulty);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_PROMO_CODES;
  } catch (err) {
    console.error('Erro ao buscar códigos promocionais:', err);
    return DEFAULT_PROMO_CODES;
  }
}

export async function savePromoCodes(codes: PromoCode[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('global_settings')
      .upsert({
        id: 2,
        mines_difficulty: JSON.stringify(codes),
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao salvar códigos promocionais:', err);
    return false;
  }
}

export async function validatePromoCode(
  inputCode: string
): Promise<{ valid: boolean; promo?: PromoCode; message: string }> {
  const cleanInput = inputCode.trim().toUpperCase();
  if (!cleanInput) {
    return { valid: false, message: 'Digite um código promocional.' };
  }

  const allCodes = await getPromoCodes();
  const found = allCodes.find((c) => c.code.trim().toUpperCase() === cleanInput);

  if (!found) {
    return { valid: false, message: 'Código promocional inválido ou inexistente.' };
  }

  if (!found.active) {
    return { valid: false, message: 'Este código promocional foi desativado.' };
  }

  return {
    valid: true,
    promo: found,
    message: `Código ${found.code} aplicado! Bônus de ${((found.multiplier - 1) * 100).toFixed(0)}%: seu saldo será multiplicado por ${found.multiplier}x!`,
  };
}

export async function recordPromoCodeUsage(code: string): Promise<void> {
  try {
    const allCodes = await getPromoCodes();
    const updated = allCodes.map((item) => {
      if (item.code.trim().toUpperCase() === code.trim().toUpperCase()) {
        return { ...item, uses_count: (item.uses_count || 0) + 1 };
      }
      return item;
    });
    await savePromoCodes(updated);
  } catch (err) {
    console.error('Erro ao registrar uso do cupom:', err);
  }
}
