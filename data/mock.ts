// All mock data for the GLASSY demo — no backend, everything lives here.

import { TierId } from '@/constants/glow';

// Mock $GLAS market price. Tier ENTRY is decided by (held GLAS × this price),
// but once a tier is achieved it is kept forever regardless of later price
// moves — see USER.achievedTier below and store/useAppStore.ts.
export const GLAS_PRICE_USD = 0.42;
// A second price point purely so the UI can show how many GLAS "you'd still
// need today" has moved since yesterday's price.
export const GLAS_PRICE_USD_YESTERDAY = 0.44;

function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// 30 trading days of mock $GLAS price action. The last two points are
// anchored to GLAS_PRICE_USD / GLAS_PRICE_USD_YESTERDAY so every screen
// agrees on "today" and "24h ago".
const PRICE_SEQUENCE = [
  0.38, 0.385, 0.39, 0.4, 0.395, 0.405, 0.415, 0.41, 0.42, 0.435, 0.445, 0.455,
  0.465, 0.47, 0.462, 0.45, 0.44, 0.43, 0.42, 0.41, 0.405, 0.4, 0.395, 0.405,
  0.415, 0.425, 0.435, 0.445, 0.44, 0.42,
];

export type PricePoint = { date: string; price: number };

export const GLAS_PRICE_HISTORY: PricePoint[] = PRICE_SEQUENCE.map((price, i) => ({
  date: daysAgoIso(PRICE_SEQUENCE.length - 1 - i),
  price,
}));

function hoursAgoIso(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

// A finer-grained 24h series purely for the "24H" chart filter — daily
// closes alone would render as a flat two-point line.
const PRICE_SEQUENCE_24H = [
  0.441, 0.443, 0.44, 0.438, 0.436, 0.439, 0.437, 0.434, 0.432, 0.435, 0.433,
  0.43, 0.428, 0.431, 0.429, 0.427, 0.425, 0.428, 0.426, 0.424, 0.422, 0.423,
  0.421, 0.42,
];

export const GLAS_PRICE_HISTORY_24H: PricePoint[] = PRICE_SEQUENCE_24H.map((price, i) => ({
  date: hoursAgoIso(PRICE_SEQUENCE_24H.length - 1 - i),
  price,
}));

export type ProductCategory = 'skincare' | 'vitamin' | 'supplement' | 'ampoule';
export type ProductShape = 'dropper-bottle' | 'pill-bottle' | 'tube' | 'pouch' | 'jar' | 'box';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  shape: ProductShape;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  isRepurchase?: boolean;
  // A real, widely-known Korean pharmacy product (as opposed to the
  // fictional GLASSY-brand catalog) — shown with a "약국 인기 스테디셀러"
  // trust badge and surfaced first in Home/Shop. Illustrated the same way
  // as every other product (no real product photography/logos bundled —
  // see PRODUCTS below), with the real product name kept as-is.
  isRealProduct?: boolean;
  groupBuy?: {
    participants: number;
    goal: number;
    endsInDays: number;
    extraDiscountPct: number;
  };
};

export const REAL_PRODUCT_BADGE = '약국 인기 스테디셀러';

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  skincare: '스킨케어',
  vitamin: '비타민',
  supplement: '건기식',
  ampoule: '앰플',
};

