import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppBackground } from '@/components/glass/AppBackground';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PillButton } from '@/components/glass/PillButton';
import { ProductArt } from '@/components/glass/ProductArt';
import { RadarChart } from '@/components/glass/RadarChart';
import {
  AiRecommendation,
  BASIC_RADAR_AXES,
  ConditionId,
  CONDITIONS,
  GoalId,
  GOALS,
  ProfileAnswers,
  RADAR_AXES,
  axisCommentary,
  explainRecommendation,
} from '@/data/aiRecommendations';
import { PRODUCTS } from '@/data/mock';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatUsd } from '@/lib/format';
import { useTierStatus } from '@/lib/useTierStatus';
import { useQuizStore } from '@/store/useQuizStore';
import { useUiStore } from '@/store/useUiStore';

const ANALYSIS_STEPS = [
  '컨디션 데이터 분석 중',
  '목표 지표 매칭 중',
  '제품 카탈로그 대조 중',
  '개인화 리포트 생성 중',
];

type Step = 'intro' | 'conditions' | 'goals' | 'profile' | 'analyzing' | 'results';
const QUIZ_STEPS: Step[] = ['conditions', 'goals', 'profile'];

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasCompletedQuiz = useQuizStore((s) => s.hasCompletedQuiz);
  const [step, setStep] = useState<Step>(hasCompletedQuiz ? 'results' : 'intro');

  const conditions = useQuizStore((s) => s.conditions);
  const goals = useQuizStore((s) => s.goals);
  const profile = useQuizStore((s) => s.profile);
  const result = useQuizStore((s) => s.result);
  const toggleCondition = useQuizStore((s) => s.toggleCondition);
  const toggleGoal = useQuizStore((s) => s.toggleGoal);
  const setProfileField = useQuizStore((s) => s.setProfileField);
  const runAnalysis = useQuizStore((s) => s.runAnalysis);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const { tier } = useTierStatus();
  const isPrecision = tier.order >= 2; // Radiant Glass+

  const stepIndex = QUIZ_STEPS.indexOf(step);

  const goNext = () => {
    if (step === 'intro') return setStep('conditions');
    if (step === 'conditions') return setStep('goals');
    if (step === 'goals') return setStep('profile');
    if (step === 'profile') return setStep('analyzing');
  };
  const goBack = () => {
    if (step === 'conditions') return setStep('intro');
    if (step === 'goals') return setStep('conditions');
    if (step === 'profile') return setStep('goals');
  };

  return (
    <View style={styles.root}>
      <AppBackground />
      <View style={{ paddingTop: insets.top + spacing.md, flex: 1 }}>
        <View style={styles.topBar}>
          {step !== 'intro' && step !== 'analyzing' && step !== 'results' ? (
            <Pressable onPress={goBack} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
          {stepIndex >= 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((stepIndex + 1) / QUIZ_STEPS.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                STEP {stepIndex + 1} / {QUIZ_STEPS.length}
              </Text>
            </View>
          )}
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {step === 'intro' && <IntroStep onStart={goNext} />}
        {step === 'conditions' && (
          <ConditionsStep selected={conditions} onToggle={toggleCondition} onNext={goNext} />
        )}
        {step === 'goals' && <GoalsStep selected={goals} onToggle={toggleGoal} onNext={goNext} />}
        {step === 'profile' && (
          <ProfileStep profile={profile} onChange={setProfileField} onNext={goNext} />
        )}
        {step === 'analyzing' && (
          <AnalyzingStep
            onDone={() => {
              runAnalysis();
              setStep('results');
            }}
          />
        )}
        {step === 'results' && result && (
          <ResultsStep
            radar={result.radar}
            recommendations={result.recommendations}
            historyInsight={result.historyInsight}
            isPrecision={isPrecision}
            onFinish={() => router.replace('/')}
            onRetake={() => {
              resetQuiz();
              setStep('conditions');
            }}
          />
        )}
      </View>
    </View>
  );
}

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.introWrap}>
      <View style={styles.introBadge}>
        <Ionicons name="sparkles" size={20} color={colors.accentGold} />
      </View>
      <Text style={styles.introKicker}>AI 헬스 인텔리전스</Text>
      <Text style={styles.introTitle}>당신의 컨디션을{'\n'}데이터로 읽어드려요</Text>
      <Text style={styles.introBody}>
        간단한 체크 몇 가지로 현재 컨디션을 분석하고, 축적된 데이터를 기반으로 지금 필요한 제품을 매칭해요.
      </Text>
      <View style={styles.introStatsRow}>
        <View style={styles.introStat}>
          <Text style={styles.introStatNum}>3</Text>
          <Text style={styles.introStatLabel}>단계 체크</Text>
        </View>
        <View style={styles.introStatDivider} />
        <View style={styles.introStat}>
          <Text style={styles.introStatNum}>5</Text>
          <Text style={styles.introStatLabel}>축 리포트</Text>
        </View>
        <View style={styles.introStatDivider} />
        <View style={styles.introStat}>
          <Text style={styles.introStatNum}>~1분</Text>
          <Text style={styles.introStatLabel}>소요 시간</Text>
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <PillButton label="분석 시작하기" onPress={onStart} colors_={['#B18CFF', '#8C5CE0']} style={{ marginHorizontal: spacing.xl }} />
      <Text style={styles.disclaimerSmall}>본 진단은 건강기능식품 추천을 위한 참고 자료이며 의학적 진단이 아닙니다.</Text>
    </Animated.View>
  );
}

function ConditionsStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: ConditionId[];
  onToggle: (id: ConditionId) => void;
  onNext: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>요즘 느끼는 컨디션을{'\n'}모두 선택해 주세요</Text>
        <Text style={styles.stepSub}>해당하는 항목을 자유롭게 선택할 수 있어요.</Text>
        <View style={styles.chipGrid}>
          {CONDITIONS.map((c) => {
            const active = selected.includes(c.id);
            return (
              <Pressable key={c.id} onPress={() => onToggle(c.id)} style={styles.chipItem}>
                <View style={[styles.checkCard, active && styles.checkCardActive]}>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Ionicons name="checkmark" size={13} color="#0B0B0D" />}
                  </View>
                  <Text style={[styles.checkLabel, active && styles.checkLabelActive]}>{c.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.stepFooter}>
        <PillButton
          label={selected.length > 0 ? `다음 (${selected.length}개 선택)` : '다음'}
          onPress={onNext}
          disabled={selected.length === 0}
        />
      </View>
    </Animated.View>
  );
}

function GoalsStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: GoalId[];
  onToggle: (id: GoalId) => void;
  onNext: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>어떤 변화를{'\n'}원하시나요?</Text>
        <Text style={styles.stepSub}>목표에 맞춰 추천 우선순위를 조정해요.</Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          {GOALS.map((g) => {
            const active = selected.includes(g.id);
            return (
              <Pressable key={g.id} onPress={() => onToggle(g.id)}>
                <View style={[styles.goalRow, active && styles.goalRowActive]}>
                  <Text style={[styles.checkLabel, active && styles.checkLabelActive]}>{g.label}</Text>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Ionicons name="checkmark" size={13} color="#0B0B0D" />}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.stepFooter}>
        <PillButton
          label={selected.length > 0 ? `다음 (${selected.length}개 선택)` : '다음'}
          onPress={onNext}
          disabled={selected.length === 0}
        />
      </View>
    </Animated.View>
  );
}

function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.segLabel}>{label}</Text>
      <View style={styles.segRow}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable key={opt} onPress={() => onChange(opt)} style={{ flex: 1 }}>
              <View style={[styles.segOption, active && styles.segOptionActive]}>
                <Text style={[styles.segOptionText, active && styles.segOptionTextActive]}>{opt}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ProfileStep({
  profile,
  onChange,
  onNext,
}: {
  profile: ProfileAnswers;
  onChange: <K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => void;
  onNext: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>간단한 프로필을{'\n'}알려주세요</Text>
        <Text style={styles.stepSub}>리포트 정확도를 높이는 데 사용돼요.</Text>
        <View style={{ marginTop: spacing.lg }}>
          <SegmentedRow
            label="연령대"
            options={['10대', '20대', '30대', '40대', '50대+'] as const}
            value={profile.ageRange}
            onChange={(v) => onChange('ageRange', v)}
          />
          <SegmentedRow
            label="성별"
            options={['여성', '남성', '선택 안 함'] as const}
            value={profile.gender}
            onChange={(v) => onChange('gender', v)}
          />
          <SegmentedRow
            label="평균 수면 시간"
            options={['5시간 미만', '5~7시간', '7시간 이상'] as const}
            value={profile.sleepHours}
            onChange={(v) => onChange('sleepHours', v)}
          />
          <SegmentedRow
            label="카페인 섭취 빈도"
            options={['거의 안 함', '주 2~3회', '매일'] as const}
            value={profile.caffeineFreq}
            onChange={(v) => onChange('caffeineFreq', v)}
          />
        </View>
      </ScrollView>
      <View style={styles.stepFooter}>
        <PillButton label="분석 시작" onPress={onNext} colors_={['#B18CFF', '#8C5CE0']} />
      </View>
    </Animated.View>
  );
}

