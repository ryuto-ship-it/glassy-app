import { PRODUCTS } from '@/data/mock';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useQuizStore } from '@/store/useQuizStore';

// Bridges the account-wide AI quiz (useQuizStore, "본인" only) with the
// per-family-member seed snapshots (data/family.ts) so the home screen can
// show one consistent "AI가 추천하는 이 사람 맞춤 제품" section regardless
// of which family member is active.
export function useFamilyRecommendations() {
  const members = useFamilyStore((s) => s.members);
  const activeMemberId = useFamilyStore((s) => s.activeMemberId);
  const quizResult = useQuizStore((s) => s.result);
  const hasCompletedQuiz = useQuizStore((s) => s.hasCompletedQuiz);

  const member = members.find((m) => m.id === activeMemberId) ?? members[0];
  const isSelf = member.relation === 'self';

  if (isSelf) {
    const products = hasCompletedQuiz && quizResult
      ? quizResult.recommendations.map((r) => PRODUCTS.find((p) => p.id === r.productId)).filter(Boolean)
      : member.focusProductIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
    return {
      member,
      radar: hasCompletedQuiz && quizResult ? quizResult.radar : null,
      insight: quizResult?.historyInsight ?? null,
      products: products as typeof PRODUCTS,
      hasLiveDiagnosis: hasCompletedQuiz,
    };
  }

  const products = member.focusProductIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS;
  return {
    member,
    radar: member.seedRadar,
    insight: member.seedInsight || null,
    products,
    hasLiveDiagnosis: member.lastCheckedDaysAgo >= 0,
  };
}
