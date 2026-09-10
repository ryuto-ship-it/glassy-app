// Rule-based "AI 1차 상담" chat engine — no model call. Two layers:
//
// 1) CHAT_RULES: exact keyword matching for the handful of conditions we
//    have specific, curated copy for (건조/피곤/다크서클/불면/소화/스트레스).
//    Each rule's `keywords` list already covers common conjugations via
//    plain substring matching (e.g. '피곤' also matches '피곤해요',
//    '불면' also matches '불면증') — no need to spell out every ending.
// 2) A general body-part/pain parser (parseSymptomAndRecommend) that covers
//    everything else — "허리아파", "무릎이 아파요", "목 통증", "허리가
//    아프네요" etc. — by regex-extracting the symptom word (with or
//    without a trailing particle: 이/가/은/는/도) and mapping it to a
//    product category, with a safe generic fallback for unmapped body
//    parts and a varied guidance fallback for completely unrelated input
//    (greetings, chatter). This guarantees the chat never has a "no
//    reply" dead end.
//
// Each rule/category's `productIds` reference real entries in data/mock.ts
// PRODUCTS so the inline product cards in chat bubbles always resolve to
// real items.
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
    // '피곤'/'피로'만으로도 '피곤해', '피곤해요', '피로해요' 등은 이미
    // substring으로 매칭되지만, '지쳐'/'힘들어'처럼 어간 자체가 다른
    // 구어체 동의어는 별도로 추가해야 한다.
    keywords: ['피곤', '피로', 'tired', '기운', '지쳐', '지친', '힘들어', '힘들어요', '에너지', '기력', '방전'],
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
  {
    id: 'stress',
    keywords: ['스트레스', '짜증', '예민', '불안', '우울', '긴장'],
    reply: '스트레스가 많으셨겠어요. 마음이 편안해지는 이런 제품이 도움될 수 있어요 🌿',
    productIds: ['w1', 'p7'], // 마그네슘+테아닌 슬립 컴플렉스, 유산균(장-뇌 연관)
  },
];

export const CHAT_GREETING = '안녕하세요! 오늘 컨디션이 어떠세요? 편하게 말씀해주세요 :)';

// Completely unrelated input (greetings, "ㅋㅋㅋ", random text) — the last
// resort, no product attached. Several variants so the chat doesn't repeat
// the exact same line every time it can't parse anything.
export const CHAT_FALLBACK_REPLIES = [
  '편하게 컨디션이나 궁금한 증상을 말씀해주시면 제품을 추천해드릴게요! 예: "어깨가 결려요", "요즘 피곤해요"',
  '음... 조금 더 구체적으로 말씀해주시겠어요? 예: "허리가 아파요", "스트레스 받아요" 같은 식으로요 :)',
  '어떤 부분이 불편하신지 말씀해주시면 딱 맞는 제품을 찾아드릴게요! 예: "무릎이 아파요", "잠이 잘 안 와요"',
  '증상이나 컨디션을 편하게 적어주세요 — 예: "속이 더부룩해요", "요즘 예민해요" 이런 식으로도 좋아요.',
];

function pickFallbackReply(): string {
  return CHAT_FALLBACK_REPLIES[Math.floor(Math.random() * CHAT_FALLBACK_REPLIES.length)];
}

export function matchChatRule(input: string): ChatRule | null {
  const lower = input.toLowerCase();
  return CHAT_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) ?? null;
}

// --- General body-part / pain fallback -------------------------------------

type BodyPartCategory = {
  keys: string[]; // any of these substrings appearing in the extracted word matches this category
  productIds: string[];
};

// A handful of the most common "OO 아파요" body parts a pharmacy customer
// would actually say, mapped to a sensible real-catalog category. Not
// exhaustive by design — anything not covered here still gets a safe
// generic recommendation via FALLBACK_PRODUCT_IDS below.
const BODY_PART_CATEGORIES: BodyPartCategory[] = [
  { keys: ['허리'], productIds: ['r9', 'r8'] }, // 파스/찜질팩류
  { keys: ['머리', '두통'], productIds: ['r11'] }, // 두통약
  { keys: ['무릎', '관절'], productIds: ['r3', 'r7'] }, // 관절 영양제 + 파스
  { keys: ['목', '어깨'], productIds: ['r7', 'r9'] }, // 파스/마사지 제품
  { keys: ['눈'], productIds: ['p8', 'r1'] }, // 눈 영양/종합 비타민
  { keys: ['배', '속', '복부'], productIds: ['r2', 'p7'] }, // 소화제
  { keys: ['손목', '팔'], productIds: ['r7', 'r8'] }, // 파스류
  { keys: ['발목', '다리', '종아리'], productIds: ['r9', 'r7'] }, // 파스류
];

