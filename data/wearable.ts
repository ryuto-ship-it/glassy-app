// Mock wearable vitals + rule-based interpretation for the Profile "내
// 컨디션" screen (Mode A — wearable connected). No real device data; this
// is a fixed 7-day mock series with a deliberate recent dip in sleep/
// stress so the AI-interpretation and recommendation rules have something
// to react to.

export type DailyVitals = {
  date: string; // ISO date
  heartRateAvg: number;
  heartRateMax: number;
  heartRateMin: number;
  sleepHours: number;
  sleepDeepPct: number;
  sleepRemPct: number;
  sleepLightPct: number;
  spo2: number;
  stressLevel: number; // 0-100
};

function daysAgoIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const WEARABLE_VITALS: DailyVitals[] = [
  { date: daysAgoIso(6), heartRateAvg: 68, heartRateMax: 92, heartRateMin: 58, sleepHours: 7.2, sleepDeepPct: 28, sleepRemPct: 22, sleepLightPct: 50, spo2: 97, stressLevel: 32 },
  { date: daysAgoIso(5), heartRateAvg: 70, heartRateMax: 95, heartRateMin: 59, sleepHours: 7.0, sleepDeepPct: 26, sleepRemPct: 21, sleepLightPct: 53, spo2: 97, stressLevel: 35 },
  { date: daysAgoIso(4), heartRateAvg: 71, heartRateMax: 96, heartRateMin: 60, sleepHours: 6.5, sleepDeepPct: 22, sleepRemPct: 20, sleepLightPct: 58, spo2: 96, stressLevel: 45 },
  { date: daysAgoIso(3), heartRateAvg: 74, heartRateMax: 99, heartRateMin: 61, sleepHours: 5.8, sleepDeepPct: 18, sleepRemPct: 18, sleepLightPct: 64, spo2: 95, stressLevel: 58 },
  { date: daysAgoIso(2), heartRateAvg: 76, heartRateMax: 101, heartRateMin: 62, sleepHours: 5.5, sleepDeepPct: 16, sleepRemPct: 17, sleepLightPct: 67, spo2: 94, stressLevel: 64 },
  { date: daysAgoIso(1), heartRateAvg: 77, heartRateMax: 103, heartRateMin: 63, sleepHours: 5.2, sleepDeepPct: 15, sleepRemPct: 16, sleepLightPct: 69, spo2: 94, stressLevel: 68 },
  { date: daysAgoIso(0), heartRateAvg: 78, heartRateMax: 104, heartRateMin: 64, sleepHours: 5.4, sleepDeepPct: 16, sleepRemPct: 17, sleepLightPct: 67, spo2: 94, stressLevel: 66 },
];

// Whoop-style blended score — deliberately still "양호" even though the
// last few days dipped, since recovery blends more than just the last
// day's numbers. The AI interpretation below still flags the dip.
export const RECOVERY_SCORE_TODAY = 72;

export function recoveryLabel(score: number): string {
  if (score >= 67) return '양호';
  if (score >= 34) return '보통';
  return '주의';
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type WearableInsight = {
  comment: string;
  productIds: string[];
  reasons: Record<string, string>;
};

export function getWearableInsight(vitals: DailyVitals[]): WearableInsight {
  const last3 = vitals.slice(-3);
  const weekStressAvg = average(vitals.map((v) => v.stressLevel));
  const last3StressAvg = average(last3.map((v) => v.stressLevel));
  const weekSleepAvg = average(vitals.map((v) => v.sleepHours));
  const last3SleepAvg = average(last3.map((v) => v.sleepHours));
  const todaySpo2 = vitals[vitals.length - 1].spo2;

  const stressUp = last3StressAvg > weekStressAvg + 5;
  const sleepDown = last3SleepAvg < weekSleepAvg - 0.4;
  const spo2Low = todaySpo2 < 96;

  const productIds: string[] = [];
  const reasons: Record<string, string> = {};

  if (stressUp && sleepDown) {
    productIds.push('w1');
    reasons.w1 = '스트레스와 수면 저하가 함께 나타나 마그네슘·테아닌 조합이 도움이 될 수 있어요.';
  }
  if (spo2Low) {
    productIds.push('w2');
    reasons.w2 = '산소포화도가 평소보다 낮아 철분·비타민B 보충이 도움이 될 수 있어요.';
  }
  if (productIds.length < 3) {
    productIds.push('p8');
    reasons.p8 = '전반적인 컨디션 관리에 꾸준히 도움이 돼요.';
  }

  const comment =
    stressUp && sleepDown
      ? '지난 3일간 수면의 질이 낮고 스트레스 지수가 평소보다 높습니다. 회복 점수는 아직 양호하지만, 이 패턴이 계속되면 영향을 줄 수 있어요.'
      : '전반적으로 양호한 컨디션을 유지하고 있어요. 지금 페이스를 유지해보세요.';

  return { comment, productIds, reasons };
}
