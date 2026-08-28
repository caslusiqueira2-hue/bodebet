import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const { transactionId, status } = payload;

    if (!transactionId || !status) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const SUPABASE_URL = 'https://prawszeepeowvakyxldt.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_' + 'KiAXq0FYf5Wz9uusIwxKyg_w4gt6SsA';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (status === 'OK' || status === 'PAID') {
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('sigilopay_id', transactionId)
        .eq('status', 'PENDING')
        .single();

      if (txError || !tx) {
        return res.status(200).json({ message: "Transaction not found or already paid" });
      }

      await supabase
        .from('transactions')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', tx.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', tx.profile_id)
        .single();
        
      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: Number(profile.balance) + Number(tx.amount) })
          .eq('id', tx.profile_id);
      }
    } else {
       await supabase
        .from('transactions')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('sigilopay_id', transactionId);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
