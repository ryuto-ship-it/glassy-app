import { create } from 'zustand';

import { getTierById, getTierForUsdValue, STAKE_LOCKUP_DAYS, TierId } from '@/constants/glow';
import {
  COMMUNITY_POSTS,
  CommunityPost,
  GLAS_PRICE_USD,
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

type AppState = {
  // wallet
  purchaseEarnedGlas: number;
  liquidBoughtGlas: number;
  stakeEntries: StakeEntry[];
  usdtBalance: number;
  usdcBalance: number;
  transactions: Transaction[];
  demoFastForward: boolean;

  // permanent tier record — set once on promotion, never re-evaluated
  // downward even if $GLAS price later drops (see checkTierPromotion).
  achievedTier: TierId;
  achievedAt: string;
  achievedAtPrice: number;

  // community
  posts: CommunityPost[];

  // ephemeral UI events
  toasts: Toast[];
  levelUpTier: TierId | null;

  // derived getters
  maturedStakedGlas: () => number;
  pendingStakedGlas: () => number;
  totalGlas: () => number;

  // actions
  buyGlas: (usdtAmount: number) => void;
  stakeGlas: (amount: number) => void;
  unstakeEntry: (entryId: string) => { ok: boolean; reason?: string };
  toggleDemoFastForward: () => void;
  addCommunityPost: (caption: string, images: string[]) => void;
  toggleLike: (postId: string) => void;
  toggleFollow: (postId: string) => void;
  dismissToast: (id: string) => void;
  clearLevelUp: () => void;
  simulatePharmacyPurchase: (title: string, subtitle: string, usdAmount: number) => void;
  checkTierPromotion: () => void;
};

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
  liquidBoughtGlas: 0,
  stakeEntries: STAKE_ENTRIES,
  usdtBalance: USER.usdtBalance,
  usdcBalance: USER.usdcBalance,
  transactions: TRANSACTIONS,
  demoFastForward: false,

  achievedTier: USER.achievedTier,
  achievedAt: USER.achievedAt,
  achievedAtPrice: USER.achievedAtPrice,

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
    const { purchaseEarnedGlas } = get();
    return purchaseEarnedGlas + get().maturedStakedGlas();
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
        },
        ...s.posts,
      ],
      purchaseEarnedGlas: s.purchaseEarnedGlas + reward,
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
}));

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
