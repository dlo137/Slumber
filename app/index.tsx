
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-gesture-handler';

export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);
  return null;
}

