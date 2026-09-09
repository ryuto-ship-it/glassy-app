import { create } from 'zustand';

import { getTierById, getTierForUsdValue, STAKE_LOCKUP_DAYS, TierId } from '@/constants/glow';
import {
  COMMUNITY_POSTS,
  CommunityPost,
  CHARM_PRICE_USD,
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
  charmAmount?: number;
};

export type PaymentMethod = 'stablecoin' | 'card' | 'charm' | 'cash';

type AppState = {
  // wallet — CHARM held, split by source
  purchaseEarnedCharm: number; // 구매 적립분
  directPurchaseCharm: number; // 등급 즉시구매분
  communityRewardCharm: number; // 커뮤니티 리워드분
  liquidBoughtCharm: number; // exchange-bought, not yet staked
  stakeEntries: StakeEntry[]; // 스테이킹 매수분 (matures after lockup)
  usdtBalance: number;
  usdcBalance: number;
  transactions: Transaction[];
  demoFastForward: boolean;

  // permanent tier record — set once on promotion, never re-evaluated
  // downward even if $CHARM price later drops (see checkTierPromotion).
  achievedTier: TierId;
  achievedAt: string;
  achievedAtPrice: number;

  // scan/translation display language — defaults from the profile's
  // country setting but is switchable from Profile for demo purposes.
  language: LanguageCode;

  // Mock wearable connection (no real OAuth) for the Profile "내 컨디션"
  // screen — Mode A once connected, Mode B (AI survey) until then.
  wearableProvider: 'whoop' | 'apple-watch' | 'fitbit' | null;

  // welcome gateway — only actually credits CHARM the first time; replaying
  // the welcome flow from the Profile tab still shows the full animation
  // but won't re-grant the bonus.
  welcomeBonusClaimed: boolean;

  // community
  posts: CommunityPost[];

  // ephemeral UI events
  toasts: Toast[];
  levelUpTier: TierId | null;

  // derived getters
  maturedStakedCharm: () => number;
  pendingStakedCharm: () => number;
  totalCharm: () => number;
  spendableCharm: () => number;

  // actions
  buyCharm: (usdtAmount: number) => void;
  stakeCharm: (amount: number) => void;
  unstakeEntry: (entryId: string) => { ok: boolean; reason?: string };
  toggleDemoFastForward: () => void;
  addCommunityPost: (caption: string, images: string[]) => void;
  createGroupBuyPost: (title: string, goalParticipants: number, discountPct: number) => void;
  toggleLike: (postId: string) => void;
  toggleFollow: (postId: string) => void;
  dismissToast: (id: string) => void;
  pushToast: (message: string, charmAmount?: number) => void;
  clearLevelUp: () => void;
  simulatePharmacyPurchase: (title: string, subtitle: string, usdAmount: number) => void;
  checkTierPromotion: () => void;
  spendCharm: (amount: number) => boolean;
  checkoutPurchase: (
    title: string,
    subtitle: string,
    priceUSD: number,
    method: PaymentMethod
  ) => { ok: boolean; reason?: string };
  buyTierDirect: (usdCost: number, method: 'stablecoin' | 'card') => void;
  claimWelcomeBonus: () => { credited: boolean; amount: number };
  setLanguage: (lang: LanguageCode) => void;
  connectWearable: (provider: 'whoop' | 'apple-watch' | 'fitbit') => void;
};

