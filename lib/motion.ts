import { FadeIn, FadeInDown } from 'react-native-reanimated';

const DEFAULT_STEP = 70;
const DEFAULT_DURATION = 340;
const MAX_DELAY = 480;

// Reusable "list items appear one after another" entrance — pass the
// item's index and it returns a Reanimated `entering=` builder with a
// capped, index-scaled delay so long lists don't take forever to finish.
// Collapses to a quick uniform fade (no delay, no slide) under
// reduce-motion.
export function staggerEnter(
  index: number,
  opts?: { step?: number; duration?: number; base?: number; max?: number },
  reducedMotion?: boolean
) {
  if (reducedMotion) return FadeIn.duration(150);
  const step = opts?.step ?? DEFAULT_STEP;
  const base = opts?.base ?? 0;
  const max = opts?.max ?? MAX_DELAY;
  const delay = base + Math.min(index * step, max);
  return FadeInDown.delay(delay).duration(opts?.duration ?? DEFAULT_DURATION);
}
