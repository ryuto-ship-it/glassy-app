import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// Placeholder — fleshed out into the full camera-mock scan demo later.
export default function ScanScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>스캔 데모 준비 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bodyMed, color: colors.textMuted },
});
