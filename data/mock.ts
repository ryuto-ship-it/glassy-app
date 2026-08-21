// All mock data for the GLASSY demo — no backend, everything lives here.

import { TierId } from '@/constants/glow';

// Mock $GLAS market price. Tier ENTRY is decided by (held GLAS × this price),
// but once a tier is achieved it is kept forever regardless of later price
// moves — see USER.achievedTier below and store/useAppStore.ts.
export const GLAS_PRICE_USD = 0.42;
// A second price point purely so the UI can show how many GLAS "you'd still
// need today" has moved since yesterday's price.
export const GLAS_PRICE_USD_YESTERDAY = 0.44;

export type ProductCategory = 'skincare' | 'vitamin' | 'supplement' | 'ampoule';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  isRepurchase?: boolean;
  groupBuy?: {
    participants: number;
    goal: number;
    endsInDays: number;
    extraDiscountPct: number;
  };
};

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  skincare: '스킨케어',
  vitamin: '비타민',
  supplement: '건기식',
  ampoule: '앰플',
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Centella Calming Ampoule',
    brand: 'Jeju Botanica',
    category: 'ampoule',
    priceUSD: 28,
    rating: 4.8,
    reviewCount: 2140,
    isRepurchase: true,
  },
  {
    id: 'p2',
    name: 'Vitamin C 22% Brightening Serum',
    brand: 'Haneul Lab',
    category: 'ampoule',
    priceUSD: 24,
    rating: 4.7,
    reviewCount: 1802,
    isRepurchase: true,
  },
  {
    id: 'p3',
    name: 'Marine Collagen Jelly Ampoule',
    brand: 'Soonsoo',
    category: 'ampoule',
    priceUSD: 32,
    rating: 4.9,
    reviewCount: 987,
    isRepurchase: true,
  },
  {
    id: 'p4',
    name: 'Niacinamide 10% Pore Ampoule',
    brand: 'Cheongdam Derm',
    category: 'ampoule',
    priceUSD: 19,
    rating: 4.6,
    reviewCount: 3021,
  },
  {
    id: 'p5',
    name: 'Vitamin C 1000 Effervescent',
    brand: 'Byul Nutrition',
    category: 'vitamin',
    priceUSD: 15,
    rating: 4.5,
    reviewCount: 1290,
    isRepurchase: true,
  },
  {
    id: 'p6',
    name: 'Marine Collagen Peptide Powder',
    brand: 'Mureung',
    category: 'supplement',
    priceUSD: 26,
    rating: 4.7,
    reviewCount: 764,
    isRepurchase: true,
  },
  {
    id: 'p7',
    name: 'Probiotic Skin-Gut Capsules',
    brand: 'Danpoong',
    category: 'supplement',
    priceUSD: 22,
    rating: 4.4,
    reviewCount: 512,
  },
  {
    id: 'p8',
    name: 'Biotin & Glow Multivitamin',
    brand: 'Byul Nutrition',
    category: 'vitamin',
    priceUSD: 18,
    rating: 4.6,
    reviewCount: 1108,
  },
  {
    id: 'p9',
    name: 'Rice Bran Brightening Mask (5ea)',
    brand: 'Rice & Rain',
    category: 'skincare',
    priceUSD: 14,
    rating: 4.8,
    reviewCount: 2455,
    isRepurchase: true,
  },
  {
    id: 'p10',
    name: 'Snail Mucin 96% Essence Mask',
    brand: 'Soonsoo',
    category: 'skincare',
    priceUSD: 16,
    rating: 4.7,
    reviewCount: 1876,
  },
  {
    id: 'p11',
    name: 'Mineral Sunscreen SPF50+ PA++++',
    brand: 'Jeju Botanica',
    category: 'skincare',
    priceUSD: 21,
    rating: 4.9,
    reviewCount: 4032,
    isRepurchase: true,
  },
  {
    id: 'p12',
    name: 'Ceramide Barrier Cream',
    brand: 'Haneul Lab',
    category: 'skincare',
    priceUSD: 27,
    rating: 4.6,
    reviewCount: 998,
  },
  {
    id: 'p13',
    name: 'Honey Propolis Sleeping Mask',
    brand: 'Cheongdam Derm',
    category: 'skincare',
    priceUSD: 23,
    rating: 4.8,
    reviewCount: 655,
    groupBuy: { participants: 128, goal: 200, endsInDays: 3, extraDiscountPct: 20 },
  },
  {
    id: 'p14',
    name: 'Red Ginseng Ampoule Duo Set',
    brand: 'Mureung',
    category: 'ampoule',
    priceUSD: 45,
    rating: 4.9,
    reviewCount: 341,
    groupBuy: { participants: 64, goal: 150, endsInDays: 6, extraDiscountPct: 15 },
  },
];

