// "우리 가족" — 참약사의 "우리가족 건강 플랫폼 약국" 정체성을 반영한 가족
//프로필. Each member gets an independent recommendation focus + seed
// diagnosis snapshot, mapped onto real catalog ids (data/mock.ts) so the
// same ProductImage/purchase flow works unmodified for every member.
export type FamilyRelation = 'self' | 'spouse' | 'child' | 'parent';

export type FamilyMember = {
  id: string;
  name: string;
  relation: FamilyRelation;
  avatar: string;
  focusLabel: string; // short "이런 걸 챙겨요" tag shown on the avatar chip
  focusProductIds: string[]; // real PRODUCTS ids this member's home feed leans on
  // Seed-only "AI 진단" snapshot for non-self members (self uses the live
  // useQuizStore result instead — see lib/useFamilyRecommendations.ts).
  seedRadar: { fatigue: number; hydration: number; elasticity: number; immunity: number; sleep: number };
  seedInsight: string;
  lastCheckedDaysAgo: number;
};

export const RELATION_LABEL: Record<FamilyRelation, string> = {
  self: '본인',
  spouse: '배우자',
  child: '자녀',
  parent: '부모님',
};

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'self',
    name: 'Bella',
    relation: 'self',
    avatar: 'https://i.pravatar.cc/300?img=5',
    focusLabel: 'AI 맞춤 케어',
    focusProductIds: ['r6', 'p4', 'r3'],
    seedRadar: { fatigue: 78, hydration: 78, elasticity: 78, immunity: 78, sleep: 78 },
    seedInsight: '',
    lastCheckedDaysAgo: 0,
  },
  {
    id: 'spouse',
    name: 'Sofia',
    relation: 'spouse',
    avatar: 'https://i.pravatar.cc/300?img=47',
    focusLabel: '피부 보습 케어',
    focusProductIds: ['r6', 'r5', 'p4'],
    seedRadar: { fatigue: 62, hydration: 54, elasticity: 68, immunity: 70, sleep: 66 },
    seedInsight: '최근 체크에서 수분 지표가 낮게 나왔어요. 보습 케어 제품을 눈여겨보세요.',
    lastCheckedDaysAgo: 5,
  },
  {
    id: 'child',
    name: '하은',
    relation: 'child',
    avatar: 'https://i.pravatar.cc/300?img=64',
    focusLabel: '성장기 영양 케어',
    focusProductIds: ['r1', 'p8', 'w2'],
    seedRadar: { fatigue: 82, hydration: 74, elasticity: 88, immunity: 66, sleep: 80 },
    seedInsight: '또래 대비 면역 지표를 조금 더 챙겨주면 좋아요. 비타민 섭취를 추천해요.',
    lastCheckedDaysAgo: 12,
  },
  {
    id: 'parent',
    name: '어머니',
    relation: 'parent',
    avatar: 'https://i.pravatar.cc/300?img=26',
    focusLabel: '관절 · 혈행 케어',
    focusProductIds: ['r3', 'r7', 'w1'],
    seedRadar: { fatigue: 58, hydration: 60, elasticity: 52, immunity: 64, sleep: 56 },
    seedInsight: '관절 뻐근함과 피로도가 함께 나타났어요. 홍삼정과 파스류를 참고해보세요.',
    lastCheckedDaysAgo: 3,
  },
];
