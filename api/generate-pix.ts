import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, client, profileId } = req.body;

    const PUBLIC_KEY = process.env.SIGILOPAY_PUBLIC_KEY || 'caslusiqueira2_tdrs2cumsynt4550';
    const SECRET_KEY = process.env.SIGILOPAY_SECRET_KEY || '1kehz0guqz082talkgiv0tt1wdq8ytqol5b62ulqd8oosg0l50xif37iqkdow10n';
    const SUPABASE_URL = 'https://prawszeepeowvakyxldt.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_' + 'KiAXq0FYf5Wz9uusIwxKyg_w4gt6SsA';

    if (!PUBLIC_KEY || !SECRET_KEY) {
      return res.status(500).json({ error: "Chaves SigiloPay não configuradas" });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const identifier = Math.random().toString(36).substring(2, 12);

    const sigilopayRes = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': PUBLIC_KEY,
        'x-secret-key': SECRET_KEY,
      },
      body: JSON.stringify({
        identifier,
        amount,
        client,
        metadata: {
          provider: "MinesGame Vercel",
          orderId: identifier
        },
        // A URL do seu projeto Vercel precisa estar configurada nas variáveis de ambiente depois
        // Mas por padrão, a Vercel preenche VERCEL_URL
        callbackUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/webhook` : ''
      })
    });

    if (!sigilopayRes.ok) {
      const errorData = await sigilopayRes.json();
      throw new Error(errorData.message || 'Erro ao gerar PIX na SigiloPay');
    }

    const pixData = await sigilopayRes.json();

    const { data: dbData, error: dbError } = await supabase
      .from('transactions')
      .insert({
        profile_id: profileId,
        amount: amount,
        status: 'PENDING',
        sigilopay_id: pixData.transactionId,
        pix_code: pixData.pix.code,
        pix_image: pixData.pix.image
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return res.status(200).json({
      transaction: dbData,
      pix: pixData.pix
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
