import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import { type DoubleColor, DOUBLE_MULTIPLIERS, generateStrip, drawDouble } from '@/lib/double-engine';
import { Gem, History, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/casino-data';

export function DoubleGame() {
  const { profile, persistBalance } = useProfile();
  const balance = profile?.balance ?? 0;
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedColor, setSelectedColor] = useState<DoubleColor | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'resolved'>('idle');
  const [strip, setStrip] = useState<DoubleColor[]>([]);
  const [history, setHistory] = useState<DoubleColor[]>([]);
  const [winStatus, setWinStatus] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'normal' | 'auto'>('normal');

  const controls = useAnimation();
  const rouletteContainerRef = useRef<HTMLDivElement>(null);
  const TILE_WIDTH = 80;
  const GAP = 8;
  const TILE_PITCH = TILE_WIDTH + GAP; // 88px
  const TARGET_INDEX = 70;
  const STRIP_LENGTH = 100;

  // Inicializa uma fita e posiciona centralizada no marcador
  useEffect(() => {
    setStrip(generateStrip('red', STRIP_LENGTH, TARGET_INDEX));
    const containerWidth = rouletteContainerRef.current?.offsetWidth || 800;
    const initialX = (containerWidth / 2) - (10 * TILE_PITCH + TILE_WIDTH / 2);
    controls.set({ x: initialX });
  }, []);

  const handleBet = async () => {
    if (!selectedColor) return;
    if (betAmount <= 0) return;
    if (betAmount > balance) return;

    // Debita o saldo real
    const newBalanceAfterDebit = Math.max(0, balance - betAmount);
    await persistBalance(newBalanceAfterDebit);

    setGameState('spinning');
    setWinStatus(null);
    
    // Sortear o backend
    const winningColor = drawDouble();
    const newStrip = generateStrip(winningColor, STRIP_LENGTH, TARGET_INDEX);
    setStrip(newStrip);

    const containerWidth = rouletteContainerRef.current?.offsetWidth || 800;
    
    // Reseta suavemente para o ladrilho 10 antes de iniciar o giro
    const startX = (containerWidth / 2) - (10 * TILE_PITCH + TILE_WIDTH / 2);
    await controls.set({ x: startX });

    // Calcula a posição matemática exata para o TARGET_INDEX (70) parar no centro do contêiner
    // O ponteiro está em containerWidth / 2.
    // O centro do ladrilho TARGET_INDEX fica em TARGET_INDEX * TILE_PITCH + TILE_WIDTH / 2.
    // Jitter seguro de +-15px (ladrilho tem 80px, logo permanece 100% dentro da cor sorteada)
    const tileCenter = TARGET_INDEX * TILE_PITCH + TILE_WIDTH / 2;
    const jitter = (Math.random() - 0.5) * 30; // [-15px, +15px]
    const targetX = (containerWidth / 2) - tileCenter + jitter;

    await controls.start({
      x: targetX,
      transition: { duration: 5.5, ease: [0.12, 0.8, 0.2, 1] }
    });

    setGameState('resolved');
    setHistory(prev => [winningColor, ...prev].slice(0, 15));

    if (selectedColor === winningColor) {
      setWinStatus(true);
      const payout = betAmount * DOUBLE_MULTIPLIERS[winningColor];
      // Credita o prêmio real no Supabase
      await persistBalance(newBalanceAfterDebit + payout);
    } else {
      setWinStatus(false);
    }

    setTimeout(() => {
      setGameState('idle');
    }, 3000);
  };

  const getStatusText = () => {
    if (gameState === 'idle') return 'Faça sua aposta';
    if (gameState === 'spinning') return 'Girando...';
    if (winStatus) return 'Você Ganhou!';
    return 'Não foi dessa vez';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PAINEL DE APOSTAS */}
      <div className="w-full lg:w-84 flex-shrink-0 bg-card/90 border border-white/10 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
        {/* Toggle de Modo: Botões visíveis e destacados */}
        <div className="flex bg-background/80 p-1 rounded-xl border border-white/10">
          <button 
            type="button"
            onClick={() => setMode('normal')}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              mode === 'normal' 
                ? "bg-primary text-white shadow-md shadow-primary/30" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            Normal
          </button>
          <button 
            type="button"
            onClick={() => setMode('auto')}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              mode === 'auto' 
                ? "bg-primary text-white shadow-md shadow-primary/30" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            Auto
          </button>
        </div>

        {/* Campo de Aposta */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantia (R$)</label>
            <span className="text-xs font-black text-emerald-400 tabular-nums">
              Saldo: {formatBRL(balance)}
            </span>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'spinning'}
              className="flex-1 bg-background/90 border border-white/15 rounded-xl px-4 py-2.5 text-white font-bold focus:border-primary focus:outline-none"
              min={1}
            />
            {/* Botões de Aposta Rápida com bordas e fundos 100% visíveis */}
            <button 
              type="button"
              onClick={() => setBetAmount(b => Math.max(1, Math.floor(b / 2)))} 
              disabled={gameState === 'spinning'}
              className="bg-white/10 border border-white/15 hover:bg-white/20 text-white px-3.5 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
            >
              ½
            </button>
            <button 
              type="button"
              onClick={() => setBetAmount(b => Math.min(balance || 1000, b * 2))} 
              disabled={gameState === 'spinning'}
              className="bg-white/10 border border-white/15 hover:bg-white/20 text-white px-3.5 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
            >
              2x
            </button>
          </div>
        </div>

        {/* Escolha da Cor com Botões 100% Visíveis */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Escolha uma Cor</label>
          <div className="grid grid-cols-3 gap-2">
            {/* Vermelho */}
            <button 
              type="button"
              onClick={() => setSelectedColor('red')}
              disabled={gameState === 'spinning'}
              className={cn(
                "py-4 rounded-xl font-black text-base transition-all active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'red' 
                  ? "border-white bg-[#e11d48] text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-[1.03]" 
                  : "border-white/15 bg-[#e11d48]/85 text-white hover:bg-[#e11d48]"
              )}
            >
              <span className="text-lg">2x</span>
              <span className="text-[0.65rem] uppercase font-bold tracking-wider opacity-80">Vermelho</span>
            </button>

            {/* Branco (14x) */}
            <button 
              type="button"
              onClick={() => setSelectedColor('white')}
              disabled={gameState === 'spinning'}
              className={cn(
                "py-4 rounded-xl font-black text-base transition-all active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'white' 
                  ? "border-primary bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-[1.03]" 
                  : "border-white/30 bg-zinc-200 text-black hover:bg-white"
              )}
            >
              <Gem className="w-5 h-5 text-rose-600 mb-0.5" />
              <span className="text-lg leading-none">14x</span>
              <span className="text-[0.65rem] uppercase font-bold tracking-wider opacity-80">Branco</span>
            </button>

            {/* Preto */}
            <button 
              type="button"
              onClick={() => setSelectedColor('black')}
              disabled={gameState === 'spinning'}
              className={cn(
                "py-4 rounded-xl font-black text-base transition-all active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'black' 
                  ? "border-white bg-[#1f2937] text-white shadow-[0_0_15px_rgba(31,41,55,0.8)] scale-[1.03]" 
                  : "border-white/20 bg-[#1f2937]/90 text-white hover:bg-[#1f2937]"
              )}
            >
              <span className="text-lg">2x</span>
              <span className="text-[0.65rem] uppercase font-bold tracking-wider opacity-80">Preto</span>
            </button>
          </div>
        </div>

        {/* Botão Principal de Ação */}
        <button 
          type="button"
          onClick={handleBet}
          disabled={!selectedColor || gameState === 'spinning' || betAmount > balance || balance <= 0}
          className={cn(
            "w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2",
            gameState === 'spinning' 
              ? 'bg-zinc-700' 
              : selectedColor === 'red' 
              ? 'bg-[#e11d48] hover:bg-[#f43f5e] shadow-rose-600/30' 
              : selectedColor === 'white' 
              ? 'bg-zinc-100 text-black hover:bg-white shadow-white/20' 
              : selectedColor === 'black' 
              ? 'bg-zinc-800 hover:bg-zinc-700 border border-white/20' 
              : 'bg-primary hover:bg-primary/90 shadow-primary/30'
          )}
        >
          {gameState === 'spinning' 
            ? 'Girando...' 
            : !selectedColor 
            ? 'Selecione uma Cor' 
            : betAmount > balance 
            ? 'Saldo Insuficiente' 
            : 'Começar Jogo'}
        </button>
      </div>

      {/* ÁREA DO JOGO */}
      <div className="flex-1 flex flex-col bg-card/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Roleta Visual */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8 min-h-[320px]">
          <h2 className={cn("text-2xl md:text-3xl font-black mb-8 uppercase tracking-widest transition-colors", 
            winStatus === true ? "text-emerald-400" : winStatus === false ? "text-rose-400" : "text-white"
          )}>
            {getStatusText()}
          </h2>

          <div 
            ref={rouletteContainerRef}
            className="relative w-full max-w-[800px] h-[100px] flex items-center overflow-hidden rounded-2xl border-y-2 border-white/15 bg-black/60 shadow-inner"
          >
            {/* Linha Central (Marcador) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-10 -translate-x-1/2 shadow-[0_0_10px_white]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-red-500 z-20 -translate-x-1/2" />

            <motion.div 
              className="flex gap-[8px]"
              animate={controls}
            >
              {strip.map((color, i) => (
                <div 
                  key={i} 
                  className={cn("w-[80px] h-[80px] flex-shrink-0 rounded-xl flex items-center justify-center shadow-md",
                    color === 'red' ? "bg-[#e11d48]" : color === 'white' ? "bg-white" : "bg-[#1f2937]"
                  )}
                >
                  {color === 'white' && <Gem className="w-8 h-8 text-rose-500" />}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-black/50 p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <History className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Giros Anteriores</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {history.map((color, i) => (
              <div 
                key={i} 
                className={cn("w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center shadow border border-white/10",
                  color === 'red' ? "bg-[#e11d48]" : color === 'white' ? "bg-white" : "bg-[#1f2937]"
                )}
              >
                {color === 'white' && <Gem className="w-4 h-4 text-rose-500" />}
              </div>
            ))}
            {history.length === 0 && <span className="text-xs text-muted-foreground">Nenhum giro registrado ainda</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
