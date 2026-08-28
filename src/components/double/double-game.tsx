import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useDemoWallet } from '@/hooks/use-demo-wallet';
import { type DoubleColor, DOUBLE_MULTIPLIERS, generateStrip, drawDouble } from '@/lib/double-engine';
import { Gem, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DoubleGame() {
  const { balance, debit, credit } = useDemoWallet({ defaultBet: 10 });
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedColor, setSelectedColor] = useState<DoubleColor | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'resolved'>('idle');
  const [strip, setStrip] = useState<DoubleColor[]>([]);
  const [history, setHistory] = useState<DoubleColor[]>([]);
  const [winStatus, setWinStatus] = useState<boolean | null>(null);

  const controls = useAnimation();
  const TILE_WIDTH = 80;
  const GAP = 8;
  const TARGET_INDEX = 70;

  // Inicializa uma fita aleatória no começo
  useEffect(() => {
    setStrip(generateStrip('red', 100, TARGET_INDEX));
  }, []);

  const handleBet = async () => {
    if (!selectedColor) return;
    if (betAmount <= 0) return;
    if (!debit(betAmount)) return;

    setGameState('spinning');
    setWinStatus(null);
    
    // Sortear o backend
    const winningColor = drawDouble();
    const newStrip = generateStrip(winningColor, 100, TARGET_INDEX);
    setStrip(newStrip);

    // Reseta a fita para x: 0
    await controls.set({ x: 0 });

    // Calcula a posição para parar (o centro do TARGET_INDEX deve ficar no centro da tela)
    // Container deve ter um width. Para facilitar, movemos baseado no tile + gap.
    const stopPosition = (TARGET_INDEX * (TILE_WIDTH + GAP)) - (3 * (TILE_WIDTH + GAP)); // Ajuste fino visual
    
    // Animação com variação aleatória de parada
    const randomOffset = Math.random() * 40 - 20; 

    await controls.start({
      x: -(stopPosition + randomOffset),
      transition: { duration: 6, ease: [0.15, 0.85, 0.25, 1] } // Suave no final
    });

    setGameState('resolved');
    setHistory(prev => [winningColor, ...prev].slice(0, 15));

    if (selectedColor === winningColor) {
      setWinStatus(true);
      const payout = betAmount * DOUBLE_MULTIPLIERS[winningColor];
      credit(payout);
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
    return 'Você Perdeu';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PAINEL DE APOSTAS */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-background/50 border border-white/10 rounded-2xl p-5 flex flex-col gap-6">
        <div className="flex bg-black/40 p-1 rounded-lg">
          <button className="flex-1 bg-surfaceHover text-white py-2 rounded-md text-sm font-bold shadow">Normal</button>
          <button className="flex-1 text-textMuted py-2 text-sm font-bold hover:text-white">Auto</button>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-textMuted uppercase">Quantia (R$)</label>
            <span className="text-xs font-bold text-white">Saldo: R$ {balance.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={gameState === 'spinning'}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 text-white font-bold focus:border-primary outline-none"
            />
            <button onClick={() => setBetAmount(b => Math.max(1, b / 2))} className="bg-surfaceHover text-white px-3 rounded-lg text-sm font-bold">1/2</button>
            <button onClick={() => setBetAmount(b => b * 2)} className="bg-surfaceHover text-white px-3 rounded-lg text-sm font-bold">2x</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-textMuted uppercase">Escolha uma Cor</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedColor('red')}
              disabled={gameState === 'spinning'}
              className={cn("flex-1 py-4 rounded-xl font-black text-lg transition-transform active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'red' ? "border-white bg-[#e11d48] text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]" : "border-transparent bg-[#e11d48]/80 text-white/80 hover:bg-[#e11d48]"
              )}
            >
              2x
            </button>
            <button 
              onClick={() => setSelectedColor('white')}
              disabled={gameState === 'spinning'}
              className={cn("flex-1 py-4 rounded-xl font-black text-lg transition-transform active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'white' ? "border-primary bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "border-transparent bg-white/90 text-black/80 hover:bg-white"
              )}
            >
              <Gem className="w-6 h-6 mb-1 text-rose-500" />
              14x
            </button>
            <button 
              onClick={() => setSelectedColor('black')}
              disabled={gameState === 'spinning'}
              className={cn("flex-1 py-4 rounded-xl font-black text-lg transition-transform active:scale-95 flex flex-col items-center justify-center border-2",
                selectedColor === 'black' ? "border-white bg-[#1f2937] text-white shadow-[0_0_15px_rgba(31,41,55,0.5)]" : "border-transparent bg-[#1f2937]/80 text-white/80 hover:bg-[#1f2937]"
              )}
            >
              2x
            </button>
          </div>
        </div>

        <button 
          onClick={handleBet}
          disabled={!selectedColor || gameState === 'spinning' || betAmount > balance}
          className="w-full py-5 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 text-white disabled:opacity-50 disabled:active:scale-100 mt-auto"
          style={{ backgroundColor: gameState === 'spinning' ? '#374151' : selectedColor === 'red' ? '#e11d48' : selectedColor === 'white' ? '#d1d5db' : selectedColor === 'black' ? '#1f2937' : '#22c55e' }}
        >
          {gameState === 'spinning' ? 'Girando...' : !selectedColor ? 'Escolha uma Cor' : 'Começar Jogo'}
        </button>
      </div>

      {/* ÁREA DO JOGO */}
      <div className="flex-1 flex flex-col bg-background/30 border border-white/5 rounded-2xl overflow-hidden">
        
        {/* Roleta Visual */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8 min-h-[300px]">
          <h2 className={cn("text-2xl md:text-3xl font-black mb-8 uppercase tracking-widest", 
            winStatus === true ? "text-green-500" : winStatus === false ? "text-red-500" : "text-white"
          )}>
            {getStatusText()}
          </h2>

          <div className="relative w-full max-w-[800px] h-[100px] flex items-center overflow-hidden rounded-xl border-y-2 border-white/10 bg-black/40">
            {/* Linha Central (Marcador) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-10 -translate-x-1/2 shadow-[0_0_10px_white]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-red-500 z-20 -translate-x-1/2" />

            <motion.div 
              className="flex gap-[8px] px-[50vw] md:px-[400px]"
              animate={controls}
            >
              {strip.map((color, i) => (
                <div 
                  key={i} 
                  className={cn("w-[80px] h-[80px] flex-shrink-0 rounded-lg flex items-center justify-center shadow-inner",
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
        <div className="bg-black/40 p-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3 text-textMuted">
            <History className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Giros Anteriores</span>
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {history.map((color, i) => (
              <div 
                key={i} 
                className={cn("w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center shadow",
                  color === 'red' ? "bg-[#e11d48]" : color === 'white' ? "bg-white" : "bg-[#1f2937]"
                )}
              >
                {color === 'white' && <Gem className="w-4 h-4 text-rose-500" />}
              </div>
            ))}
            {history.length === 0 && <span className="text-xs text-textMuted">Nenhum giro ainda</span>}
          </div>
        </div>

      </div>
    </div>
  );
}

