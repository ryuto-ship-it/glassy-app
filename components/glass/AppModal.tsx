import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Modal as RNModal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { colors, darkColors, radius } from '@/constants/theme';
import { useIsDarkScope } from '@/constants/themeScope';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
};

// RN's <Modal> renders through a portal straight to document.body on web,
// which escapes the phone-frame DOM entirely. AppModal fixes that: on web
// it's a plain absolutely-positioned bottom sheet rendered in-tree (so it
// stays clipped to whichever ancestor fills the phone screen), and on
// native it falls back to the real Modal — full-screen there is correct
// since there's no frame to escape.
export function AppModal({ visible, onClose, children, dismissable = true }: Props) {
  const dark = useIsDarkScope();
  const c = dark ? darkColors : colors;
  const sheetStyle = [styles.sheet, { backgroundColor: c.surface, borderColor: c.border }];
  const grabberStyle = [styles.grabber, { backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)' }];
  const topEdgeColors = dark
    ? (['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)'] as const)
    : (['rgba(0,0,0,0.06)', 'rgba(0,0,0,0)'] as const);

  if (Platform.OS !== 'web') {
    return (
      <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={dismissable ? onClose : undefined} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={sheetStyle}>
          <View style={grabberStyle} />
          <LinearGradient
            colors={topEdgeColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topEdge}
          />
          {children}
        </View>
        </View>
      </RNModal>
    );
  }

  if (!visible) return null;

  return (
    <View style={styles.webRoot} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={styles.backdrop} onPress={dismissable ? onClose : undefined} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(280)}
        exiting={SlideOutDown.duration(200)}
        style={styles.sheetWrap}
        pointerEvents="box-none"
      >
        <View style={sheetStyle}>
          <View style={grabberStyle} />
          <LinearGradient
            colors={topEdgeColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topEdge}
          />
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 500,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingBottom: 28,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 10,
    marginBottom: 2,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
