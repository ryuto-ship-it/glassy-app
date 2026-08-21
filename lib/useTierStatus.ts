import { getGlasNeededAtPrice, getTierById, getTierProgress } from '@/constants/glow';
import { GLAS_PRICE_USD, GLAS_PRICE_USD_YESTERDAY } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';

// Single source of truth for "how close am I to the next Glow Level" —
// entry is decided by USD value (held GLAS × current mock price), and the
// achieved tier itself is permanent (see store/useAppStore.ts). This hook
// only ever reports live progress toward the NEXT tier; it never demotes.
export function useTierStatus() {
  const achievedTierId = useAppStore((s) => s.achievedTier);
  const achievedAt = useAppStore((s) => s.achievedAt);
  const achievedAtPrice = useAppStore((s) => s.achievedAtPrice);
  const totalGlas = useAppStore((s) => s.totalGlas());

  const tier = getTierById(achievedTierId);
  const { next, progress, remainingGlas, usdValue } = getTierProgress(tier, totalGlas, GLAS_PRICE_USD);
  const remainingGlasYesterday = getGlasNeededAtPrice(tier, totalGlas, GLAS_PRICE_USD_YESTERDAY);
  const remainingDelta = remainingGlas - remainingGlasYesterday;

  return {
    tier,
    next,
    progress,
    remainingGlas,
    remainingDelta,
    usdValue,
    totalGlas,
    price: GLAS_PRICE_USD,
    achievedAt,
    achievedAtPrice,
  };
}
