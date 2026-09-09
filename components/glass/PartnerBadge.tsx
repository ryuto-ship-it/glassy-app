import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius, spacing } from '@/constants/theme';

// 참약사 "공식 인증 파트너" 배지 — 벤토 그리드의 medium 카드로, 골드 리본
// 아이콘과 함께 파트너십을 눈에 띄게 드러낸다.
export function PartnerBadge() {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#2A2110', '#1D1A2E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.ribbonWrap}>
        <Ionicons name="ribbon" size={22} color="#E8C468" />
      </View>
      <Text style={styles.title}>참약사{'\n'}공식 인증 파트너</Text>
      <Text style={styles.sub}>전국 200+ 매장 제휴</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.35)',
    shadowColor: '#C79A3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  ribbonWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232,196,104,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.displaySemi, fontSize: 13, color: '#FFFFFF', marginTop: spacing.sm, lineHeight: 17 },
  sub: { fontFamily: fonts.bodyMed, fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
});
