import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, fonts, TAGLINE } from '@/constants/theme';

const FRAME_WIDTH = 412;
const FRAME_HEIGHT = 896;
const BEZEL = 7;
const MARGIN_X = 20;
const MAX_HEIGHT_RATIO = 0.94;

// On web, the app is shown as a live product-showcase — centered inside a
// dark phone bezel on a moody radial backdrop — instead of stretching edge
// to edge in the browser. On native (iOS/Android) this is a hard no-op via
// the early return below: children render full-screen exactly as before,
// with no wrapping view at all.
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  return <WebStage>{children}</WebStage>;
}

function WebStage({ children }: { children: React.ReactNode }) {
  const { width: winW, height: winH } = useWindowDimensions();
  const outerW = FRAME_WIDTH + BEZEL * 2;
  const outerH = FRAME_HEIGHT + BEZEL * 2;
  const scaleW = (winW - MARGIN_X * 2) / outerW;
  const scaleH = (winH * MAX_HEIGHT_RATIO) / outerH;
  const scale = Math.min(1, scaleW, scaleH);
  const showWatermarks = winW - outerW * scale > 220;

  return (
    <View style={styles.stage}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="stageGrad" cx="50%" cy="42%" r="75%">
            <Stop offset="0" stopColor="#0A0A0C" />
            <Stop offset="1" stopColor="#050505" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stageGrad)" />
      </Svg>

      {showWatermarks && (
        <>
          <View style={[styles.watermark, styles.watermarkLeft]}>
            <Text style={styles.watermarkTitle}>GLASSY</Text>
            <Text style={styles.watermarkTagline}>{TAGLINE}</Text>
          </View>
          <View style={[styles.watermark, styles.watermarkRight]}>
            <Text style={[styles.watermarkTitle, styles.watermarkTitleRight]}>GLASSY</Text>
            <Text style={[styles.watermarkTagline, styles.watermarkTaglineRight]}>{TAGLINE}</Text>
          </View>
        </>
      )}

      <View
        style={[
          styles.bezel,
          {
            width: outerW,
            height: outerH,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Dynamic Island */}
        <View style={styles.island} />
        <View style={styles.screen}>
          {children}
          {/* Home indicator — overlays app content, never blocks touches */}
          <View style={styles.homeIndicator} pointerEvents="none" />
        </View>
        {/* right side: power button */}
        <View style={styles.powerButton} />
        {/* left side: mute switch + volume up/down */}
        <View style={styles.muteSwitch} />
        <View style={styles.volumeUp} />
        <View style={styles.volumeDown} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
  },
  watermarkLeft: { left: 36 },
  watermarkRight: { right: 36, alignItems: 'flex-end' },
  watermarkTitle: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.14)',
  },
  watermarkTitleRight: { textAlign: 'right' },
  watermarkTagline: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.09)',
    marginTop: 3,
  },
  watermarkTaglineRight: { textAlign: 'right' },
  bezel: {
    backgroundColor: '#0C0C0E',
    borderRadius: 46,
    padding: BEZEL,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.65,
    shadowRadius: 60,
  },
  island: {
    position: 'absolute',
    top: BEZEL + 11,
    left: '50%',
    marginLeft: -58,
    width: 116,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    zIndex: 10,
  },
  screen: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    paddingTop: 30,
    paddingBottom: 6,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 7,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 4,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  powerButton: {
    position: 'absolute',
    right: -2,
    top: 148,
    width: 2.5,
    height: 84,
    borderRadius: 1.5,
    backgroundColor: '#232327',
  },
  muteSwitch: {
    position: 'absolute',
    left: -2,
    top: 108,
    width: 2.5,
    height: 22,
    borderRadius: 1.5,
    backgroundColor: '#232327',
  },
  volumeUp: {
    position: 'absolute',
    left: -2,
    top: 152,
    width: 2.5,
    height: 50,
    borderRadius: 1.5,
    backgroundColor: '#232327',
  },
  volumeDown: {
    position: 'absolute',
    left: -2,
    top: 212,
    width: 2.5,
    height: 50,
    borderRadius: 1.5,
    backgroundColor: '#232327',
  },
});
