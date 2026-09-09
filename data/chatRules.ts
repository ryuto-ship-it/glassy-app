// Rule-based "AI 1차 상담" chat engine — no model call, keyword matching
// against a fixed table, same spirit as data/aiRecommendations.ts. Each
// rule's `productIds` reference real entries in data/mock.ts PRODUCTS so
// the inline product cards in chat bubbles always resolve to real items.
export type ChatRule = {
  id: string;
  keywords: string[];
  reply: string;
  productIds: string[];
};

export const CHAT_RULES: ChatRule[] = [
  {
    id: 'dry-skin',
    keywords: ['건조', 'dry', '땅기', '푸석'],
    reply: '피부가 건조하시군요! 이런 제품이 도움될 수 있어요 🌿',
    productIds: ['r6', 'r5'],
  },
  {
    id: 'fatigue',
    keywords: ['피곤', '피로', 'tired', '기운'],
    reply: '요즘 많이 피곤하셨겠어요. 이 제품들이 도움될 수 있어요 💪',
    productIds: ['r3', 'p8'],
  },
  {
    id: 'dark-circles',
    keywords: ['다크서클', '다크써클', '눈밑'],
    reply: '다크서클엔 이런 케어를 추천드려요 👀',
    productIds: ['p4', 'r6'],
  },
  {
    id: 'sleep',
    keywords: ['잠', '불면', 'sleep', '수면'],
    reply: '숙면에 어려움이 있으시군요. 이런 제품이 도움될 수 있어요 😴',
    productIds: ['w1', 'r3'],
  },
  {
    id: 'digestion',
    keywords: ['소화', '속쓰림', '체함', '더부룩'],
    reply: '속이 불편하시군요. 이 제품들을 참고해보세요 🍵',
    productIds: ['r2', 'p7'],
  },
];

export const CHAT_FALLBACK_REPLY =
  '조금 더 구체적으로 말씀해주시면 더 정확히 추천해드릴 수 있어요! 예: "피부가 건조해요", "요즘 잠을 잘 못 자요"';

export const CHAT_GREETING = '안녕하세요! 오늘 컨디션이 어떠세요? 편하게 말씀해주세요 :)';

export function matchChatRule(input: string): ChatRule | null {
  const lower = input.toLowerCase();
  return CHAT_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) ?? null;
}

// Seed reply pair used once the conversation hands off to a human — see
// PHARMACIST_PROFILE in data/pharmacist.ts.
export const PHARMACIST_HANDOFF_LABEL = '참약사 약사에게 마저 물어보기';
