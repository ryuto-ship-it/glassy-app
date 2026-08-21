import { create } from 'zustand';

import { getTierById, getTierForUsdValue, STAKE_LOCKUP_DAYS, TierId } from '@/constants/glow';
import {
  COMMUNITY_POSTS,
  CommunityPost,
  GLAS_PRICE_USD,
  LanguageCode,
  PRODUCTS,
  STAKE_ENTRIES,
  StakeEntry,
  Transaction,
  TRANSACTIONS,
  USER,
} from '@/data/mock';
import { addDays, daysSince } from '@/lib/date';

export type Toast = {
  id: string;
  message: string;
  glasAmount?: number;
};

export type PaymentMethod = 'stablecoin' | 'card' | 'glas' | 'cash';

type AppState = {
  // wallet — GLAS held, split by source
  purchaseEarnedGlas: number; // 구매 적립분
  directPurchaseGlas: number; // 등급 즉시구매분
  communityRewardGlas: number; // 커뮤니티 리워드분
  liquidBoughtGlas: number; // exchange-bought, not yet staked
  stakeEntries: StakeEntry[]; // 스테이킹 매수분 (matures after lockup)
  usdtBalance: number;
  usdcBalance: number;
  transactions: Transaction[];
  demoFastForward: boolean;

  // permanent tier record — set once on promotion, never re-evaluated
  // downward even if $GLAS price later drops (see checkTierPromotion).
  achievedTier: TierId;
  achievedAt: string;
  achievedAtPrice: number;

  // scan/translation display language — defaults from the profile's
  // country setting but is switchable from Profile for demo purposes.
  language: LanguageCode;

  // welcome gateway — only actually credits GLAS the first time; replaying
  // the welcome flow from the Profile tab still shows the full animation
  // but won't re-grant the bonus.
  welcomeBonusClaimed: boolean;

  // community
  posts: CommunityPost[];

  // ephemeral UI events
  toasts: Toast[];
  levelUpTier: TierId | null;

  // derived getters
  maturedStakedGlas: () => number;
  pendingStakedGlas: () => number;
  totalGlas: () => number;
  spendableGlas: () => number;

  // actions
  buyGlas: (usdtAmount: number) => void;
  stakeGlas: (amount: number) => void;
  unstakeEntry: (entryId: string) => { ok: boolean; reason?: string };
  toggleDemoFastForward: () => void;
  addCommunityPost: (caption: string, images: string[]) => void;
  createGroupBuyPost: (title: string, goalParticipants: number, discountPct: number) => void;
  toggleLike: (postId: string) => void;
  toggleFollow: (postId: string) => void;
  dismissToast: (id: string) => void;
  clearLevelUp: () => void;
  simulatePharmacyPurchase: (title: string, subtitle: string, usdAmount: number) => void;
  checkTierPromotion: () => void;
  spendGlas: (amount: number) => boolean;
  checkoutPurchase: (
    title: string,
    subtitle: string,
    priceUSD: number,
    method: PaymentMethod
  ) => { ok: boolean; reason?: string };
  buyTierDirect: (usdCost: number, method: 'stablecoin' | 'card') => void;
  claimWelcomeBonus: () => { credited: boolean; amount: number };
  setLanguage: (lang: LanguageCode) => void;
};

export const WELCOME_BONUS_GLAS = 500;

