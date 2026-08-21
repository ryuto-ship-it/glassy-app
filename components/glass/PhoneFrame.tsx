import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, fonts, TAGLINE } from '@/constants/theme';

const FRAME_WIDTH = 430;
const FRAME_HEIGHT = 932;
const BEZEL = 14;
const MARGIN = 56;

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
  const scale = Math.min(1, (winW - MARGIN * 2) / outerW, (winH - MARGIN * 2) / outerH);
  const showWatermarks = winW - outerW * scale > 260;

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
        <View style={styles.notch} />
        <View style={styles.screen}>{children}</View>
        <View style={styles.buttonRight} />
        <View style={styles.buttonLeftUpper} />
        <View style={styles.buttonLeftLower} />
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
    marginTop: -20,
  },
  watermarkLeft: { left: 48 },
  watermarkRight: { right: 48, alignItems: 'flex-end' },
  watermarkTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.16)',
  },
  watermarkTitleRight: { textAlign: 'right' },
  watermarkTagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  watermarkTaglineRight: { textAlign: 'right' },
  bezel: {
    backgroundColor: '#050506',
    borderRadius: 54,
    padding: BEZEL,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
  },
  notch: {
    position: 'absolute',
    top: BEZEL + 10,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 26,
    borderRadius: 16,
    backgroundColor: '#050506',
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
  buttonRight: {
    position: 'absolute',
    right: -3,
    top: 160,
    width: 3,
    height: 90,
    borderRadius: 2,
    backgroundColor: '#1C1C20',
  },
  buttonLeftUpper: {
    position: 'absolute',
    left: -3,
    top: 130,
    width: 3,
    height: 50,
    borderRadius: 2,
    backgroundColor: '#1C1C20',
  },
  buttonLeftLower: {
    position: 'absolute',
    left: -3,
    top: 200,
    width: 3,
    height: 70,
    borderRadius: 2,
    backgroundColor: '#1C1C20',
  },
});
