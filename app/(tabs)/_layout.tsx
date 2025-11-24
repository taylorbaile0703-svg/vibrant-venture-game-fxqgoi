
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // Simplified layout - no tabs, just stack navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
