import { Provider } from 'react-redux';
import AppNavigator from './src/navigations/index';
import { store } from './src/app/store';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StatusBar, View, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { initStripe } from '@stripe/stripe-react-native';
import ErrorBoundary from './src/components/ErrorBoundary';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import {
  requestNotificationPermission,
  getFCMToken,
  setBackgroundMessageHandler,
  showForegroundAlert,
} from './src/utils/pushNotifications';
import { saveFCMToken } from './src/services/notificationService';

// Must be outside component — handles notifications when app is killed
setBackgroundMessageHandler();

function AppContent() {
  const { jwtToken: token } = useSelector((state: any) => state.auth);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // ── Foreground notifications ─────────────────────────────────
  useEffect(() => {
    const unsubscribe = messaging().onMessage(remoteMessage => {
      showForegroundAlert(remoteMessage);
    });
    return unsubscribe;
  }, []);

  // ── Notification tap: app was in background ──────────────────
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const screen = remoteMessage.data?.screen as string | undefined;
      if (screen && navigationRef.current?.isReady()) {
        navigationRef.current.navigate(screen as never);
      }
    });
    return unsubscribe;
  }, []);

  // ── Notification tap: app was killed/quit ────────────────────
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data?.screen && navigationRef.current?.isReady()) {
          navigationRef.current.navigate(remoteMessage.data.screen as never);
        }
      });
  }, []);

  // ── Save FCM token once user is logged in ────────────────────
  useEffect(() => {
    if (!token) return;

    let cleanup: (() => void) | undefined;

    const setupFCMToken = async () => {
      const permitted = await requestNotificationPermission();
      if (!permitted) return;

      const fcmToken = await getFCMToken();
      if (fcmToken) {
        await saveFCMToken(fcmToken, token);
      }

      // Keep token fresh if Firebase rotates it
      cleanup = messaging().onTokenRefresh(async newToken => {
        await saveFCMToken(newToken, token);
      });
    };

    setupFCMToken();

    return () => {
      cleanup?.();
    };
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialized, setInitialized] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await GoogleSignin.configure({
          webClientId: Config.GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });

        await initStripe({
          publishableKey: Config.STRIPE_PUBLISHABLE_KEY ?? '',
          merchantIdentifier: 'merchant.com.yourapp',
        });
      } catch (error: any) {
        setConfigError(error?.message || 'Unknown error');
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!initialized) return null;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {configError ? (
            <View style={{ backgroundColor: '#ffebee', padding: 10 }}>
              <Text style={{ color: '#c62828', fontSize: 12 }}>
                GoogleSignin config warning: {configError}
              </Text>
            </View>
          ) : null}
          <AppContent />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;