export const FEATURED_GROUP_BUY = PRODUCTS.find((p) => p.id === 'p13')!;

export type Transaction = {
  id: string;
  type: 'purchase' | 'stake' | 'unstake' | 'buy' | 'post_reward';
  title: string;
  subtitle: string;
  date: string; // ISO
  glasDelta: number;
  usdAmount?: number;
};

export const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'purchase',
    title: 'Ceramide Barrier Cream + Vitamin C 1000',
    subtitle: 'GLASSY Myeongdong Pharmacy',
    date: '2026-08-05',
    glasDelta: 220,
    usdAmount: 55,
  },
  {
    id: 't2',
    type: 'purchase',
    title: 'Snail Mucin 96% Essence Mask',
    subtitle: 'GLASSY Hongdae Pharmacy',
    date: '2026-07-22',
    glasDelta: 150,
    usdAmount: 37.5,
  },
  {
    id: 't3',
    type: 'stake',
    title: '$GLAS 스테이킹 예치',
    subtitle: '30일 락업 시작',
    date: '2026-07-05',
    glasDelta: 650,
  },
  {
    id: 't4',
    type: 'purchase',
    title: 'Mineral Sunscreen SPF50+',
    subtitle: 'GLASSY Itaewon Pharmacy',
    date: '2026-07-10',
    glasDelta: 90,
    usdAmount: 22.5,
  },
  {
    id: 't5',
    type: 'purchase',
    title: 'Marine Collagen Jelly Ampoule x2',
    subtitle: 'GLASSY Myeongdong Pharmacy',
    date: '2026-06-28',
    glasDelta: 180,
    usdAmount: 45,
  },
  {
    id: 't6',
    type: 'purchase',
    title: 'Probiotic Skin-Gut Capsules',
    subtitle: 'GLASSY Hongdae Pharmacy',
    date: '2026-06-14',
    glasDelta: 60,
    usdAmount: 15,
  },
  {
    id: 't7',
    type: 'buy',
    title: '$GLAS 거래소 매수',
    subtitle: 'GLASSY EX 체결',
    date: '2026-06-20',
    glasDelta: 650,
    usdAmount: 273,
  },
  {
    id: 't8',
    type: 'purchase',
    title: 'Centella Calming Ampoule',
    subtitle: 'GLASSY Myeongdong Pharmacy',
    date: '2026-05-30',
    glasDelta: 140,
    usdAmount: 35,
  },
  {
    id: 't9',
    type: 'purchase',
    title: 'Biotin & Glow Multivitamin',
    subtitle: 'GLASSY Gangnam Pharmacy',
    date: '2026-05-12',
    glasDelta: 75,
    usdAmount: 18.75,
  },
  {
    id: 't10',
    type: 'purchase',
    title: 'Rice Bran Brightening Mask + Vitamin C Serum',
    subtitle: 'GLASSY Itaewon Pharmacy',
    date: '2026-04-25',
    glasDelta: 200,
    usdAmount: 50,
  },
  {
    id: 't11',
    type: 'purchase',
    title: 'Marine Collagen Peptide Powder',
    subtitle: 'GLASSY Gangnam Pharmacy',
    date: '2026-04-02',
    glasDelta: 85,
    usdAmount: 21.25,
  },
];

export type StakeEntry = {
  id: string;
  amount: number;
  startDate: string; // ISO
};

export const STAKE_ENTRIES: StakeEntry[] = [
  { id: 's1', amount: 650, startDate: '2026-07-05' },
];

