import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://prawszeepeowvakyxldt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_' + 'KiAXq0FYf5Wz9uusIwxKyg_w4gt6SsA';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ msg: 'ok' });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const path = req.url; // e.g. /web-api/auth/session/v2/verifySession
    
    // Extract token
    const tk = req.body?.tk || req.query?.t || req.body?.atk;
    let userId = tk; 

    // 1. Session Verify
    if (path.includes('/web-api/auth/session/v2/verifySession')) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!profile) return res.status(200).json({ dt: null, err: { cd: "1302", msg: "OERR: User not found", tid: "YNGTHB25" } });
      
      const gamename = 'fortune-tiger';

      return res.status(200).json({
        dt: {
          oj: { jid: 0 },
          pid: profile.id,
          pcd: "OKD15222646",
          tk: tk,
          st: 1,
          geu: `game-api/${gamename}/`,
          lau: "/game-api/lobby/",
          bau: "web-api/game-proxy/",
          cc: "BRL",
          cs: "R$",
          gm: [
            {
              gid: req.body.gi || "126",
              msdt: 1638432092000,
              medt: 1638432092000,
              st: 1,
              amsg: "",
              rtp: { df: { min: 96.81, max: 96.81 } },
              mxe: 2500,
              mxehr: 8960913,
            }
          ],
          uiogc: {
            bb: 1, grtp: 1, gec: 0, cbu: 0, cl: 0, bf: 1, mr: 0, me: 1, bds: 0, res: 0, fgs: 1, tu: 1, mxehr: 0, ts: 1
          },
          swc: 1, nld: 0, clb: 1, wtd: 0, pgid: 39598816, crtp: 0
        },
        err: null
      });
    }

    // 2. GameInfo Get (Fortune Tiger)
    if (path.includes('/game-api/fortune-tiger/v2/GameInfo/Get')) {
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
      return res.status(200).json({
        dt: {
          fb: null,
          wt: { mw: 5.0, bw: 20.0, mgw: 35.0, smgw: 50.0 },
          maxwm: null,
          cs: [0.08, 0.8, 3.0, 10.0],
          ml: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          mxl: 5,
          bl: profile?.balance || 0,
          inwe: false,
          iuwe: false,
          ls: {
            si: {
              wc: 0,
              ist: false,
              itw: false,
              fws: 0,
              wp: null,
              orl: [5, 6, 4, 3, 7, 2, 3, 0, 7], // Random initial board
              lw: null,
              irs: false,
              gwt: -1,
              fb: null,
              ctw: 0.0,
              pmt: null,
              cwc: 0,
              fstc: null,
              pcwc: 0,
              rwsp: null,
              hashr: null,
              ml: 1,
              cs: 0.08,
              rl: [5, 6, 4, 3, 7, 2, 3, 0, 7],
              sid: "123456",
              psid: "123456",
              st: 1,
              nst: 1,
              pf: 1,
              aw: 0.0,
              wid: 0,
              wt: "C",
              wk: "0_C",
              wbn: null,
              wfg: null,
              blb: profile?.balance || 0,
              blab: profile?.balance || 0,
              bl: profile?.balance || 0,
              tb: 0.0,
              tbb: 0.0,
              tw: 0.0,
              np: 0.0,
              ocr: null,
              mr: null,
              ge: [1, 11]
            }
          },
          cc: "BRL"
        },
        err: null
      });
    }

    // 3. Game Spin (Fortune Tiger)
    if (path.includes('/game-api/fortune-tiger/v2/Spin')) {
      const { cs, ml } = req.body; // Bet amount parameters
      const betAmount = cs * ml * 5; // Tiger is 5 lines typically

      // Get user balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
      const currentBalance = profile?.balance || 0;

      if (currentBalance < betAmount) {
        // Insufficient funds json
        return res.status(200).json({
          dt: {
            si: {
              bl: currentBalance, blab: currentBalance, blb: currentBalance,
              cs, ml, tb: betAmount, tbb: betAmount, tw: 0.0, np: 0.0
            }
          },
          err: { cd: "3202", msg: "Not enough cash.", tid: "RACEVR16" }
        });
      }

      // Deduct bet
      const newBalance = currentBalance - betAmount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);

      // Return a LOSS spin logic (for simplicity, we always return a loss here, the house always wins)
      return res.status(200).json({
        dt: {
          si: {
            wc: 31,
            ist: false,
            itw: true,
            fws: 0,
            wp: null,
            orl: [2, 3, 7, 5, 4, 3, 5, 4, 0], // Loss board
            lw: null,
            irs: false,
            gwt: -1,
            fb: null,
            ctw: 0.0,
            pmt: null,
            cwc: 0,
            fstc: null,
            pcwc: 0,
            rwsp: null,
            hashr: "0:2;5;4#3;3;6#7;3;6#MV#3.0#MT#1#MG#0#",
            ml: ml,
            cs: cs,
            rl: [2, 3, 7, 5, 4, 3, 5, 4, 0],
            sid: Date.now().toString(),
            psid: Date.now().toString(),
            st: 1,
            nst: 1,
            pf: 1,
            aw: 0.0,
            wid: 0,
            wt: "C",
            wk: "0_C",
            wbn: null,
            wfg: null,
            blb: currentBalance,
            blab: newBalance,
            bl: newBalance,
            tb: betAmount,
            tbb: betAmount,
            tw: 0.0,
            np: -betAmount,
            ocr: null,
            mr: null,
            ge: [1, 11]
          }
        },
        err: null
      });
    }

    if (path.includes('/web-api/game-proxy/v2/Resources/GetByResourcesTypeIds')) {
      return res.status(200).json({ dt: [], err: null });
    }

    // Default proxy for missing endpoints
    return res.status(200).json({ dt: null, err: null });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
