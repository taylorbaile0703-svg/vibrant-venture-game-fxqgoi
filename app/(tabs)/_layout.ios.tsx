
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // iOS-specific simplified layout - no tabs, just stack navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
