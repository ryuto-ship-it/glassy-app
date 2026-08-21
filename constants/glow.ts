// Glow Level tier definitions — entry is decided by USD value of held GLAS
// (count × current mock price), NOT a raw GLAS count. Once a tier is
// achieved it is kept forever, even if price later drops — see
// store/useAppStore.ts `achievedTier` / `achievedAt` / `achievedAtPrice`.
// This file only knows about USD thresholds; it never demotes anyone.

export type TierId = 'bare-skin' | 'dewy-glow' | 'radiant-glass' | 'glass-skin';

export type Tier = {
  id: TierId;
  order: number;
  name: string;
  usdMin: number;
  usdMax: number | null;
  tagline: string;
  colors: readonly string[];
  accent: string;
  soft: string;
  discountPct: number;
  benefits: string[];
};

export const TIERS: Tier[] = [
  {
    id: 'bare-skin',
    order: 0,
    name: 'Bare Skin',
    usdMin: 0,
    usdMax: 99.99,
    tagline: 'Your glow journey starts here.',
    colors: ['#6B7280', '#9AA0AE'],
    accent: '#9AA0AE',
    soft: 'rgba(154,160,174,0.12)',
    discountPct: 0,
    benefits: ['구매 적립 리워드 지급', '멤버십 카드 발급', '커뮤니티 피드 참여', '표준 배송'],
  },
  {
    id: 'dewy-glow',
    order: 1,
    name: 'Dewy Glow',
    usdMin: 100,
    usdMax: 499.99,
    tagline: 'A little shine starts to show.',
    colors: ['#C2577D', '#E07A9E'],
    accent: '#E07A9E',
    soft: 'rgba(224,122,158,0.14)',
    discountPct: 3,
    benefits: ['전 상품 3% 상시 할인', '생일월 리워드 2배 적립', '신제품 얼리 액세스 알림', '우선 고객 지원'],
  },
  {
    id: 'radiant-glass',
    order: 2,
    name: 'Radiant Glass',
    usdMin: 500,
    usdMax: 1499.99,
    tagline: 'Light bends beautifully on you.',
    colors: ['#8C5CE0', '#B18CFF'],
    accent: '#B18CFF',
    soft: 'rgba(177,140,255,0.14)',
    discountPct: 7,
    benefits: ['전 상품 7% 상시 할인', '공동구매 우선 참여권', '전담 뷰티 컨시어지 채팅', '무료 익일배송'],
  },
  {
    id: 'glass-skin',
    order: 3,
    name: 'Glass Skin',
    usdMin: 1500,
    usdMax: null,
    tagline: 'Total clarity. Total glass.',
    colors: ['#B18CFF', '#8C5CE0', '#E8C468', '#F5F0FF'],
    accent: '#E8C468',
    soft: 'rgba(232,196,104,0.16)',
    discountPct: 15,
    benefits: ['전 상품 15% 상시 할인', '프리미엄 정기배송 무료', 'VIP 오프라인 라운지 초대', '신제품 최우선 시딩'],
  },
];

export function getTierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}

// Which tier a given USD value would qualify for RIGHT NOW. This is only
// ever used to decide whether to PROMOTE — never to demote an already
// achieved tier.
export function getTierForUsdValue(usdValue: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (usdValue >= TIERS[i].usdMin) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(tier: Tier): Tier | null {
  return TIERS.find((t) => t.order === tier.order + 1) ?? null;
}

// How many additional GLAS (at the given price) are needed to cross into
// the next tier, evaluated against the tier the user has already achieved
// (permanent — never recomputed downward).
export function getGlasNeededAtPrice(achievedTier: Tier, totalGlas: number, priceUsd: number): number {
  const next = getNextTier(achievedTier);
  if (!next) return 0;
  const usdValue = totalGlas * priceUsd;
  return Math.max(0, Math.ceil((next.usdMin - usdValue) / priceUsd));
}

export function getTierProgress(
  achievedTier: Tier,
  totalGlas: number,
  priceUsd: number
): { tier: Tier; next: Tier | null; progress: number; remainingGlas: number; usdValue: number } {
  const usdValue = totalGlas * priceUsd;
  const next = getNextTier(achievedTier);
  if (!next) return { tier: achievedTier, next: null, progress: 1, remainingGlas: 0, usdValue };
  const span = next.usdMin - achievedTier.usdMin;
  const into = usdValue - achievedTier.usdMin;
  const progress = Math.max(0, Math.min(1, into / span));
  const remainingGlas = getGlasNeededAtPrice(achievedTier, totalGlas, priceUsd);
  return { tier: achievedTier, next, progress, remainingGlas, usdValue };
}

export const STAKE_LOCKUP_DAYS = 30;
