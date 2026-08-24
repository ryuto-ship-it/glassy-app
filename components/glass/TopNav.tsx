import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// The horizontal top bar for the dark browser showcase backdrop (see
// PhoneFrame.tsx). Sits above everything, full-width, independent of the
// centered phone bezel. Web-only, same reasoning as SidePanel.
import { darkColors as colors, darkShadow as shadow, fonts, palette } from '@/constants/theme';

const GITHUB_URL = 'https://github.com/ryuto-ship-it/glassy-app';
const WHITEPAPER_URL = '/glassy-app/whitepaper.html';

function openExternal(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function NavLink({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.linkHit}>
      <Text style={[styles.linkText, active && styles.linkTextActive]}>{label}</Text>
      {active && <View style={styles.linkActiveBar} />}
    </Pressable>
  );
}

export function TopNav() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.brandRow}>
          <Ionicons name="sparkles" size={15} color={palette.gold} />
          <Text style={styles.brand}>GLASSY</Text>
        </View>
        <View style={styles.links}>
          <NavLink label="App Demo" active onPress={() => {}} />
          <NavLink label="Whitepaper" onPress={() => openExternal(WHITEPAPER_URL)} />
          <NavLink label="GitHub" onPress={() => openExternal(GITHUB_URL)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backdropFilter: 'blur(14px)',
    backgroundColor: 'rgba(10,10,12,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    ...shadow.soft,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1180,
    width: '100%',
    marginHorizontal: 'auto' as unknown as number,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brand: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 1.2,
    color: colors.text,
  },
  links: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  linkHit: { paddingVertical: 4, alignItems: 'center' },
  linkText: {
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  linkTextActive: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
  },
  linkActiveBar: {
    marginTop: 4,
    height: 2,
    width: 18,
    borderRadius: 1,
    backgroundColor: palette.gold,
  },
});
