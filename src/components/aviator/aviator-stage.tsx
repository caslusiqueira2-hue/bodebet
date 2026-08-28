import { useEffect, useRef, useState } from 'react';
import { curveProgress, formatMultiplier } from '@/lib/aviator-engine';
import { cn } from '@/lib/utils';
import type { Phase } from './use-aviator';
import { AviatorPlane } from './aviator-assets';

const PAD = { left: 40, right: 80, top: 80, bottom: 40 };

type Point = { x: number; y: number };

function pointAt(seconds: number, width: number, height: number): Point {
  const { x, y } = curveProgress(seconds);
  return {
    x: PAD.left + x * Math.max(0, width - PAD.left - PAD.right),
    y: height - PAD.bottom - y * Math.max(0, height - PAD.top - PAD.bottom),
  };
}

export function AviatorStage({
  phase,
  multiplier,
  elapsed,
  countdown,
}: {
  phase: Phase;
  multiplier: number;
  elapsed: number;
  countdown: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { width, height } = size;
    if (!canvas || width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const crashed = phase === 'crashed';
    
    // Draw background particles/stars occasionally to give feeling of movement
    if (phase === 'flying') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for(let i=0; i<20; i++) {
        const px = (Math.random() * width + (elapsed * 200)) % width;
        const py = Math.random() * height;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stroke = crashed ? '#e0453e' : '#ff2a00';
    const samples = 64;
    const path: Point[] = [];
    for (let i = 0; i <= samples; i += 1) {
      path.push(pointAt((elapsed * i) / samples, width, height));
    }
    const tip = path[path.length - 1];

    // Glow under the curve
    const gradient = ctx.createLinearGradient(0, PAD.top, 0, height - PAD.bottom);
    gradient.addColorStop(0, crashed ? 'rgba(224, 69, 62, 0.6)' : 'rgba(255, 42, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.0)');

    ctx.beginPath();
    ctx.moveTo(PAD.left, height - PAD.bottom);
    path.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(tip.x, height - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // The line itself
    ctx.beginPath();
    path.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = crashed ? '#ff4d4d' : '#ff2a00';
    
    // Heavy Glow on the line
    ctx.shadowColor = crashed ? '#ff0000' : '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.stroke();
    
    // Inner core of the line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

  }, [size, elapsed, phase]);

  const { width, height } = size;
  const tip = pointAt(elapsed, width, height);
  const previous = pointAt(Math.max(0, elapsed - 0.4), width, height);
  // Calculate angle but clamp it a bit so it doesn't look totally weird
  let angle = (Math.atan2(tip.y - previous.y, tip.x - previous.x) * 180) / Math.PI;
  if (phase === 'betting') angle = 0;
  if (phase === 'crashed') angle += 45; // Crashed effect pointing down a bit

  return (
    <div
      ref={wrapperRef}
      className="relative h-[350px] w-full overflow-hidden rounded-3xl border-4 border-[#3a0a15] bg-black sm:h-[450px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
    >
      {/* Cinematic Night Sky Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 mix-blend-screen"
        style={{ backgroundImage: 'url("/aviator/premium/bg.jpg")' }}
      />
      
      {/* Crash Flash Effect */}
      {phase === 'crashed' && (
        <div className="absolute inset-0 bg-red-600/30 animate-in fade-in flash-animation z-10 pointer-events-none" />
      )}

      {/* Grid Overlay for realism (radar style) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      {/* Trajectory Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full z-20" />

      {/* Plane Asset */}
      {phase !== 'betting' && width > 0 ? (
        <span
          className={cn(
            'absolute transition-opacity duration-300 z-30',
            phase === 'crashed' ? 'opacity-0 scale-150 blur-md' : 'opacity-100 scale-100',
          )}
          style={{ 
            left: tip.x, 
            top: tip.y, 
            transform: 'translate(-50%, -50%) rotate(' + angle + 'deg)',
            transformOrigin: 'center center'
          }}
        >
          <AviatorPlane />
        </span>
      ) : null}

      {/* Central Multiplier Display */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 z-40">
        {phase === 'betting' ? (
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(255,0,0,0.3)] animate-pulse">
            <p className="text-xs font-black tracking-[0.4em] text-[#ffdf70] uppercase mb-2 shadow-black drop-shadow-md">
              Preparando Decolagem
            </p>
            <p className="font-black text-6xl text-white tabular-nums drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
              {countdown.toFixed(1)}s
            </p>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center transition-all duration-300",
            phase === 'crashed' ? "scale-110" : "scale-100"
          )}>
            {phase === 'crashed' && (
              <div className="bg-red-900/80 backdrop-blur-md px-6 py-2 rounded-full mb-4 border-2 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.6)]">
                <p className="font-black text-sm tracking-[0.3em] text-white uppercase">
                  Voou Longe
                </p>
              </div>
            )}
            <p
              className={cn(
                'font-black tabular-nums drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-colors',
                phase === 'crashed' ? 'text-[#ff4d4d] text-7xl sm:text-8xl' : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-[#ffdf70] to-[#ffaa00] text-7xl sm:text-8xl scale-[1.05] animate-pulse',
              )}
              style={{ WebkitTextStroke: phase === 'crashed' ? '2px #660000' : '2px #8a4400' }}
            >
              {formatMultiplier(multiplier)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

