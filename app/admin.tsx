import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// Placeholder — fleshed out into the full admin analytics dashboard later.
export default function AdminScreen() {
  const router = useRouter();
  void router;
  return (
    <View style={styles.root}>
      <Text style={styles.text}>관리자 대시보드 준비 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bodyMed, color: colors.textMuted },
});
