import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { GameState, Tile, GameHistoryItem, GameStats } from '../types/game';
import { generateMines, calculateMultiplier } from '../utils/gameMath';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';

const TOTAL_TILES = 25;

const defaultStats: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  cashouts: 0,
  maxMultiplier: 1,
  maxPayout: 0,
  totalProfit: 0,
};

export function useMinesGame(userId: string) {
  const [balance, setBalance] = useState<number>(0);
  const [role, setRole] = useState<string>('user');
  const [stats, setStats] = useLocalStorage<GameStats>('mines_stats', defaultStats);
  const [history, setHistory] = useLocalStorage<GameHistoryItem[]>('mines_history', []);
  
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [bet, setBet] = useState<number>(10.00);
  const [minesCount, setMinesCount] = useState<number>(5);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [safeTilesRevealed, setSafeTilesRevealed] = useState<number>(0);

  // Armazena a dificuldade global (easy, medium, hard)
  const difficultyRef = useRef<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    async function loadDifficulty() {
      const { data } = await supabase.from('global_settings').select('mines_difficulty').eq('id', 1).single();
      if (data && data.mines_difficulty) {
        difficultyRef.current = data.mines_difficulty;
      }
    }
    loadDifficulty();
  }, []);
  
  // Buscar saldo e cargo inicial do Supabase
  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase
        .from('profiles')
        .select('balance, role')
        .eq('id', userId)
        .single();
      
      if (data) {
        setBalance(Number(data.balance));
        setRole(data.role || 'user');
      }
    }
    if (userId) loadUserData();
  }, [userId]);

  // Escutar atualizações de saldo em tempo real (ex: vindo do webhook)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          setBalance(Number(payload.new.balance));
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const currentMultiplier = useMemo(() => {
    if (gameState === 'IDLE') return 1.0;
    return calculateMultiplier(TOTAL_TILES, minesCount, safeTilesRevealed);
  }, [gameState, minesCount, safeTilesRevealed]);

  const nextMultiplier = useMemo(() => {
    return calculateMultiplier(TOTAL_TILES, minesCount, safeTilesRevealed + 1);
  }, [minesCount, safeTilesRevealed]);

  const potentialPayout = useMemo(() => bet * currentMultiplier, [bet, currentMultiplier]);

  const saveHistoryAndStats = (result: GameState, payout: number, profit: number) => {
    const newHistoryItem: GameHistoryItem = {
      id: `game_${Date.now()}`,
      timestamp: new Date().toISOString(),
      bet,
      mines: minesCount,
      revealedSafeTiles: safeTilesRevealed,
      multiplier: currentMultiplier,
      result,
      payout,
      profit
    };

    setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));

    setStats(prev => ({
      totalGames: prev.totalGames + 1,
      wins: prev.wins + (result === 'WON' ? 1 : 0),
      losses: prev.losses + (result === 'LOST' ? 1 : 0),
      cashouts: prev.cashouts + (result === 'CASHED_OUT' ? 1 : 0),
      maxMultiplier: Math.max(prev.maxMultiplier, currentMultiplier),
      maxPayout: Math.max(prev.maxPayout, payout),
      totalProfit: prev.totalProfit + profit
    }));
  };

  const startGame = useCallback(async () => {
    if (gameState === 'PLAYING') return;
    if (bet < 0.10 || isNaN(bet)) return;
    if (bet > balance) return;
    if (minesCount < 1 || minesCount >= TOTAL_TILES) return;

    // Atualiza saldo local imediatamente e depois no banco
    setBalance(prev => prev - bet);
    supabase.from('profiles').update({ balance: balance - bet }).eq('id', userId).then();
    
    setTiles(generateMines(TOTAL_TILES, minesCount));
    setSafeTilesRevealed(0);
    setGameState('PLAYING');
  }, [gameState, bet, balance, minesCount, userId]);

  const revealAllMines = () => {
    setTiles(prev => prev.map(t => t.isMine ? { ...t, isRevealed: true } : t));
  };

  const revealTile = useCallback((id: number) => {
    if (gameState !== 'PLAYING') return;
    
    const tileIndex = tiles.findIndex(t => t.id === id);
    if (tileIndex === -1) return;
    const tile = tiles[tileIndex];
    if (tile.isRevealed) return;

    let isHittingMine = tile.isMine;

    // LÓGICA DA CASA SEMPRE VENCE (HOUSE EDGE)
    // Interceptamos o clique antes de revelar
    if (!isHittingMine && difficultyRef.current !== 'easy') {
      const difficulty = difficultyRef.current;
      
      // Quantidade de quadrados seguros sobrando
      const safeRemaining = (TOTAL_TILES - minesCount) - safeTilesRevealed;
      // Quantidade total de quadrados sobrando
      const totalRemaining = TOTAL_TILES - safeTilesRevealed;
      
      // Probabilidade matemática real de acertar uma safe
      const trueSafeProb = safeRemaining / totalRemaining;
      
      // Dificuldade reduz a chance real em X%
      // Medium: reduz em 15% a chance de sobrevivência
      // Hard: reduz em 40% a chance de sobrevivência
      let modifier = 1.0;
      if (difficulty === 'medium') modifier = 0.85;
      if (difficulty === 'hard') modifier = 0.60;
      
      const riggedSafeProb = trueSafeProb * modifier;
      
      // Rola o dado para ver se o jogador sobrevive a esse clique modificado
      const randomRoll = Math.random();
      
      if (randomRoll > riggedSafeProb) {
        // FORÇA A DERROTA
        // Pega uma bomba não revelada e troca de lugar com este bloco seguro clicado!
        isHittingMine = true;
      }
    }

    setTiles(prev => {
      const newTiles = [...prev];
      
      if (isHittingMine && !newTiles[tileIndex].isMine) {
        // Realiza o "swap" visual por trás dos panos
        const hiddenMineIndex = newTiles.findIndex(t => t.isMine && !t.isRevealed);
        if (hiddenMineIndex !== -1) {
          newTiles[hiddenMineIndex] = { ...newTiles[hiddenMineIndex], isMine: false };
          newTiles[tileIndex] = { ...newTiles[tileIndex], isMine: true };
        }
      }

      newTiles[tileIndex] = { ...newTiles[tileIndex], isRevealed: true };
      return newTiles;
    });

    if (isHittingMine) {
      // PERDEU
      setGameState('LOST');
      setTimeout(() => {
        setTiles(prev => prev.map(t => t.isMine ? { ...t, isRevealed: true } : t));
      }, 100);
      saveHistoryAndStats('LOST', 0, -bet);
    } else {
      // SAFE TILE ACERTADA
      const newRevealedCount = safeTilesRevealed + 1;
      setSafeTilesRevealed(newRevealedCount);

      if (newRevealedCount === TOTAL_TILES - minesCount) {
        // VENCEU O MÁXIMO POSSÍVEL (LIMPANDO TUDO)
        const finalMultiplier = calculateMultiplier(TOTAL_TILES, minesCount, newRevealedCount);
        const payout = bet * finalMultiplier;
        const profit = payout - bet;
        
        setBalance(prev => prev + payout);
        supabase.from('profiles').update({ balance: balance + payout }).eq('id', userId).then();
        setGameState('WON');
        setTimeout(() => {
          setTiles(prev => prev.map(t => t.isMine ? { ...t, isRevealed: true } : t));
        }, 100);
        saveHistoryAndStats('WON', payout, profit);
      }
    }
  }, [gameState, tiles, safeTilesRevealed, minesCount, bet, balance, userId]);

  const cashOut = useCallback(async () => {
    if (gameState !== 'PLAYING' || safeTilesRevealed === 0) return;

    const payout = potentialPayout;
    const profit = payout - bet;

    setBalance(prev => prev + payout);
    supabase.from('profiles').update({ balance: balance + payout }).eq('id', userId).then();
    
    setGameState('CASHED_OUT');
    revealAllMines();
    saveHistoryAndStats('CASHED_OUT', payout, profit);
  }, [gameState, safeTilesRevealed, potentialPayout, bet, balance, userId]);

  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setTiles([]);
    setSafeTilesRevealed(0);
  }, []);

  const addFunds = useCallback((amount: number) => {
    if (amount > 0) {
      setBalance(prev => prev + amount);
    }
  }, [setBalance]);

  return {
    gameState,
    balance,
    role,
    bet,
    setBet,
    minesCount,
    setMinesCount,
    tiles,
    safeTilesRevealed,
    currentMultiplier,
    nextMultiplier,
    potentialPayout,
    startGame,
    revealTile,
    cashOut,
    resetGame,
    history,
    stats,
    addFunds,
  };
}