// Real, widely-known Korean pharmacy products that foreign tourists
// actually buy — used as a trust signal ("this app is connected to what's
// really on the shelf"), not a replacement for the fictional GLASSY catalog
// below. Illustrated with the same custom silhouette art as every other
// product (no scraped photography or brand logos), with real product names
// kept exactly as sold.
export const REAL_PRODUCTS: Product[] = [
  {
    id: 'r1',
    name: '레모나 비타민C 정제',
    brand: '경남제약',
    category: 'vitamin',
    shape: 'pill-bottle',
    priceUSD: 8,
    rating: 4.8,
    reviewCount: 5230,
    isRepurchase: true,
    isRealProduct: true,
  },
  {
    id: 'r2',
    name: '까스활명수',
    brand: '동화약품',
    category: 'vitamin',
    shape: 'box',
    priceUSD: 6,
    rating: 4.7,
    reviewCount: 3890,
    isRealProduct: true,
  },
  {
    id: 'r3',
    name: '정관장 홍삼정 에브리타임',
    brand: 'KGC인삼공사',
    category: 'supplement',
    shape: 'box',
    priceUSD: 42,
    rating: 4.9,
    reviewCount: 2110,
    isRepurchase: true,
    isRealProduct: true,
  },
  {
    id: 'r4',
    name: '락토핏 골드 유산균',
    brand: '종근당건강',
    category: 'supplement',
    shape: 'pouch',
    priceUSD: 25,
    rating: 4.8,
    reviewCount: 4400,
    isRealProduct: true,
  },
  {
    id: 'r5',
    name: '굿나이트 스네일 크림',
    brand: '네이처리퍼블릭',
    category: 'skincare',
    shape: 'jar',
    priceUSD: 17,
    rating: 4.7,
    reviewCount: 6789,
    isRepurchase: true,
    isRealProduct: true,
  },
  {
    id: 'r6',
    name: '마데카솔 카밍 크림',
    brand: '동국제약',
    category: 'skincare',
    shape: 'tube',
    priceUSD: 9,
    rating: 4.9,
    reviewCount: 3320,
    isRealProduct: true,
  },
  {
    id: 'r7',
    name: '신신파스 아렉스',
    brand: '신신제약',
    category: 'supplement',
    shape: 'box',
    priceUSD: 5,
    rating: 4.6,
    reviewCount: 2900,
    isRealProduct: true,
  },
  {
    id: 'r8',
    name: '제로좀 쿨패치',
    brand: '삼성제약',
    category: 'supplement',
    shape: 'box',
    priceUSD: 4,
    rating: 4.5,
    reviewCount: 1750,
    isRealProduct: true,
  },
];

export const PRODUCTS: Product[] = [
  ...REAL_PRODUCTS,
  {
    id: 'p1',
    name: 'Centella Calming Ampoule',
    brand: 'Jeju Botanica',
    category: 'ampoule',
    shape: 'dropper-bottle',
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
    shape: 'dropper-bottle',
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
    shape: 'dropper-bottle',
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
    shape: 'dropper-bottle',
    priceUSD: 19,
    rating: 4.6,
    reviewCount: 3021,
  },
  {
    id: 'p5',
    name: 'Vitamin C 1000 Effervescent',
    brand: 'Byul Nutrition',
    category: 'vitamin',
    shape: 'pill-bottle',
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
    shape: 'pouch',
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
    shape: 'pill-bottle',
    priceUSD: 22,
    rating: 4.4,
    reviewCount: 512,
  },
  {
    id: 'p8',
    name: 'Biotin & Glow Multivitamin',
    brand: 'Byul Nutrition',
    category: 'vitamin',
    shape: 'pill-bottle',
    priceUSD: 18,
    rating: 4.6,
    reviewCount: 1108,
  },
  {
    id: 'p9',
    name: 'Rice Bran Brightening Mask (5ea)',
    brand: 'Rice & Rain',
    category: 'skincare',
    shape: 'pouch',
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
    shape: 'pouch',
    priceUSD: 16,
    rating: 4.7,
    reviewCount: 1876,
  },
  {
    id: 'p11',
    name: 'Mineral Sunscreen SPF50+ PA++++',
    brand: 'Jeju Botanica',
    category: 'skincare',
    shape: 'tube',
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
    shape: 'jar',
    priceUSD: 27,
    rating: 4.6,
    reviewCount: 998,
  },
  {
    id: 'p13',
    name: 'Honey Propolis Sleeping Mask',
    brand: 'Cheongdam Derm',
    category: 'skincare',
    shape: 'jar',
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
    shape: 'box',
    priceUSD: 45,
    rating: 4.9,
    reviewCount: 341,
    groupBuy: { participants: 64, goal: 150, endsInDays: 6, extraDiscountPct: 15 },
  },
];