export const WELCOME_BONUS_CHARM = 500;

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
  purchaseEarnedCharm: USER.purchaseEarnedCharm,
  directPurchaseCharm: 0,
  communityRewardCharm: 0,
  liquidBoughtCharm: 0,
  stakeEntries: STAKE_ENTRIES,
  usdtBalance: USER.usdtBalance,
  usdcBalance: USER.usdcBalance,
  transactions: TRANSACTIONS,
  demoFastForward: false,

  achievedTier: USER.achievedTier,
  achievedAt: USER.achievedAt,
  achievedAtPrice: USER.achievedAtPrice,

  language: USER.language,
  wearableProvider: null,
  welcomeBonusClaimed: false,

  posts: COMMUNITY_POSTS,

  toasts: [],
  levelUpTier: null,

  maturedStakedCharm: () => {
    const { stakeEntries, demoFastForward } = get();
    return stakeEntries
      .filter((e) => isEntryMatured(e, demoFastForward))
      .reduce((sum, e) => sum + e.amount, 0);
  },
  pendingStakedCharm: () => {
    const { stakeEntries, demoFastForward } = get();
    return stakeEntries
      .filter((e) => !isEntryMatured(e, demoFastForward))
      .reduce((sum, e) => sum + e.amount, 0);
  },
  totalCharm: () => {
    const { purchaseEarnedCharm, directPurchaseCharm, communityRewardCharm } = get();
    return purchaseEarnedCharm + directPurchaseCharm + communityRewardCharm + get().maturedStakedCharm();
  },
  // CHARM that can actually be spent at checkout (excludes locked stake entries).
  spendableCharm: () => {
    const { liquidBoughtCharm, purchaseEarnedCharm, directPurchaseCharm, communityRewardCharm } = get();
    return liquidBoughtCharm + purchaseEarnedCharm + directPurchaseCharm + communityRewardCharm;
  },

  // Promote (never demote) based on current USD value of held CHARM. Called
  // after any action that can change totalCharm().
  checkTierPromotion: () => {
    const { achievedTier, totalCharm } = get();
    const usdValue = totalCharm() * CHARM_PRICE_USD;
    const evaluated = getTierForUsdValue(usdValue);
    const current = getTierById(achievedTier);
    if (evaluated.order > current.order) {
      set({
        achievedTier: evaluated.id,
        achievedAt: new Date().toISOString(),
        achievedAtPrice: CHARM_PRICE_USD,
        levelUpTier: evaluated.id,
      });
    }
  },

  // Deduct CHARM spent at checkout from the liquid, spendable buckets only
  // (never from locked stake entries). Returns false if insufficient.
  spendCharm: (amount) => {
    const s = get();
    if (s.spendableCharm() < amount) return false;
    let remaining = amount;
    const takeFrom = (bucket: number) => {
      const take = Math.min(bucket, remaining);
      remaining -= take;
      return bucket - take;
    };
    const liquidBoughtCharm = takeFrom(s.liquidBoughtCharm);
    const purchaseEarnedCharm = takeFrom(s.purchaseEarnedCharm);
    const directPurchaseCharm = takeFrom(s.directPurchaseCharm);
    const communityRewardCharm = takeFrom(s.communityRewardCharm);
    set({ liquidBoughtCharm, purchaseEarnedCharm, directPurchaseCharm, communityRewardCharm });
    return true;
  },

  buyCharm: (usdtAmount) => {
    const charm = Math.round(usdtAmount / CHARM_PRICE_USD);
    set((s) => ({
      usdtBalance: s.usdtBalance - usdtAmount,
      liquidBoughtCharm: s.liquidBoughtCharm + charm,
      transactions: [
        {
          id: nextId('tx'),
          type: 'buy',
          title: '$CHARM 거래소 매수',
          subtitle: 'CHARM EX 체결',
          date: new Date().toISOString(),
          charmDelta: charm,
          usdAmount: usdtAmount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${charm.toLocaleString()} CHARM 매수 완료`, charmAmount: charm }],
    }));
    // buying alone doesn't move totalCharm() (still unstaked), so no promotion check here.
  },

  stakeCharm: (amount) => {
    set((s) => ({
      liquidBoughtCharm: Math.max(0, s.liquidBoughtCharm - amount),
      stakeEntries: [...s.stakeEntries, { id: nextId('stake'), amount, startDate: new Date().toISOString() }],
      transactions: [
        {
          id: nextId('tx'),
          type: 'stake',
          title: '$CHARM 스테이킹 예치',
          subtitle: '30일 락업 시작',
          date: new Date().toISOString(),
          charmDelta: amount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${amount.toLocaleString()} CHARM 스테이킹 시작`, charmAmount: amount }],
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
      liquidBoughtCharm: s.liquidBoughtCharm + entry.amount,
      transactions: [
        {
          id: nextId('tx'),
          type: 'unstake',
          title: '$CHARM 언스테이킹',
          subtitle: '지갑으로 회수',
          date: new Date().toISOString(),
          charmDelta: entry.amount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${entry.amount.toLocaleString()} CHARM 언스테이킹 완료` }],
    }));
    // note: unstaking lowers totalCharm(), but achievedTier is permanent — no re-check needed, no demotion possible.
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
          charmEarned: reward,
        },
        ...s.posts,
      ],
      communityRewardCharm: s.communityRewardCharm + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'post_reward',
          title: '커뮤니티 후기 작성 리워드',
          subtitle: 'Glow Feed',
          date: new Date().toISOString(),
          charmDelta: reward,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: '후기 작성 완료!', charmAmount: reward }],
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
          charmEarned: reward,
          category: 'groupbuy' as const,
          authorFollowers: USER.followers,
        },
        ...s.posts,
      ],
      communityRewardCharm: s.communityRewardCharm + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'post_reward',
          title: '인플루언서 공동구매 개설 리워드',
          subtitle: 'Glow Feed',
          date: new Date().toISOString(),
          charmDelta: reward,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: '공동구매가 개설됐어요!', charmAmount: reward }],
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
  pushToast: (message, charmAmount) =>
    set((s) => ({ toasts: [...s.toasts, { id: nextId('toast'), message, charmAmount }] })),
  clearLevelUp: () => set({ levelUpTier: null }),

  simulatePharmacyPurchase: (title, subtitle, usdAmount) => {
    const reward = Math.round(usdAmount * 4);
    set((s) => ({
      purchaseEarnedCharm: s.purchaseEarnedCharm + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'purchase',
          title,
          subtitle,
          date: new Date().toISOString(),
          charmDelta: reward,
          usdAmount,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `구매 적립 +${reward} CHARM`, charmAmount: reward }],
    }));
    get().checkTierPromotion();
  },

  // Checkout with a choice of payment methods. Stablecoin, card, and cash
  // (via QR) all earn the usual purchase-reward CHARM — the point is that
  // payment method is irrelevant to earning; only the QR step differs.
  // Paying with CHARM itself spends from the spendable buckets and earns no
  // reward.
  checkoutPurchase: (title, subtitle, priceUSD, method) => {
    if (method === 'charm') {
      const charmCost = Math.ceil(priceUSD / CHARM_PRICE_USD);
      const ok = get().spendCharm(charmCost);
      if (!ok) return { ok: false, reason: '보유 CHARM이 부족해요.' };
      set((s) => ({
        transactions: [
          {
            id: nextId('tx'),
            type: 'purchase_charm',
            title,
            subtitle,
            date: new Date().toISOString(),
            charmDelta: charmCost,
            direction: 'out',
            usdAmount: priceUSD,
          },
          ...s.transactions,
        ],
        toasts: [...s.toasts, { id: nextId('toast'), message: `${charmCost.toLocaleString()} CHARM으로 결제 완료` }],
      }));
      return { ok: true };
    }

    const reward = Math.round(priceUSD * 4);
    set((s) => ({
      purchaseEarnedCharm: s.purchaseEarnedCharm + reward,
      transactions: [
        {
          id: nextId('tx'),
          type: 'purchase',
          title,
          subtitle:
            method === 'card' ? `${subtitle} · 신용카드` : method === 'cash' ? `${subtitle} · 현금(QR 적립)` : `${subtitle} · 스테이블코인`,
          date: new Date().toISOString(),
          charmDelta: reward,
          usdAmount: priceUSD,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `구매 적립 +${reward} CHARM`, charmAmount: reward }],
    }));
    get().checkTierPromotion();
    return { ok: true };
  },

  // "지금 바로 구매" — instantly buy enough CHARM to cross into a tier. This
  // bucket counts toward the tier immediately (no 30-day lockup), and the
  // resulting tier is permanent per checkTierPromotion's usual rule.
  buyTierDirect: (usdCost, method) => {
    const charm = Math.round(usdCost / CHARM_PRICE_USD);
    set((s) => ({
      usdtBalance: method === 'stablecoin' ? s.usdtBalance - usdCost : s.usdtBalance,
      directPurchaseCharm: s.directPurchaseCharm + charm,
      transactions: [
        {
          id: nextId('tx'),
          type: 'tier_purchase',
          title: '등급 즉시구매',
          subtitle: method === 'stablecoin' ? '스테이블코인 결제' : '신용카드 결제 (MoonPay)',
          date: new Date().toISOString(),
          charmDelta: charm,
          usdAmount: usdCost,
        },
        ...s.transactions,
      ],
      toasts: [...s.toasts, { id: nextId('toast'), message: `${charm.toLocaleString()} CHARM 즉시구매 완료`, charmAmount: charm }],
    }));
    get().checkTierPromotion();
  },

  claimWelcomeBonus: () => {
    if (get().welcomeBonusClaimed) return { credited: false, amount: 0 };
    set((s) => ({
      welcomeBonusClaimed: true,
      purchaseEarnedCharm: s.purchaseEarnedCharm + WELCOME_BONUS_CHARM,
      transactions: [
        {
          id: nextId('tx'),
          type: 'welcome_bonus',
          title: '웰컴 리워드',
          subtitle: '가입 즉시 지급',
          date: new Date().toISOString(),
          charmDelta: WELCOME_BONUS_CHARM,
        },
        ...s.transactions,
      ],
    }));
    get().checkTierPromotion();
    return { credited: true, amount: WELCOME_BONUS_CHARM };
  },

  setLanguage: (lang) => set({ language: lang }),
  connectWearable: (provider) => set({ wearableProvider: provider }),
}));

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
