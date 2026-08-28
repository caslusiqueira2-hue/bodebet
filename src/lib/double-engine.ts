export type DoubleColor = 'red' | 'white' | 'black';

export const DOUBLE_MULTIPLIERS = {
  red: 2,
  black: 2,
  white: 14,
};

export const DOUBLE_COLORS = {
  red: '#e11d48',
  black: '#1f2937',
  white: '#ffffff',
};

export function generateStrip(targetColor: DoubleColor, stripLength = 80, targetIndex = 70): DoubleColor[] {
  const colors: DoubleColor[] = [];
  for (let i = 0; i < stripLength; i++) {
    if (i === targetIndex) {
      colors.push(targetColor);
      continue;
    }
    const r = Math.random();
    colors.push(r > 0.93 ? 'white' : r > 0.46 ? 'red' : 'black');
  }
  return colors;
}

export function drawDouble(): DoubleColor {
  const r = Math.random();
  if (r < 1 / 15) return 'white';
  if (r < 8 / 15) return 'red';
  return 'black';
}

