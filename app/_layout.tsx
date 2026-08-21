import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { GlobalSheets } from '@/components/glass/GlobalSheets';
import { ToastHost } from '@/components/glass/GlowToast';
import { LevelUpOverlay } from '@/components/glass/LevelUpOverlay';
import { PhoneFrame } from '@/components/glass/PhoneFrame';
import { colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PhoneFrame>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quiz" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="scan" options={{ animation: 'fade' }} />
          <Stack.Screen name="admin" options={{ animation: 'fade' }} />
          <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Oops!' }} />
        </Stack>
        <ToastHost />
        <LevelUpOverlay />
        <GlobalSheets />
      </PhoneFrame>
    </SafeAreaProvider>
  );
}
