import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// A deterministic, QR-code-*looking* grid — not a real scannable code, just
// a visual mock for demo flows (cash-QR checkout, blockchain receipt, etc).
// Seeded so the same `seed` always renders the same pattern.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const GRID = 15;
// The three corner "finder" squares every real QR code has, purely for
// visual authenticity.
const FINDER_CELLS = new Set<string>();
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    ['0,0', '0,12', '12,0'].forEach((origin) => {
      const [or, oc] = origin.split(',').map(Number);
      if (Math.max(Math.abs(r - 1), Math.abs(c - 1)) !== 1) {
        FINDER_CELLS.add(`${or + r},${oc + c}`);
      }
    });
  }
}

export function MockQRCode({ size = 160, seed = 42, color = '#0B0B0D' }: { size?: number; seed?: number; color?: string }) {
  const rand = seededRandom(seed);
  const cell = size / GRID;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" rx={10} />
        {Array.from({ length: GRID }).map((_, r) =>
          Array.from({ length: GRID }).map((_, c) => {
            const key = `${r},${c}`;
            const filled = FINDER_CELLS.has(key) || rand() > 0.58;
            if (!filled) return null;
            return (
              <Rect
                key={key}
                x={c * cell + 1}
                y={r * cell + 1}
                width={cell - 1.4}
                height={cell - 1.4}
                rx={1}
                fill={color}
              />
            );
          })
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: 'hidden' },
});
