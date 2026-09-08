import { getCharmNeededAtPrice, getTierById, getTierProgress } from '@/constants/glow';
import { CHARM_PRICE_USD, CHARM_PRICE_USD_YESTERDAY } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';

// Single source of truth for "how close am I to the next Glow Level" —
// entry is decided by USD value (held CHARM × current mock price), and the
// achieved tier itself is permanent (see store/useAppStore.ts). This hook
// only ever reports live progress toward the NEXT tier; it never demotes.
export function useTierStatus() {
  const achievedTierId = useAppStore((s) => s.achievedTier);
  const achievedAt = useAppStore((s) => s.achievedAt);
  const achievedAtPrice = useAppStore((s) => s.achievedAtPrice);
  const totalCharm = useAppStore((s) => s.totalCharm());

  const tier = getTierById(achievedTierId);
  const { next, progress, remainingCharm, usdValue } = getTierProgress(tier, totalCharm, CHARM_PRICE_USD);
  const remainingCharmYesterday = getCharmNeededAtPrice(tier, totalCharm, CHARM_PRICE_USD_YESTERDAY);
  const remainingDelta = remainingCharm - remainingCharmYesterday;

  return {
    tier,
    next,
    progress,
    remainingCharm,
    remainingDelta,
    usdValue,
    totalCharm,
    price: CHARM_PRICE_USD,
    achievedAt,
    achievedAtPrice,
  };
}
