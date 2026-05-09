import { Provider } from 'react-redux';
import AppNavigator from './src/navigations/index';
import { store } from './src/app/store';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StatusBar, View, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialized, setInitialized] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        console.log('⚙️ App.tsx: Configuring GoogleSignin...');
        await GoogleSignin.configure({
         webClientId: Config.GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
           forceCodeForRefreshToken: true,
        });
        console.log('✓ App.tsx: GoogleSignin configured successfully');
        setInitialized(true);
      } catch (error: any) {
        const errMsg = error?.message || 'Unknown error';
        console.error('✗ App.tsx: GoogleSignin configuration failed:', errMsg);
        setConfigError(errMsg);
        setInitialized(true);
      }
    };

    configureGoogleSignIn();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {initialized ? (
            <>
              {configError && (
                <View style={{ backgroundColor: '#ffebee', padding: 10 }}>
                  <Text style={{ color: '#c62828', fontSize: 12 }}>
                    GoogleSignin config warning: {configError}
                  </Text>
                </View>
              )}
              <AppNavigator />
            </>
          ) : null}
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;