export const FEATURED_GROUP_BUY = PRODUCTS.find((p) => p.id === 'p13')!;

// Multi-language detail data for the camera-scan demo (task 2). Only a
// handful of real products get the full translated detail sheet — the
// scan flow is a mock, not a real OCR/vision pipeline, so it only "knows
// about" these product ids.
export type ScanDetail = {
  name: string;
  manufacturer: string;
  efficacy: string;
  dosage: string;
  precautions: string;
  sideEffects: string;
};

export type ScanProduct = {
  productId: string;
  sourceBadge: string;
  // True for the one demo product seeded as already-purchased, so the demo
  // can show both the "내가 구매한 제품" and "장바구니 담기" states.
  alreadyPurchased?: boolean;
  translations: Record<LanguageCode, ScanDetail>;
};

export const SCAN_PRODUCTS: ScanProduct[] = [
  {
    productId: 'r1',
    sourceBadge: '식약처 공식 데이터 연동',
    alreadyPurchased: true,
    translations: {
      ko: {
        name: '레모나 비타민C 정제',
        manufacturer: '경남제약',
        efficacy: '비타민C 보충, 피로 회복, 면역력 지원',
        dosage: '1회 1~2정, 1일 3회, 물과 함께 섭취',
        precautions: '신장 결석 병력이 있는 경우 복용 전 상담 필요',
        sideEffects: '과다 섭취 시 위장 장애, 설사가 나타날 수 있음',
      },
      en: {
        name: 'Lemona Vitamin C Tablets',
        manufacturer: 'Kyungnam Pharm',
        efficacy: 'Vitamin C supplementation, fatigue recovery, immune support',
        dosage: '1–2 tablets, 3 times daily, taken with water',
        precautions: 'Consult a doctor first if you have a history of kidney stones',
        sideEffects: 'Overdose may cause stomach upset or diarrhea',
      },
      zh: {
        name: '레모나 Lemona 维生素C片',
        manufacturer: '庆南制药',
        efficacy: '补充维生素C，缓解疲劳，支持免疫力',
        dosage: '每次1~2片，每日3次，配水服用',
        precautions: '有肾结石病史者服用前请先咨询医生',
        sideEffects: '过量服用可能引起肠胃不适或腹泻',
      },
      vi: {
        name: 'Viên Vitamin C Lemona',
        manufacturer: 'Kyungnam Pharm',
        efficacy: 'Bổ sung vitamin C, phục hồi mệt mỏi, hỗ trợ miễn dịch',
        dosage: 'Uống 1–2 viên, 3 lần/ngày cùng với nước',
        precautions: 'Tham khảo ý kiến bác sĩ trước nếu có tiền sử sỏi thận',
        sideEffects: 'Dùng quá liều có thể gây khó chịu dạ dày hoặc tiêu chảy',
      },
    },
  },
  {
    productId: 'r3',
    sourceBadge: '식약처 공식 데이터 연동',
    translations: {
      ko: {
        name: '정관장 홍삼정 에브리타임',
        manufacturer: 'KGC인삼공사',
        efficacy: '면역력 증진, 피로 개선, 혈액 흐름 개선 도움',
        dosage: '1회 1포(10ml), 1일 1~2회, 그대로 또는 물에 희석하여 섭취',
        precautions: '어린이는 보호자와 상담 후 섭취, 특정 약물 복용 중이면 상담 필요',
        sideEffects: '체질에 따라 소화불량, 두드러기가 나타날 수 있음',
      },
      en: {
        name: 'Cheong Kwan Jang Korean Red Ginseng Everytime',
        manufacturer: 'KGC Ginseng Corp',
        efficacy: 'Boosts immunity, reduces fatigue, supports blood circulation',
        dosage: '1 pouch (10ml), 1–2 times daily, drink directly or diluted with water',
        precautions: 'Children should consult a guardian first; check with a doctor if on medication',
        sideEffects: 'May cause indigestion or hives depending on individual sensitivity',
      },
      zh: {
        name: '正官庄 红参精 Everytime',
        manufacturer: 'KGC人参公社',
        efficacy: '提升免疫力，缓解疲劳，帮助血液循环',
        dosage: '每次1袋(10ml)，每日1~2次，可直接饮用或加水稀释',
        precautions: '儿童需在监护人指导下饮用，服用其他药物者请先咨询',
        sideEffects: '因体质不同可能出现消化不良或荨麻疹',
      },
      vi: {
        name: 'Hồng Sâm Cheong Kwan Jang Everytime',
        manufacturer: 'Tập đoàn Sâm KGC',
        efficacy: 'Tăng cường miễn dịch, giảm mệt mỏi, hỗ trợ tuần hoàn máu',
        dosage: '1 gói (10ml), 1–2 lần/ngày, uống trực tiếp hoặc pha với nước',
        precautions: 'Trẻ em cần có người giám hộ tư vấn; hỏi ý kiến bác sĩ nếu đang dùng thuốc khác',
        sideEffects: 'Có thể gây khó tiêu hoặc mề đay tùy thể trạng',
      },
    },
  },
  {
    productId: 'r6',
    sourceBadge: '식약처 공식 데이터 연동',
    translations: {
      ko: {
        name: '마데카솔 카밍 크림',
        manufacturer: '동국제약',
        efficacy: '피부 진정, 상처 및 흉터 케어, 재생 지원',
        dosage: '환부에 1일 1~3회 적당량 도포',
        precautions: '눈, 점막 부위 접촉 금지, 상처가 심할 경우 전문의 상담',
        sideEffects: '드물게 도포 부위 발적, 가려움이 나타날 수 있음',
      },
      en: {
        name: 'Madecassol Calming Cream',
        manufacturer: 'Dongkook Pharmaceutical',
        efficacy: 'Skin calming, wound and scar care, supports skin regeneration',
        dosage: 'Apply an appropriate amount to the affected area 1–3 times daily',
        precautions: 'Avoid contact with eyes or mucous membranes; see a doctor for severe wounds',
        sideEffects: 'Redness or itching at the application site may rarely occur',
      },
      zh: {
        name: '마데카솔 舒缓修复霜',
        manufacturer: '东国制药',
        efficacy: '镇静肌肤，护理伤口与疤痕，帮助皮肤再生',
        dosage: '每日1~3次，取适量涂抹于患处',
        precautions: '避免接触眼睛及黏膜部位，伤口严重请咨询专业医生',
        sideEffects: '少数情况下涂抹部位可能出现发红或瘙痒',
      },
      vi: {
        name: 'Kem Làm Dịu Madecassol',
        manufacturer: 'Dongkook Pharmaceutical',
        efficacy: 'Làm dịu da, chăm sóc vết thương và sẹo, hỗ trợ tái tạo da',
        dosage: 'Bôi lượng vừa đủ lên vùng da 1–3 lần/ngày',
        precautions: 'Tránh tiếp xúc với mắt và niêm mạc; tham khảo bác sĩ nếu vết thương nặng',
        sideEffects: 'Hiếm khi có thể gây đỏ hoặc ngứa tại vùng bôi',
      },
    },
  },
  {
    productId: 'r7',
    sourceBadge: '식약처 공식 데이터 연동',
    translations: {
      ko: {
        name: '신신파스 아렉스',
        manufacturer: '신신제약',
        efficacy: '근육통, 관절통, 타박상 완화',
        dosage: '통증 부위에 1일 1~2회 부착, 같은 부위 연속 사용은 피하기',
        precautions: '상처나 피부염이 있는 부위에는 사용하지 말 것',
        sideEffects: '피부 자극감, 발적이 나타날 수 있음',
      },
      en: {
        name: 'Sinsin Pas Arex',
        manufacturer: 'Sinsin Pharmaceutical',
        efficacy: 'Relieves muscle pain, joint pain, and bruising',
        dosage: 'Apply to the painful area 1–2 times daily; avoid continuous use on the same spot',
        precautions: 'Do not use on wounds or areas with dermatitis',
        sideEffects: 'Skin irritation or redness may occur',
      },
      zh: {
        name: '신신파스 신신膏 Arex',
        manufacturer: '新新制药',
        efficacy: '缓解肌肉痛、关节痛及跌打损伤',
        dosage: '每日1~2次贴于疼痛部位，避免同一部位连续使用',
        precautions: '有伤口或皮炎的部位请勿使用',
        sideEffects: '可能出现皮肤刺激感或发红',
      },
      vi: {
        name: 'Cao Dán Sinsin Pas Arex',
        manufacturer: 'Sinsin Pharmaceutical',
        efficacy: 'Giảm đau nhức cơ, đau khớp và bầm tím',
        dosage: 'Dán lên vùng đau 1–2 lần/ngày, tránh dùng liên tục ở cùng một vị trí',
        precautions: 'Không sử dụng trên vết thương hoặc vùng da bị viêm',
        sideEffects: 'Có thể gây kích ứng da hoặc đỏ da',
      },
    },
  },
];

