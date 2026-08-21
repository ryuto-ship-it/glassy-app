import { create } from 'zustand';

import {
  AiResult,
  computeAiResult,
  ConditionId,
  DEFAULT_PROFILE,
  GoalId,
  ProfileAnswers,
} from '@/data/aiRecommendations';

function seedPastResult(): AiResult {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return {
    radar: { fatigue: 52, hydration: 58, elasticity: 64, immunity: 60, sleep: 48 },
    recommendations: [],
    generatedAt: d.toISOString(),
  };
}

type QuizState = {
  conditions: ConditionId[];
  goals: GoalId[];
  profile: ProfileAnswers;
  result: AiResult | null;
  history: AiResult[]; // most recent first, excludes `result`
  hasCompletedQuiz: boolean;

  toggleCondition: (id: ConditionId) => void;
  toggleGoal: (id: GoalId) => void;
  setProfileField: <K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => void;
  runAnalysis: () => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  conditions: [],
  goals: [],
  profile: DEFAULT_PROFILE,
  result: null,
  history: [seedPastResult()],
  hasCompletedQuiz: false,

  toggleCondition: (id) =>
    set((s) => ({
      conditions: s.conditions.includes(id) ? s.conditions.filter((c) => c !== id) : [...s.conditions, id],
    })),

  toggleGoal: (id) =>
    set((s) => ({
      goals: s.goals.includes(id) ? s.goals.filter((g) => g !== id) : [...s.goals, id],
    })),

  setProfileField: (key, value) => set((s) => ({ profile: { ...s.profile, [key]: value } })),

  runAnalysis: () => {
    const { conditions, goals, profile, result: prevResult, history } = get();
    const result = computeAiResult(conditions, goals, profile);
    set({
      result,
      hasCompletedQuiz: true,
      history: prevResult ? [prevResult, ...history] : history,
    });
  },

  resetQuiz: () => set({ conditions: [], goals: [], profile: DEFAULT_PROFILE, result: null }),
}));
