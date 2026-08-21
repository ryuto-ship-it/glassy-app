// Rule-based "AI" health-intelligence engine for the GLASSY demo.
// There is no model call here — condition/goal selections are mapped
// through a fixed lookup table to produce a deterministic report. It is
// built to feel like an AI analysis, but it's pure data plumbing.

import { hashSeed } from '@/lib/artSeed';

export type ConditionId =
  | 'dark-circles'
  | 'fatigue'
  | 'eye-twitch'
  | 'indigestion'
  | 'insomnia'
  | 'stress'
  | 'skin-trouble'
  | 'hair-thinning'
  | 'dry-skin'
  | 'joint-stiffness';

export type GoalId = 'brightening' | 'elasticity' | 'energy' | 'immunity' | 'sleep-quality';

export type RadarAxis = 'fatigue' | 'hydration' | 'elasticity' | 'immunity' | 'sleep';

export const RADAR_AXES: { id: RadarAxis; label: string }[] = [
  { id: 'fatigue', label: '피로도' },
  { id: 'hydration', label: '수분' },
  { id: 'elasticity', label: '탄력' },
  { id: 'immunity', label: '면역' },
  { id: 'sleep', label: '수면' },
];

// Axes visible to tiers below Radiant Glass — the rest stay locked to tie
// the AI feature's depth to token tier.
export const BASIC_RADAR_AXES: RadarAxis[] = ['fatigue', 'hydration', 'immunity'];

export const CONDITIONS: { id: ConditionId; label: string }[] = [
  { id: 'dark-circles', label: '다크서클' },
  { id: 'fatigue', label: '만성 피로' },
  { id: 'eye-twitch', label: '눈 떨림' },
  { id: 'indigestion', label: '소화불량' },
  { id: 'insomnia', label: '불면' },
  { id: 'stress', label: '스트레스' },
  { id: 'skin-trouble', label: '피부 트러블' },
  { id: 'hair-thinning', label: '탈모 · 모발 가늘어짐' },
  { id: 'dry-skin', label: '건조함' },
  { id: 'joint-stiffness', label: '관절 뻐근함' },
];

export const GOALS: { id: GoalId; label: string }[] = [
  { id: 'brightening', label: '피부톤 밝아지기' },
  { id: 'elasticity', label: '탄력 개선' },
  { id: 'energy', label: '에너지 충전' },
  { id: 'immunity', label: '면역력 강화' },
  { id: 'sleep-quality', label: '수면의 질 개선' },
];

export type ProfileAnswers = {
  ageRange: '10대' | '20대' | '30대' | '40대' | '50대+';
  gender: '여성' | '남성' | '선택 안 함';
  sleepHours: '5시간 미만' | '5~7시간' | '7시간 이상';
  caffeineFreq: '거의 안 함' | '주 2~3회' | '매일';
};

export const DEFAULT_PROFILE: ProfileAnswers = {
  ageRange: '20대',
  gender: '선택 안 함',
  sleepHours: '5~7시간',
  caffeineFreq: '주 2~3회',
};

const CONDITION_IMPACT: Record<ConditionId, Partial<Record<RadarAxis, number>>> = {
  'dark-circles': { fatigue: -15, hydration: -5 },
  fatigue: { fatigue: -25 },
  'eye-twitch': { fatigue: -10, immunity: -5 },
  indigestion: { immunity: -15 },
  insomnia: { sleep: -25, fatigue: -10 },
  stress: { fatigue: -10, sleep: -15 },
  'skin-trouble': { elasticity: -10, hydration: -15 },
  'hair-thinning': { elasticity: -5 },
  'dry-skin': { hydration: -25 },
  'joint-stiffness': { immunity: -10 },
};

const CONDITION_PRODUCTS: Record<ConditionId, string[]> = {
  'dark-circles': ['p8', 'p6'],
  fatigue: ['p8', 'p7'],
  'eye-twitch': ['p7'],
  indigestion: ['p7'],
  insomnia: ['p8', 'p13'],
  stress: ['p6', 'p13'],
  'skin-trouble': ['p4', 'p1'],
  'hair-thinning': ['p6', 'p8'],
  'dry-skin': ['p10', 'p12'],
  'joint-stiffness': ['p7', 'p14'],
};

const GOAL_PRODUCTS: Record<GoalId, string[]> = {
  brightening: ['p2', 'p9'],
  elasticity: ['p3', 'p6'],
  energy: ['p8', 'p14'],
  immunity: ['p7', 'p14'],
  'sleep-quality': ['p13', 'p8'],
};

export type AiRecommendation = { productId: string; score: number; reasons: string[] };

export type AiResult = {
  radar: Record<RadarAxis, number>;
  recommendations: AiRecommendation[];
  generatedAt: string;
};

function clampScore(n: number): number {
  return Math.max(15, Math.min(95, Math.round(n)));
}

export function computeAiResult(
  conditions: ConditionId[],
  goals: GoalId[],
  profile: ProfileAnswers
): AiResult {
  const radar: Record<RadarAxis, number> = {
    fatigue: 78,
    hydration: 78,
    elasticity: 78,
    immunity: 78,
    sleep: 78,
  };

  for (const c of conditions) {
    const impact = CONDITION_IMPACT[c];
    for (const axis of Object.keys(impact) as RadarAxis[]) {
      radar[axis] += impact[axis] ?? 0;
    }
  }

  if (profile.sleepHours === '5시간 미만') radar.sleep -= 12;
  if (profile.sleepHours === '7시간 이상') radar.sleep += 6;
  if (profile.caffeineFreq === '매일') radar.fatigue -= 6;

  (Object.keys(radar) as RadarAxis[]).forEach((axis) => {
    radar[axis] = clampScore(radar[axis]);
  });

  const weight = new Map<string, number>();
  const reasons = new Map<string, Set<string>>();
  const addReason = (productId: string, label: string) => {
    weight.set(productId, (weight.get(productId) ?? 0) + 1);
    if (!reasons.has(productId)) reasons.set(productId, new Set());
    reasons.get(productId)!.add(label);
  };

  for (const c of conditions) {
    const label = CONDITIONS.find((x) => x.id === c)?.label ?? c;
    for (const productId of CONDITION_PRODUCTS[c] ?? []) addReason(productId, label);
  }
  for (const g of goals) {
    const label = GOALS.find((x) => x.id === g)?.label ?? g;
    for (const productId of GOAL_PRODUCTS[g] ?? []) addReason(productId, label);
  }

  const recommendations: AiRecommendation[] = [...weight.entries()]
    .map(([productId, w]) => ({
      productId,
      score: clampScore(78 + w * 4 + (hashSeed(productId) % 3)),
      reasons: [...(reasons.get(productId) ?? [])],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { radar, recommendations, generatedAt: new Date().toISOString() };
}

export function explainRecommendation(reasons: string[]): string {
  if (reasons.length === 0) return 'AI가 종합 분석해 추천드려요.';
  const list = reasons.slice(0, 2).join(', ');
  return `${list} 관련 지표가 높게 나타나 추천드려요.`;
}

export function axisCommentary(axis: RadarAxis, score: number): string {
  const label = RADAR_AXES.find((a) => a.id === axis)?.label ?? axis;
  if (score < 45) return `${label} 점수가 낮아요 — 집중 관리가 필요해요.`;
  if (score < 70) return `${label}은 보통 수준이에요. 꾸준한 관리를 추천해요.`;
  return `${label}은 양호한 편이에요.`;
}
