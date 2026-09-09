// 신뢰 신호 스포트라이트 — 참약사 약사 인증 코멘트 + 실제 이용자 후기 톤의
// 인용을 가로 스크롤로 노출한다. 실제 참약사 소속 약사/고객 데이터 연동은
// 없으므로 브랜드 정체성에 맞춘 시드 데이터로 구성했다.
export type TrustQuote = {
  id: string;
  kind: 'pharmacist' | 'review';
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating?: number;
};

export const TRUST_QUOTES: TrustQuote[] = [
  {
    id: 'tq1',
    kind: 'pharmacist',
    name: '김서연 약사',
    role: '참약사 명동점 · 인증 약사',
    avatar: 'https://i.pravatar.cc/300?img=45',
    quote: '참약사 약사가 직접 검증한 추천입니다. AI 1차 분석 후 제가 다시 한번 확인해요.',
    rating: 5,
  },
  {
    id: 'tq2',
    kind: 'review',
    name: '이*은',
    role: '참약사 강남점 이용 고객',
    avatar: 'https://i.pravatar.cc/300?img=32',
    quote: 'AI 진단이 생각보다 정확해서 놀랐어요. 약사님 상담까지 이어져서 더 믿음이 갔어요.',
    rating: 5,
  },
  {
    id: 'tq3',
    kind: 'pharmacist',
    name: '박도윤 약사',
    role: '참약사 판교점 · 인증 약사',
    avatar: 'https://i.pravatar.cc/300?img=51',
    quote: '가족 프로필로 부모님 건강까지 함께 챙길 수 있는 게 참약사만의 강점이라고 생각해요.',
    rating: 5,
  },
  {
    id: 'tq4',
    kind: 'review',
    name: '최*우',
    role: '참약사 홍대점 이용 고객',
    avatar: 'https://i.pravatar.cc/300?img=12',
    quote: '전국 매장 어디서든 리워드가 쌓여서 여행 다닐 때도 부담 없이 써요.',
    rating: 4,
  },
];
