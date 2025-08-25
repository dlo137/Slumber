
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-gesture-handler';

export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Defer navigation until after mount
    const timeout = setTimeout(() => {
      router.replace('/onboarding');
    }, 0);
    return () => clearTimeout(timeout);
  }, [router]);
  return null;
}

