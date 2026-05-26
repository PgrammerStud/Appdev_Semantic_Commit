import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { setAuthToken } from './productService';
// Types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  photo?: string; // ✅ add this
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SignInResult {
  success: boolean;
  jwtToken?: string;
  user?: AuthUser;
  error?: string;
}

// Constants
const API_BASE_URL = 'https://webbakery-production.up.railway.app';

// Track if GoogleSignin has been configured

// Store the current JWT token for API requests
let currentJwtToken: string | null = null;

// Axios instance with JWT attachment
let apiClient: AxiosInstance | null = null;

/**
 * Set the JWT token for API requests
 * Called from Redux reducer after successful sign-in
 */
export const setJwtToken = (token: string | null): void => {
  currentJwtToken = token;
   setAuthToken(token ?? ''); // ← add only this line
  console.log(currentJwtToken ? '✓ JWT token updated' : '✓ JWT token cleared');
  // Reset apiClient so it picks up the new token on next request
  apiClient = null;
};

/**
 * Initialize axios instance with JWT token
 */
const initializeApiClient = (): AxiosInstance => {
  if (apiClient) {
    return apiClient;
  }

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });
  

  // Add request interceptor to attach JWT token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
        if (currentJwtToken && config.headers) {
          config.headers.Authorization = `Bearer ${currentJwtToken}`;
          console.log('📤 JWT token attached to request');
        }
      } catch (error) {
        console.error('❌ Error attaching JWT token:', error);
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  return apiClient;
};

/**
 * Get axios API client instance
 */
export const getApiClient = (): AxiosInstance => {
  return initializeApiClient();
};

/**
 * Send Firebase token to backend and get JWT
 */
const sendFirebaseTokenToBackend = async (
  firebaseToken: string
): Promise<AuthResponse> => {
  try {
    console.log('📤 Sending Firebase token to backend...');

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/google`,
      {
        firebase_token: firebaseToken,
      }
    );

    console.log('✓ Backend response received');

    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Backend request error:',
      error?.response?.data || error?.message
    );
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    console.log('🔄 Starting Google Sign-In flow...');
       // ✅ Add this — safe to call multiple times
    await GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
       forceCodeForRefreshToken: true,
    });
     try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (e) {
      // ignore if not signed in
    }
    // Verify Google Play Services is available
    console.log('⚙️ Checking Google Play Services...');
    await GoogleSignin.hasPlayServices();
    console.log('✓ Google Play Services available');

    // Open Google Sign-In dialog
    console.log('⚙️ Opening Google Sign-In dialog...');
    const userInfo = await GoogleSignin.signIn();

    // Get ID Token from Google
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token found from Google Sign-In');
    }

    console.log('✓ Got Google ID Token');

    // Create Firebase credential from Google token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    console.log('⚙️ Signing in to Firebase...');
    const userCredential = await auth().signInWithCredential(googleCredential);

    const user = userCredential.user;
    console.log('🔑 GOOGLE ID TOKEN:', idToken);

    console.log('✓ Firebase login success:', user.email);

    // Get Firebase ID Token for backend
    const firebaseToken = await user.getIdToken();
    console.log('✓ Got Firebase ID token');

    // Send Firebase token to backend and get JWT
    console.log('📤 Exchanging Firebase token for backend JWT...');
    const backendResponse = await sendFirebaseTokenToBackend(firebaseToken);

    const jwtToken = backendResponse.token;
    const backendUser = backendResponse.user;

    // setAuthToken(jwtToken); // ← add this line here
    console.log('✓ Sign-in completed successfully');

    // Return data - Redux reducer will handle storing it
    return {
      success: true,
      jwtToken,
      user: backendUser,
    };
  } catch (error: any) {
    console.error('✗ Google Sign-In error:', error?.message || error);

    return {
      success: false,
      error: error?.message || 'Google Sign-In failed',
    };
  }
};

/**
 * Sign out from Firebase + Google
 * Redux reducer will handle clearing auth data from state
 */
export const signOutUser = async (jwtToken?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Starting sign out...');

    // ✅ Use passed token OR fall back to currentJwtToken
    const tokenToUse = jwtToken || currentJwtToken;

    if (tokenToUse) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${tokenToUse}` } }
        );
        console.log('✓ Backend logout logged');
      } catch (e: any) {
        console.warn('⚠️ Backend logout failed:', e?.response?.status, e?.response?.data);
      }
    }

    await auth().signOut();
    await GoogleSignin.signOut();
    setJwtToken(null);

    console.log('✓ User signed out completely');
    return { success: true };

  } catch (error: any) {
    console.error('✗ Sign out error:', error);
    return { success: false, error: error.message || 'Sign out failed' };
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

export default {
  signInWithGoogle,
  signOutUser,
  getCurrentUser,
  getApiClient,
  setJwtToken,
};