
// Global JS error handler for diagnostics
// @ts-ignore
global.ErrorUtils?.setGlobalHandler?.((e, isFatal) => {
  console.log('FATAL JS ERROR:', e?.message, e?.stack);
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
// import { useFonts } from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AudioPlayerProvider } from '../components/AudioPlayerContext';
import { useColorScheme } from '../hooks/useColorScheme';
const safeMode = Boolean(Constants.expoConfig?.extra?.safeMode);

export default function RootLayout() {
  if (safeMode) {
    // Safe Mode: render nothing, skip all app code
    return <></>;
  }
  const router = useRouter();
  const colorScheme = useColorScheme();
  // Font loading removed to prevent crash

  // Restore Supabase session on every app launch
  React.useEffect(() => {
    async function restoreSession() {
      try {
        const supabase = require('../lib/supabase').default;
        const sessionStr = await AsyncStorage.getItem('supabase.session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      } catch (err) {
        // Ignore errors, fallback to default Supabase session management
      }
    }
    restoreSession();
  }, []);

  // Font loading removed to prevent crash
  return (
    <AudioPlayerProvider>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        merchantIdentifier="merchant.com.slumber.slumber"
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          <Slot />
        </ThemeProvider>
      </StripeProvider>
    </AudioPlayerProvider>
  );
}
