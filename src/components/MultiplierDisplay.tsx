
interface Props {
  currentMultiplier: number;
  nextMultiplier: number;
}

export const MultiplierDisplay: React.FC<Props> = ({ currentMultiplier, nextMultiplier }) => {
  return (
    <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Multiplier</span>
        <span className="text-2xl font-black text-white">{currentMultiplier.toFixed(2)}x</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Next</span>
        <span className="text-lg font-bold text-safe">{nextMultiplier.toFixed(2)}x</span>
      </div>
    </div>
  );
};
