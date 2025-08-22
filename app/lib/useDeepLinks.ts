// app/lib/useDeepLinks.ts
// Custom scheme deep link handler for Expo Router
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function useDeepLinks() {
  const router = useRouter();

  useEffect(() => {
    // Foreground deep link handler
    const sub = Linking.addEventListener('url', ({ url }) => {
      const { path, queryParams } = Linking.parse(url);
      // e.g. slumber://reset?token=XYZ
      if (path?.startsWith('reset')) {
        router.push({ pathname: '/reset', params: { token: queryParams?.token as string } });
      }
    });

    // Cold start deep link handler
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      if (path?.startsWith('reset')) {
        router.replace({ pathname: '/reset', params: { token: queryParams?.token as string } });
      }
    });

    return () => sub.remove();
  }, [router]);
}