export const USER = {
  name: 'Declan Murphy',
  location: 'Dublin, Ireland',
  avatar: 'https://i.pravatar.cc/300?img=15',
  purchaseEarnedGlas: 1200,
  usdtBalance: 2300,
  usdcBalance: 480,
  followers: 120,
  following: 76,
  memberSince: '2025-11-02',
  // Permanent tier record — set once on promotion, never re-evaluated
  // downward even if $GLAS price later drops.
  achievedTier: 'radiant-glass' as TierId,
  achievedAt: '2026-06-20T09:00:00.000Z',
  achievedAtPrice: 0.45,
};

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  location: string;
  images: string[];
  caption: string;
  likes: number;
  liked?: boolean;
  comments: { id: string; author: string; text: string }[];
  pinned?: boolean;
  isFollowing: boolean;
  createdAt: string;
  tags: string[];
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'c1',
    author: 'Sofia Almeida',
    avatar: 'https://i.pravatar.cc/300?img=47',
    location: 'Lisbon, Portugal',
    images: ['feed1'],
    caption: '3주째 Centella Calming Ampoule 쓰는 중인데 진짜 붉음증이 가라앉았어요. Radiant Glass 등급 찍고 할인까지 받아서 계속 재구매 중 ✨',
    likes: 342,
    comments: [
      { id: 'c1-1', author: 'minji_seoul', text: '저도 이거 쓰는데 완전 공감이요!' },
      { id: 'c1-2', author: 'Declan Murphy', text: '다음엔 저도 스타트!' },
    ],
    pinned: true,
    isFollowing: true,
    createdAt: '2026-08-18',
    tags: ['앰플', '진정케어'],
  },
  {
    id: 'c2',
    author: 'Haruka Ito',
    avatar: 'https://i.pravatar.cc/300?img=32',
    location: 'Osaka, Japan',
    images: ['feed2', 'feed2b'],
    caption: 'Glass Skin 등급 드디어 달성! 홀로그램 이펙트 실제로 보니까 감동... 스테이킹 30일 기다린 보람 있네요 🥹',
    likes: 891,
    comments: [{ id: 'c2-1', author: 'k.beauty.fan', text: '축하합니다!! 저도 목표예요' }],
    pinned: true,
    isFollowing: false,
    createdAt: '2026-08-16',
    tags: ['등급업', 'GlassSkin'],
  },
  {
    id: 'c3',
    author: 'Emma Laurent',
    avatar: 'https://i.pravatar.cc/300?img=5',
    location: 'Paris, France',
    images: ['feed3'],
    caption: 'Snail Mucin 마스크 리뷰 — 자극 없이 촉광촉광. 여행 마지막 날 약국에서 득템했어요.',
    likes: 156,
    comments: [],
    isFollowing: true,
    createdAt: '2026-08-14',
    tags: ['마스크', '민감케어'],
  },
  {
    id: 'c4',
    author: 'Declan Murphy',
    avatar: 'https://i.pravatar.cc/300?img=15',
    location: 'Dublin, Ireland',
    images: ['feed4'],
    caption: 'Vitamin C 세럼 한 병 다 쓰고 재구매! 톤이 진짜 밝아진 게 느껴짐. GLAS 적립도 쌓이는 중 💧',
    likes: 98,
    comments: [{ id: 'c4-1', author: 'Sofia Almeida', text: '피부 진짜 좋아지신 듯!' }],
    isFollowing: true,
    createdAt: '2026-08-11',
    tags: ['비타민C', '재구매'],
  },
  {
    id: 'c5',
    author: 'Mateus Silva',
    avatar: 'https://i.pravatar.cc/300?img=52',
    location: 'Porto, Portugal',
    images: ['feed5'],
    caption: 'Red Ginseng 앰플 공동구매 참여했어요! 15% 추가할인 + GLAS 적립까지 완전 이득.',
    likes: 214,
    comments: [{ id: 'c5-1', author: 'haruka.ito', text: '저도 참여했어요 같이가요~' }],
    isFollowing: false,
    createdAt: '2026-08-09',
    tags: ['공동구매', '앰플'],
  },
  {
    id: 'c6',
    author: 'Nora Berg',
    avatar: 'https://i.pravatar.cc/300?img=44',
    location: 'Stockholm, Sweden',
    images: ['feed6'],
    caption: '선크림 재구매 3번째. 백탁 없고 끈적임도 없어서 여름 내내 이거만 써요.',
    likes: 267,
    comments: [],
    isFollowing: true,
    createdAt: '2026-08-06',
    tags: ['선크림', '재구매'],
  },
  {
    id: 'c7',
    author: 'Liam O’Connor',
    avatar: 'https://i.pravatar.cc/300?img=59',
    location: 'Cork, Ireland',
    images: ['feed7'],
    caption: '콜라겐 파우더 한달 후기 — 손톱이랑 피부 결이 확실히 달라짐. Dewy Glow 등급도 코앞!',
    likes: 132,
    comments: [{ id: 'c7-1', author: 'Declan Murphy', text: '오 같은 아일랜드! 응원해요 ☘️' }],
    isFollowing: false,
    createdAt: '2026-08-02',
    tags: ['콜라겐', '건기식'],
  },
];