export type Transaction = {
  id: string;
  type: 'purchase' | 'stake' | 'unstake' | 'buy' | 'post_reward' | 'tier_purchase' | 'purchase_glas' | 'welcome_bonus';
  title: string;
  subtitle: string;
  date: string; // ISO
  glasDelta: number; // always a positive magnitude — see `direction`
  direction?: 'in' | 'out'; // defaults to 'in' when omitted
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

export type LanguageCode = 'en' | 'zh' | 'vi' | 'ko';

export const LANGUAGE_LABEL: Record<LanguageCode, string> = {
  en: 'English',
  zh: '中文',
  vi: 'Tiếng Việt',
  ko: '한국어',
};

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
  // Profile fields used by the QR-based cash-purchase matching mock
  // (country/gender/age band) and by the product-scan translation demo
  // (preferred language).
  country: 'Ireland',
  countryFlag: '🇮🇪',
  gender: '남성' as '남성' | '여성',
  ageBand: '30대' as const,
  language: 'en' as LanguageCode,
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
  glasEarned: number;
  showEarnedCaption?: boolean;
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'c1',
    author: 'Sofia Almeida',
    avatar: 'https://i.pravatar.cc/300?img=47',
    location: 'Lisbon, Portugal',
    images: ['feed1'],
    caption:
      '3주째 Centella Calming Ampoule 쓰는 중인데 진짜 붉음증이 가라앉았어요. Radiant Glass 등급 찍고 할인까지 받아서 계속 재구매 중입니다. 이 후기로 18 GLAS 받았어요.',
    likes: 342,
    comments: [
      { id: 'c1-1', author: 'minji_seoul', text: '저도 이거 쓰는데 완전 공감이요!' },
      { id: 'c1-2', author: 'Declan Murphy', text: '다음엔 저도 스타트!' },
    ],
    pinned: true,
    isFollowing: true,
    createdAt: '2026-08-18',
    tags: ['앰플', '진정케어'],
    glasEarned: 18,
    showEarnedCaption: true,
  },
  {
    id: 'c2',
    author: 'Haruka Ito',
    avatar: 'https://i.pravatar.cc/300?img=32',
    location: 'Osaka, Japan',
    images: ['feed2', 'feed2b'],
    caption:
      'Glass Skin 등급 드디어 달성했어요. 홀로그램 이펙트 실제로 보니 스테이킹 30일 기다린 보람이 있네요. 이 후기로 25 GLAS 받았어요.',
    likes: 891,
    comments: [{ id: 'c2-1', author: 'k.beauty.fan', text: '축하합니다!! 저도 목표예요' }],
    pinned: true,
    isFollowing: false,
    createdAt: '2026-08-16',
    tags: ['등급업', 'GlassSkin'],
    glasEarned: 25,
    showEarnedCaption: true,
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
    glasEarned: 12,
  },
  {
    id: 'c4',
    author: 'Declan Murphy',
    avatar: 'https://i.pravatar.cc/300?img=15',
    location: 'Dublin, Ireland',
    images: ['feed4'],
    caption:
      'Vitamin C 세럼 한 병 다 쓰고 재구매했어요. 톤이 밝아진 게 느껴지고 GLAS 적립도 꾸준히 쌓이는 중입니다. 이 후기로 15 GLAS 받았어요.',
    likes: 98,
    comments: [{ id: 'c4-1', author: 'Sofia Almeida', text: '피부 진짜 좋아지신 듯!' }],
    isFollowing: true,
    createdAt: '2026-08-11',
    tags: ['비타민C', '재구매'],
    glasEarned: 15,
    showEarnedCaption: true,
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
    glasEarned: 20,
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
    glasEarned: 14,
  },
  {
    id: 'c7',
    author: 'Liam O’Connor',
    avatar: 'https://i.pravatar.cc/300?img=59',
    location: 'Cork, Ireland',
    images: ['feed7'],
    caption: '콜라겐 파우더 한달 후기 — 손톱이랑 피부 결이 확실히 달라짐. Dewy Glow 등급도 코앞!',
    likes: 132,
    comments: [{ id: 'c7-1', author: 'Declan Murphy', text: '같은 아일랜드시네요, 응원할게요.' }],
    isFollowing: false,
    createdAt: '2026-08-02',
    tags: ['콜라겐', '건기식'],
    glasEarned: 16,
  },
  {
    id: 'c8',
    author: 'Yuna Park',
    avatar: 'https://i.pravatar.cc/300?img=23',
    location: 'Busan, South Korea',
    images: ['feed8'],
    caption: 'Red Ginseng Ampoule Duo Set 선물용으로 구매했는데 포장이 고급스러워서 만족스러워요.',
    likes: 189,
    comments: [{ id: 'c8-1', author: 'Declan Murphy', text: '선물용으로 좋아 보이네요.' }],
    isFollowing: false,
    createdAt: '2026-07-30',
    tags: ['홍삼', '선물세트'],
    glasEarned: 13,
  },
  {
    id: 'c9',
    author: 'Chloe Martin',
    avatar: 'https://i.pravatar.cc/300?img=9',
    location: 'Lyon, France',
    images: ['feed9'],
    caption:
      'Probiotic Skin-Gut Capsules 2주째 먹는 중인데 속이 편해졌어요. 팔로워가 늘어서 리워드도 같이 받았습니다. 이 후기로 22 GLAS 받았어요.',
    likes: 145,
    comments: [],
    isFollowing: true,
    createdAt: '2026-07-27',
    tags: ['프로바이오틱', '건기식'],
    glasEarned: 22,
    showEarnedCaption: true,
  },
  {
    id: 'c10',
    author: 'Ben Walsh',
    avatar: 'https://i.pravatar.cc/300?img=14',
    location: 'Galway, Ireland',
    images: ['feed10'],
    caption: 'Ceramide Barrier Cream으로 바꾸고 건조함이 확실히 줄었어요. 겨울에도 계속 쓸 것 같습니다.',
    likes: 176,
    comments: [{ id: 'c10-1', author: 'Liam O’Connor', text: '저도 다음에 써볼게요.' }],
    isFollowing: false,
    createdAt: '2026-07-24',
    tags: ['크림', '보습'],
    glasEarned: 17,
  },
];
