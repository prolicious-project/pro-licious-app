// App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Keep the native splash screen visible until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently ignore if it fails (e.g. already hidden)
});

// Maximum time (ms) to wait for fonts before proceeding with system fonts
const FONT_LOAD_TIMEOUT_MS = 4000;

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  // Fallback state: if fonts take too long, proceed anyway so the app loads
  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimeout(true);
    }, FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // App is ready once fonts load (or timeout/error occurs)
  const appIsReady = fontsLoaded || fontError !== null || fontTimeout;

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the native splash screen now that the app is ready
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Still loading — keep showing native splash screen (do NOT render anything)
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </View>
  );
}