let idCounter = 1;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.floor(Math.random() * 10000)}`;
}

function isEntryMatured(entry: StakeEntry, fastForward: boolean): boolean {
  if (fastForward) return true;
  return daysSince(entry.startDate) >= STAKE_LOCKUP_DAYS;
}

export const useAppStore = create<AppState>((set, get) => ({
  purchaseEarnedGlas: USER.purchaseEarnedGlas,
  directPurchaseGlas: 0,
  communityRewardGlas: 0,
  liquidBoughtGlas: 0,
  stakeEntries: STAKE_ENTRIES,
  usdtBalance: USER.usdtBalance,
  usdcBalance: USER.usdcBalance,
  transactions: TRANSACTIONS,
  demoFastForward: false,

  achievedTier: USER.achievedTier,
  achievedAt: USER.achievedAt,
  achievedAtPrice: USER.achievedAtPrice,

  language: USER.language,
  welcomeBonusClaimed: false,

  posts: COMMUNITY_POSTS,

  toasts: [],
  levelUpTier: null,

  maturedStakedGlas: () => {
    const { stakeEntries, demoFastForward } = get();
    return stakeEntries
      .filter((e) => isEntryMatured(e, demoFastForward))
      .reduce((sum, e) => sum + e.amount, 0);
  },
  pendingStakedGlas: () => {
    const { stakeEntries, demoFastForward } = get();
    return stakeEntries
      .filter((e) => !isEntryMatured(e, demoFastForward))
      .reduce((sum, e) => sum + e.amount, 0);
  },
  totalGlas: () => {
    const { purchaseEarnedGlas, directPurchaseGlas, communityRewardGlas } = get();
    return purchaseEarnedGlas + directPurchaseGlas + communityRewardGlas + get().maturedStakedGlas();
  },
  // GLAS that can actually be spent at checkout (excludes locked stake entries).
  spendableGlas: () => {
    const { liquidBoughtGlas, purchaseEarnedGlas, directPurchaseGlas, communityRewardGlas } = get();
    return liquidBoughtGlas + purchaseEarnedGlas + directPurchaseGlas + communityRewardGlas;
  },

  // Promote (never demote) based on current USD value of held GLAS. Called
  // after any action that can change totalGlas().
  checkTierPromotion: () => {
    const { achievedTier, totalGlas } = get();
    const usdValue = totalGlas() * GLAS_PRICE_USD;
    const evaluated = getTierForUsdValue(usdValue);
    const current = getTierById(achievedTier);
    if (evaluated.order > current.order) {
      set({
        achievedTier: evaluated.id,
        achievedAt: new Date().toISOString(),
        achievedAtPrice: GLAS_PRICE_USD,
        levelUpTier: evaluated.id,
      });
    }
  },

  // Deduct GLAS spent at checkout from the liquid, spendable buckets only
  // (never from locked stake entries). Returns false if insufficient.
  spendGlas: (amount) => {
    const s = get();
    if (s.spendableGlas() < amount) return false;
    let remaining = amount;
    const takeFrom = (bucket: number) => {
      const take = Math.min(bucket, remaining);
      remaining -= take;
      return bucket - take;
    };
    const liquidBoughtGlas = takeFrom(s.liquidBoughtGlas);
    const purchaseEarnedGlas = takeFrom(s.purchaseEarnedGlas);
    const directPurchaseGlas = takeFrom(s.directPurchaseGlas);
    const communityRewardGlas = takeFrom(s.communityRewardGlas);
    set({ liquidBoughtGlas, purchaseEarnedGlas, directPurchaseGlas, communityRewardGlas });
    return true;
  },

  buyGlas: (usdtAmount) => {
    const glas = Math.round(usdtAmount / GLAS_PRICE_USD);
    set((s) => ({
      usdtBalance: s.usdtBalance - usdtAmount,
      liquidBoughtGlas: s.liquidBoughtGlas + glas,
      transactions: [
        {
          id: nextId('tx'),
          type: 'buy',
          title: '$GLAS 거래소 매수',
          subtitle: 'GLASSY EX 체결',
          date: new Date().toISOString(),
          glasDelta: glas,
          usdAmount: usdtAmount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${glas.toLocaleString()} GLAS 매수 완료`, glasAmount: glas }],
    }));
    // buying alone doesn't move totalGlas() (still unstaked), so no promotion check here.
  },

  stakeGlas: (amount) => {
    set((s) => ({
      liquidBoughtGlas: Math.max(0, s.liquidBoughtGlas - amount),
      stakeEntries: [...s.stakeEntries, { id: nextId('stake'), amount, startDate: new Date().toISOString() }],
      transactions: [
        {
          id: nextId('tx'),
          type: 'stake',
          title: '$GLAS 스테이킹 예치',
          subtitle: '30일 락업 시작',
          date: new Date().toISOString(),
          glasDelta: amount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${amount.toLocaleString()} GLAS 스테이킹 시작`, glasAmount: amount }],
    }));
    get().checkTierPromotion();
  },

  unstakeEntry: (entryId) => {
    const entry = get().stakeEntries.find((e) => e.id === entryId);
    if (!entry) return { ok: false, reason: '항목을 찾을 수 없어요.' };
    const matured = isEntryMatured(entry, get().demoFastForward);
    if (!matured) {
      const unlockAt = addDays(entry.startDate, STAKE_LOCKUP_DAYS);
      return { ok: false, reason: `아직 락업 기간이에요. ${unlockAt.getFullYear()}.${String(unlockAt.getMonth() + 1).padStart(2, '0')}.${String(unlockAt.getDate()).padStart(2, '0')} 이후 언스테이킹할 수 있어요.` };
    }
    set((s) => ({
      stakeEntries: s.stakeEntries.filter((e) => e.id !== entryId),
      liquidBoughtGlas: s.liquidBoughtGlas + entry.amount,
      transactions: [
        {
          id: nextId('tx'),
          type: 'unstake',
          title: '$GLAS 언스테이킹',
          subtitle: '지갑으로 회수',
          date: new Date().toISOString(),
          glasDelta: entry.amount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${entry.amount.toLocaleString()} GLAS 언스테이킹 완료` }],
    }));
    // note: unstaking lowers totalGlas(), but achievedTier is permanent — no re-check needed, no demotion possible.
    return { ok: true };
  },

  toggleDemoFastForward: () => {
    set((s) => ({ demoFastForward: !s.demoFastForward }));
    // flipping this can mature pending stakes instantly, which can cross a tier threshold.
    get().checkTierPromotion();
  },

  addCommunityPost: (caption, images) => {
    const reward = 25 + Math.floor(Math.random() * 15);
    set((s) => ({
      posts: [
        {
          id: nextId('post'),
          author: USER.name,
          avatar: USER.avatar,
          location: USER.location,
          images,
          caption,
          likes: 0,
          comments: [],
          isFollowing: true,
          createdAt: new Date().toISOString(),
          tags: [],
          glasEarned: reward,
        },
        ...s.posts,
      ],
      communityRewardGlas: s.communityRewardGlas + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'post_reward',
          title: '커뮤니티 후기 작성 리워드',
          subtitle: 'Glow Feed',
          date: new Date().toISOString(),
          glasDelta: reward,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: '후기 작성 완료!', glasAmount: reward }],
    }));
    get().checkTierPromotion();
  },

  // Influencer-only (see INFLUENCER_FOLLOWER_THRESHOLD) — opens a new
  // community group-buy post announcing the deal, same reward pattern as
  // a regular post.
  createGroupBuyPost: (title, goalParticipants, discountPct) => {
    const reward = 30;
    set((s) => ({
      posts: [
        {
          id: nextId('post'),
          author: USER.name,
          avatar: USER.avatar,
          location: USER.location,
          images: [],
          caption: `[공동구매 개설] ${title} — 목표 ${goalParticipants}명 달성 시 추가 ${discountPct}% 할인! 지금 참여해보세요.`,
          likes: 0,
          comments: [],
          isFollowing: true,
          createdAt: new Date().toISOString(),
          tags: ['공동구매', '인증크리에이터'],
          glasEarned: reward,
          category: 'groupbuy' as const,
          authorFollowers: USER.followers,
        },
        ...s.posts,
      ],
      communityRewardGlas: s.communityRewardGlas + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'post_reward',
          title: '인플루언서 공동구매 개설 리워드',
          subtitle: 'Glow Feed',
          date: new Date().toISOString(),
          glasDelta: reward,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: '공동구매가 개설됐어요!', glasAmount: reward }],
    }));
    get().checkTierPromotion();
  },

  toggleLike: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      ),
    })),

  toggleFollow: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, isFollowing: !p.isFollowing } : p)),
    })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearLevelUp: () => set({ levelUpTier: null }),

  simulatePharmacyPurchase: (title, subtitle, usdAmount) => {
    const reward = Math.round(usdAmount * 4);
    set((s) => ({
      purchaseEarnedGlas: s.purchaseEarnedGlas + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'purchase',
          title,
          subtitle,
          date: new Date().toISOString(),
          glasDelta: reward,
          usdAmount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `구매 적립 +${reward} GLAS`, glasAmount: reward }],
    }));
    get().checkTierPromotion();
  },

  // Checkout with a choice of payment methods. Stablecoin, card, and cash
  // (via QR) all earn the usual purchase-reward GLAS — the point is that
  // payment method is irrelevant to earning; only the QR step differs.
  // Paying with GLAS itself spends from the spendable buckets and earns no
  // reward.
  checkoutPurchase: (title, subtitle, priceUSD, method) => {
    if (method === 'glas') {
      const glasCost = Math.ceil(priceUSD / GLAS_PRICE_USD);
      const ok = get().spendGlas(glasCost);
      if (!ok) return { ok: false, reason: '보유 GLAS가 부족해요.' };
      set((s) => ({
        transactions: [
          {
            id: nextId('tx'),
            type: 'purchase_glas',
            title,
            subtitle,
            date: new Date().toISOString(),
            glasDelta: glasCost,
            direction: 'out',
            usdAmount: priceUSD,
          },
          ...s.transactions,
        ],
        toasts: [...s.toasts, { id: nextId('toast'), message: `${glasCost.toLocaleString()} GLAS로 결제 완료` }],
      }));
      return { ok: true };
    }

    const reward = Math.round(priceUSD * 4);
    set((s) => ({
      purchaseEarnedGlas: s.purchaseEarnedGlas + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'purchase',
          title,
          subtitle:
            method === 'card' ? `${subtitle} · 신용카드` : method === 'cash' ? `${subtitle} · 현금(QR 적립)` : `${subtitle} · 스테이블코인`,
          date: new Date().toISOString(),
          glasDelta: reward,
          usdAmount: priceUSD,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `구매 적립 +${reward} GLAS`, glasAmount: reward }],
    }));
    get().checkTierPromotion();
    return { ok: true };
  },

  // "지금 바로 구매" — instantly buy enough GLAS to cross into a tier. This
  // bucket counts toward the tier immediately (no 30-day lockup), and the
  // resulting tier is permanent per checkTierPromotion's usual rule.
  buyTierDirect: (usdCost, method) => {
    const glas = Math.round(usdCost / GLAS_PRICE_USD);
    set((s) => ({
      usdtBalance: method === 'stablecoin' ? s.usdtBalance - usdCost : s.usdtBalance,
      directPurchaseGlas: s.directPurchaseGlas + glas,
      transactions: [
        {
          id: nextId('tx'),
          type: 'tier_purchase',
          title: '등급 즉시구매',
          subtitle: method === 'stablecoin' ? '스테이블코인 결제' : '신용카드 결제 (MoonPay)',
          date: new Date().toISOString(),
          glasDelta: glas,
          usdAmount: usdCost,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${glas.toLocaleString()} GLAS 즉시구매 완료`, glasAmount: glas }],
    }));
    get().checkTierPromotion();
  },

  claimWelcomeBonus: () => {
    if (get().welcomeBonusClaimed) return { credited: false, amount: 0 };
    set((s) => ({
      welcomeBonusClaimed: true,
      purchaseEarnedGlas: s.purchaseEarnedGlas + WELCOME_BONUS_GLAS,
      transactions: [
        {
          id: nextId('tx'),
          type: 'welcome_bonus',
          title: '웰컴 리워드',
          subtitle: '가입 즉시 지급',
          date: new Date().toISOString(),
          glasDelta: WELCOME_BONUS_GLAS,
        },
        ...s.transactions,
      ],
    }));
    get().checkTierPromotion();
    return { credited: true, amount: WELCOME_BONUS_GLAS };
  },

  setLanguage: (lang) => set({ language: lang }),
}));

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
