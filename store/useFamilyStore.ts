import { create } from 'zustand';

import { FAMILY_MEMBERS, FamilyMember, FamilyRelation } from '@/data/family';

type FamilyState = {
  members: FamilyMember[];
  activeMemberId: string;
  // Set once on the welcome flow's "혼자 / 가족과 함께" branch — purely
  // cosmetic (nudges the family section open) so the answer isn't lost the
  // instant the modal closes.
  travelingWithFamily: boolean;

  setActiveMember: (id: string) => void;
  addMember: (name: string, relation: FamilyRelation) => void;
  setTravelingWithFamily: (value: boolean) => void;
};

let seq = 0;

export const useFamilyStore = create<FamilyState>((set) => ({
  members: FAMILY_MEMBERS,
  activeMemberId: 'self',
  travelingWithFamily: false,

  setActiveMember: (id) => set({ activeMemberId: id }),

  addMember: (name, relation) =>
    set((s) => {
      seq += 1;
      const avatarSeed = 30 + ((s.members.length + seq) % 60);
      const focusByRelation: Record<FamilyRelation, { label: string; productIds: string[] }> = {
        self: { label: 'AI 맞춤 케어', productIds: ['r6', 'p4', 'r3'] },
        spouse: { label: '피부 보습 케어', productIds: ['r6', 'r5', 'p4'] },
        child: { label: '성장기 영양 케어', productIds: ['r1', 'p8', 'w2'] },
        parent: { label: '관절 · 혈행 케어', productIds: ['r3', 'r7', 'w1'] },
      };
      const focus = focusByRelation[relation];
      const newMember: FamilyMember = {
        id: `member-${seq}`,
        name,
        relation,
        avatar: `https://i.pravatar.cc/300?img=${avatarSeed}`,
        focusLabel: focus.label,
        focusProductIds: focus.productIds,
        seedRadar: { fatigue: 70, hydration: 70, elasticity: 70, immunity: 70, sleep: 70 },
        seedInsight: '첫 컨디션 체크를 아직 하지 않았어요. AI 진단을 받아보세요.',
        lastCheckedDaysAgo: -1,
      };
      return { members: [...s.members, newMember], activeMemberId: newMember.id };
    }),

  setTravelingWithFamily: (value) => set({ travelingWithFamily: value }),
}));