// Nothing in BODY_PART_CATEGORIES matched, but a symptom word was still
// extracted (e.g. an unusual body part) — always recommend *something*
// reasonably safe rather than coming back empty-handed.
const FALLBACK_PRODUCT_IDS = ['r7', 'p8']; // 종합 파스 + 종합 비타민

// Trigger stems, not full conjugated words — since neither Korean verb
// conjugation nor a trailing particle is anchored to the end of the
// string, matching just the STEM lets one entry cover every ending:
// '아파' already covers "아파", "아파요", "아파서"등; '아프' (the bare
// stem before a consonant-initial ending) covers "아프네요", "아프다",
// "아프고" 등 — these two look similar but Korean's 으-irregular
// conjugation actually contracts 아프+아 → 아파, so both stems are
// needed to catch every common ending. '결려'/'결림'/'결리' cover the
// "결리다" (stiff/sore) phrasing common for 목/어깨 ("어깨가 결려요").
const PAIN_TRIGGERS = ['아파', '아프', '아픔', '아픈', '통증', '결려', '결림', '결리'];

// Optional trailing particle after the symptom word — 이/가/은/는/도 all
// commonly appear ("머리가", "허리는", "무릎도") and none of them should
// block extraction of the underlying symptom word.
const PAIN_PATTERN = new RegExp(`([가-힣]{1,8}?)(?:이|가|은|는|도)?\\s*(?:${PAIN_TRIGGERS.join('|')})`);

// 종성(받침) 유무로 이/가 조사를 고른다 — 한글 완성형 음절의 코드포인트에서
// (code - 0xAC00) % 28 이 0이면 받침 없음(가), 아니면 받침 있음(이).
function hasBatchim(word: string): boolean {
  const ch = word.charCodeAt(word.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) return (ch - 0xac00) % 28 !== 0;
  return false;
}
function ihGa(word: string): string {
  return hasBatchim(word) ? '이' : '가';
}

function extractSymptom(input: string): string | null {
  const match = input.match(PAIN_PATTERN);
  return match ? match[1] : null;
}

function findBodyPartCategory(symptom: string): BodyPartCategory | null {
  return BODY_PART_CATEGORIES.find((cat) => cat.keys.some((k) => symptom.includes(k) || k.includes(symptom))) ?? null;
}

export type ChatResponse = { reply: string; productIds: string[] };

// The single entry point the chat screen calls — guaranteed to return a
// reply for ANY input, so the conversation never hits a dead end:
//   1. Known keyword (건조/피곤/다크서클/불면/소화/스트레스 등) → curated reply.
//   2. "OO 아파요/아프네요/아픔/통증" 패턴(조사 유무 무관) → mapped category,
//      or a safe generic recommendation if the body part isn't one we have
//      a mapping for.
//   3. Nothing matched at all (greeting, chatter, random text) → one of
//      several guidance replies, with no product attached.
export function parseSymptomAndRecommend(input: string): ChatResponse {
  const rule = matchChatRule(input);
  if (rule) return { reply: rule.reply, productIds: rule.productIds };

  const symptom = extractSymptom(input);
  if (symptom) {
    const category = findBodyPartCategory(symptom);
    if (category) {
      return {
        reply: `${symptom}${ihGa(symptom)} 있으시군요! 참약사에서 이런 걸 추천드려요.`,
        productIds: category.productIds,
      };
    }
    return {
      reply: `${symptom} 때문에 힘드시겠어요. 이런 제품이 도움될 수 있어요 :)`,
      productIds: FALLBACK_PRODUCT_IDS,
    };
  }

  return { reply: pickFallbackReply(), productIds: [] };
}

// Seed reply pair used once the conversation hands off to a human — see
// PHARMACIST_PROFILE in data/pharmacist.ts.
export const PHARMACIST_HANDOFF_LABEL = '참약사 약사에게 마저 물어보기';
