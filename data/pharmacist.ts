// Seed data for the "참약사 약사 1:1 상담" hand-off — a mocked human-in-the
// loop layer on top of the rule-based AI chat. No real messaging backend;
// these are pre-written replies that appear as if they already arrived.
export const PHARMACIST_PROFILE = {
  name: '김서연 약사',
  title: '참약사 명동점',
  avatar: 'https://i.pravatar.cc/300?img=45',
  badge: '참약사 인증 약사',
};

export type PharmacistReply = { delaySec: number; text: string };

// Generic 1-2 message reply set shown after the AI-summary card, regardless
// of what the user actually typed — a mocked "already arrived" feel, not a
// live chat.
export const PHARMACIST_REPLIES: PharmacistReply[] = [
  {
    delaySec: 2,
    text: 'AI 상담 요약 확인했습니다! 우선 알려주신 내용 기준으로는 무리한 진단보다 꾸준한 케어가 더 중요해 보여요.',
  },
  {
    delaySec: 6,
    text: '제품은 AI가 추천드린 것부터 2주 정도 사용해보시고, 변화가 크지 않으면 참약사 명동점 방문 시 직접 피부/컨디션 체크해드릴게요 🙂',
  },
];

export const PHARMACIST_SUMMARY_PREFIX = 'AI 1차 상담 요약이 전달되었습니다';
