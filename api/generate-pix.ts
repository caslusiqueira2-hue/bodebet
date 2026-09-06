import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, client, profileId, creditAmount, promoCode } = req.body;

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
          provider: "BodeBet",
          orderId: identifier
        },
        // Callback dinâmico suportando o domínio oficial bodebet.site e subdomínios Vercel
        callbackUrl: (() => {
          const reqHost = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string);
          if (reqHost && !reqHost.includes('localhost')) {
            const host = reqHost.split(',')[0].trim();
            const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
            return `${proto}://${host}/api/webhook`;
          }
          if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}/api/webhook`;
          }
          return 'https://bodebet.site/api/webhook';
        })()
      })
    });

    if (!sigilopayRes.ok) {
      const errorData = await sigilopayRes.json();
      throw new Error(errorData.message || 'Erro ao gerar PIX na SigiloPay');
    }

    const pixData = await sigilopayRes.json();

    const finalCredit = creditAmount && Number(creditAmount) > 0 ? Number(creditAmount) : amount;
    const { data: dbData, error: dbError } = await supabase
      .from('transactions')
      .insert({
        profile_id: profileId,
        amount: finalCredit,
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