function AnalyzingStep({ onDone }: { onDone: () => void }) {
  const [doneCount, setDoneCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    ANALYSIS_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setDoneCount(i + 1), 650 * (i + 1));
      timers.current.push(t);
    });
    const finalTimer = setTimeout(onDone, 650 * ANALYSIS_STEPS.length + 500);
    timers.current.push(finalTimer);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.analyzingWrap}>
      <PulsingRing />
      <Text style={styles.analyzingTitle}>AI가 분석 중입니다</Text>
      <View style={{ marginTop: spacing.xl, width: '100%', gap: spacing.md }}>
        {ANALYSIS_STEPS.map((label, i) => {
          const done = i < doneCount;
          const active = i === doneCount;
          return (
            <View key={label} style={styles.analyzingRow}>
              <View style={[styles.analyzingDot, done && styles.analyzingDotDone, active && styles.analyzingDotActive]}>
                {done && <Ionicons name="checkmark" size={12} color="#0B0B0D" />}
              </View>
              <Text style={[styles.analyzingLabel, (done || active) && styles.analyzingLabelActive]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PulsingRing() {
  const scale = useSharedValue(0.9);
  useEffect(() => {
    const loop = () => {
      scale.value = withTiming(1.08, { duration: 900 }, () => {
        scale.value = withTiming(0.9, { duration: 900 });
      });
    };
    loop();
    const interval = setInterval(loop, 1800);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.pulsingRing, style]}>
      <Ionicons name="sparkles" size={28} color={colors.accentViolet} />
    </Animated.View>
  );
}

function ResultsStep({
  radar,
  recommendations,
  historyInsight,
  isPrecision,
  onFinish,
  onRetake,
}: {
  radar: Record<string, number>;
  recommendations: AiRecommendation[];
  historyInsight: string | null;
  isPrecision: boolean;
  onFinish: () => void;
  onRetake: () => void;
}) {
  const { tier } = useTierStatus();
  const openPayment = useUiStore((s) => s.openPayment);
  const axes = isPrecision ? RADAR_AXES : RADAR_AXES.filter((a) => BASIC_RADAR_AXES.includes(a.id as any));
  const lockedAxes = RADAR_AXES.filter((a) => !BASIC_RADAR_AXES.includes(a.id as any));
  const topScore = recommendations[0]?.score ?? 78;

  const products = recommendations
    .map((rec) => ({ rec, product: PRODUCTS.find((p) => p.id === rec.productId) }))
    .filter((x): x is { rec: AiRecommendation; product: (typeof PRODUCTS)[number] } => !!x.product);
  const bundlePrice = products.reduce((sum, { product }) => sum + product.priceUSD * (1 - tier.discountPct / 100), 0);

  return (
    <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.resultsKicker}>컨디션 리포트 · 실시간 분석</Text>
      <Text style={styles.stepTitle}>AI 매칭률 {topScore}%</Text>
      <Text style={styles.stepSub}>선택한 컨디션과 목표를 기반으로 개인 맞춤 인텔리전스가 분석했어요.</Text>

      <View style={{ marginTop: spacing.lg }}>
        <RadarGlowCard>
          <RadarChart axes={axes} scores={radar} size={220} />
        </RadarGlowCard>
      </View>

      {historyInsight && (
        <View style={styles.historyInsightCard}>
          <Ionicons name="time-outline" size={13} color={colors.accentGold} />
          <Text style={styles.historyInsightText}>{historyInsight}</Text>
        </View>
      )}

      {!isPrecision && lockedAxes.length > 0 && (
        <View style={styles.lockChipRow}>
          {lockedAxes.map((axis) => (
            <View key={axis.id} style={styles.lockChip}>
              <Ionicons name="lock-closed" size={11} color={colors.textFaint} />
              <Text style={styles.lockChipText}>{axis.label} 분석 — Radiant Glass 등급부터 잠금 해제</Text>
            </View>
          ))}
        </View>
      )}

      {isPrecision && (
        <View style={{ marginTop: spacing.lg, gap: 6 }}>
          {RADAR_AXES.map((axis) => (
            <Text key={axis.id} style={styles.commentaryText}>
              · {axisCommentary(axis.id, radar[axis.id] ?? 0)}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>AI 매칭 추천 제품</Text>
      <View style={{ gap: spacing.md }}>
        {products.map(({ rec, product }) => (
          <GlassSurface key={rec.productId} radius={radius.lg} padding={spacing.md}>
            <View style={styles.recRow}>
              <ProductArt seed={product.id} shape={product.shape} style={styles.recImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recBrand}>{product.brand}</Text>
                <Text style={styles.recName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.recPrice}>{formatUsd(product.priceUSD)}</Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>{rec.score}%</Text>
                <Text style={styles.matchBadgeSub}>매칭</Text>
              </View>
            </View>
            <View style={styles.reasonRow}>
              <Ionicons name="sparkles" size={11} color={colors.accentGold} />
              <Text style={styles.reasonText}>{explainRecommendation(rec.reasons)}</Text>
            </View>
          </GlassSurface>
        ))}
      </View>

      <PillButton
        label={`지금 담기 · ${formatUsd(bundlePrice)}`}
        onPress={() =>
          openPayment(
            {
              kind: 'product',
              title: `AI 추천 제품 ${products.length}건`,
              subtitle: 'AI 헬스 인텔리전스',
              priceUSD: bundlePrice,
            },
            onFinish
          )
        }
        colors_={['#B18CFF', '#8C5CE0']}
        style={{ marginTop: spacing.xl }}
      />
      <Text style={styles.payHint}>스테이블코인 · 신용카드 · $GLAS 결제 지원</Text>
      <Text style={styles.disclaimerSmall}>
        이 리포트는 건강기능식품 추천이며 의학적 진단이 아닙니다.
      </Text>
      <View style={styles.resultsFooterRow}>
        <Pressable onPress={onRetake}>
          <Text style={styles.skipText}>다시 진단하기</Text>
        </Pressable>
        <Pressable onPress={onFinish}>
          <Text style={styles.skipText}>홈으로 돌아가기</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RadarGlowCard({ children }: { children: React.ReactNode }) {
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1600 }), withTiming(0.5, { duration: 1600 })),
      -1,
      true
    );
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <GlassSurface elevated radius={radius.xl} padding={spacing.lg} style={{ alignItems: 'center', overflow: 'hidden' }}>
        <Animated.View style={[styles.radarGlow, glowStyle]} />
        {children}
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  progressWrap: { flex: 1 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accentViolet, borderRadius: 2 },
  progressLabel: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textFaint, marginTop: 4, textAlign: 'center' },

  introWrap: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  introBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(232,196,104,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  introKicker: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.accentViolet, letterSpacing: 1 },
  introTitle: { fontFamily: fonts.display, fontSize: 28, color: colors.text, marginTop: spacing.sm, lineHeight: 36 },
  introBody: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
  introStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxl },
  introStat: { flex: 1, alignItems: 'center' },
  introStatNum: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  introStatLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  introStatDivider: { width: 1, height: 28, backgroundColor: colors.borderDim },
  disclaimerSmall: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    lineHeight: 15,
  },

  stepScroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 140 },
  stepTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text, lineHeight: 30 },
  stepSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  stepFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  chipItem: { width: '47%' },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  checkCardActive: { backgroundColor: 'rgba(177,140,255,0.1)', borderColor: colors.accentViolet },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  checkLabel: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted, flex: 1 },
  checkLabelActive: { color: colors.text, fontFamily: fonts.bodySemi },

  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  goalRowActive: { backgroundColor: 'rgba(177,140,255,0.1)', borderColor: colors.accentViolet },

  segLabel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.text, marginBottom: spacing.sm },
  segRow: { flexDirection: 'row', gap: 6 },
  segOption: {
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderDim,
  },
  segOptionActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  segOptionText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted },
  segOptionTextActive: { color: '#0B0B0D', fontFamily: fonts.bodyBold },

  analyzingWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  pulsingRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(177,140,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(177,140,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingTitle: { fontFamily: fonts.displaySemi, fontSize: 17, color: colors.text, marginTop: spacing.lg },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  analyzingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingDotActive: { borderColor: colors.accentViolet },
  analyzingDotDone: { backgroundColor: colors.accentGold, borderColor: colors.accentGold },
  analyzingLabel: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.textFaint },
  analyzingLabelActive: { color: colors.text },

  resultsKicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.accentGold, letterSpacing: 1, textTransform: 'uppercase' },
  radarGlow: {
    position: 'absolute',
    top: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(177,140,255,0.16)',
  },
  historyInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(232,196,104,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  historyInsightText: { flex: 1, fontFamily: fonts.bodyMed, fontSize: 11.5, color: colors.text, lineHeight: 16 },
  lockChipRow: { marginTop: spacing.md, gap: 6 },
  lockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  lockChipText: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted, flex: 1 },
  commentaryText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recImg: { width: 52, height: 64, borderRadius: radius.sm },
  recBrand: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted },
  recName: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 2 },
  recPrice: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text, marginTop: 4 },
  matchBadge: { alignItems: 'center' },
  matchBadgeText: { fontFamily: fonts.display, fontSize: 15, color: colors.accentGold },
  matchBadgeSub: { fontFamily: fonts.bodyMed, fontSize: 9, color: colors.textFaint },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
  },
  reasonText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, flex: 1, lineHeight: 15 },
  payHint: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  skipText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  resultsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
