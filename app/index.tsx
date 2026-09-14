import React from 'react';
import { useRouter } from 'expo-router';
import { SplashVideoScreen } from '@/components/common/SplashVideoScreen';

export default function Index() {
  const router = useRouter();

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  return <SplashVideoScreen onFinish={handleFinish} />;
}
