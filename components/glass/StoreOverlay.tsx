import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

// 홈 배경 상단의 "참약사 매장" 반투명 오버레이. 프로젝트에는 참약사 실제
// 매장 인테리어 사진 파일이 없어서(브랜드사 자산을 직접 스크래핑하지
// 않기로 한 정책), 대신 브랜드 컬러 기반의 프리미엄 일러스트(매장/조제/
// 케어 아이콘 패턴)로 대체했다 — 실제 매장 사진이 확보되면 이 컴포넌트의
// 배경을 <Image>로 교체하면 된다.
const ICONS: Array<{ name: keyof typeof Ionicons.glyphMap; top: number; left: number; size: number; opacity: number }> = [
  { name: 'storefront-outline', top: 6, left: 18, size: 46, opacity: 0.16 },
  { name: 'medkit-outline', top: 40, left: 260, size: 34, opacity: 0.14 },
  { name: 'leaf-outline', top: -4, left: 320, size: 30, opacity: 0.13 },
  { name: 'flask-outline', top: 66, left: 90, size: 26, opacity: 0.12 },
  { name: 'heart-outline', top: 20, left: 200, size: 22, opacity: 0.12 },
];

export function StoreOverlay() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={['rgba(27,95,168,0.14)', 'rgba(27,95,168,0)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {ICONS.map((ic, i) => (
        <Ionicons key={i} name={ic.name} size={ic.size} color="#1B5FA8" style={{ position: 'absolute', top: ic.top, left: ic.left, opacity: ic.opacity }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, overflow: 'hidden' },
});
