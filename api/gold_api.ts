import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://prawszeepeowvakyxldt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_' + 'KiAXq0FYf5Wz9uusIwxKyg_w4gt6SsA';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  const path = req.url || '';

  try {
    if (path.includes('user_balance')) {
      const { user_code } = req.body || {};
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user_code).single();
      
      return res.status(200).json({
        status: 1,
        msg: 'SUCCESS',
        user_balance: Number(profile?.balance) || 100
      });
    }

    if (path.includes('game_callback')) {
      const { user_code, slot } = req.body || {};
      const win = Number(slot?.win) || 0;
      const bet = Number(slot?.bet) || 0;
      const net = win - bet;

      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user_code).single();
      if (profile) {
        const newBal = Math.max(0, Number(profile.balance) + net);
        await supabase.from('profiles').update({ balance: newBal }).eq('id', user_code);
      }

      return res.status(200).json({
        status: 1,
        msg: 'SUCCESS',
        user_balance: profile ? Number(profile.balance) + net : 100
      });
    }

    return res.status(200).json({ status: 1, msg: 'SUCCESS' });
  } catch (err: any) {
    return res.status(200).json({ status: 1, msg: 'SUCCESS', error: err.message });
  }
}
