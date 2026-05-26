# Firebase Google Authentication Setup Documentation

## Overview
This document outlines the complete setup of Firebase Google Authentication for the React Native app. The authentication flow integrates Firebase with a custom backend API to provide JWT token-based authentication.

---

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [NPM Packages Installation](#npm-packages-installation)
3. [Android Configuration](#android-configuration)
4. [Files Created/Modified](#files-createdmodified)
5. [Implementation Details](#implementation-details)
6. [How Authentication Flow Works](#how-authentication-flow-works)
7. [Testing the Setup](#testing-the-setup)

---

## Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a new project"** or select existing project
3. Enter project name: **appdev-c1178** (or your desired name)
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Register Android App
1. In Firebase Console, click **"Add app"** → **Android**
2. Fill in Android package name: **com.project**
3. Click **"Register app"**
4. Firebase will generate the `google-services.json` file

### Step 3: Download google-services.json
1. In Firebase Console, download the configuration file
2. Place it at: `android/app/google-services.json`
3. This file contains your Firebase credentials:
   - Project ID: `appdev-c1178`
   - API Key: `AIzaSyB_taahldjwHb85mTUcRBBNzQRc32lZ5lM`
   - OAuth Client IDs for Android

### Step 4: Enable Google Sign-In (Optional - Backend Handles This)
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** as a provider
3. Configure OAuth consent screen with necessary scopes

### Step 5: Get Web Client ID (For Frontend)
1. Go to **Project Settings** → **Service Accounts**
2. OR go to **Google Cloud Console** → **APIs & Services** → **Credentials**
3. Find/Create OAuth 2.0 Client ID for Web
4. Copy the Client ID and add to `.env` file

---

## NPM Packages Installation

### Step 1: Install Firebase Packages
```bash
npm install @react-native-firebase/app @react-native-firebase/auth firebase
npm install @react-native-google-signin/google-signin
npm install @react-native-community/react-native-config
npm install axios
```

### Package Details

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-native-firebase/app` | ^24.0.0 | Firebase core library |
| `@react-native-firebase/auth` | ^24.0.0 | Firebase Authentication (not heavily used - backend auth used instead) |
| `@react-native-google-signin/google-signin` | ^16.1.2 | Google Sign-In UI & token generation |
| `firebase` | ^12.12.1 | Firebase SDK for web (if needed) |
| `axios` | ^1.16.0 | HTTP client for API requests |
| `react-redux` | ^9.2.0 | Redux React bindings |
| `redux-saga` | ^1.4.2 | Side effects management |
| `react-native-config` | ^1.6.1 | Environment variable management |

### Step 2: Link Packages (if not auto-linked)
```bash
npx react-native link
# For react-native-config specifically:
npx react-native link react-native-config
```

---

## Android Configuration

### Step 1: Update android/build.gradle
Add Google Services plugin to `buildscript` dependencies:

```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.4.4'
    }
}
```

### Step 2: Update android/app/build.gradle
Add at the top of file (after other apply plugin statements):

```gradle
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.facebook.react'
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

This enables:
- Google Services plugin to process `google-services.json`
- Environment variable loading from `.env` file

### Step 3: Add google-services.json
1. Download `google-services.json` from Firebase Console
2. Place at: `android/app/google-services.json`
3. Verify it contains your Firebase project credentials

**Example Structure:**
```json
{
  "project_info": {
    "project_number": "981559524498",
    "project_id": "appdev-c1178"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:981559524498:android:645ddb76099dbcc44d7a4b",
        "android_client_info": {
          "package_name": "com.project"
        }
      },
      "oauth_client": [
        {
          "client_id": "981559524498-7rav2vj6s8t2mkhoumae1kh3edo0sdv6.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.project",
            "certificate_hash": "86e862c1c72620655800a1d1bc37e067c73c1deb"
          }
        }
      ]
    }
  ]
}
```

### Step 4: Environment Variables
Create `.env` file in project root:

```env
GOOGLE_WEB_CLIENT_ID=981559524498-e3otsf8p7jvpcile8jiqc2o9hgostbi0.apps.googleusercontent.com
BACKEND_URL=http://192.168.1.148:8000
```

Create `.env.example` as template:
```env
GOOGLE_WEB_CLIENT_ID=your-web-client-id-here
BACKEND_URL=http://192.168.1.148:8000
```

---

## Files Created/Modified

### 1. **src/services/authService.ts** ✅ CREATED
Purpose: Handle Firebase authentication and backend communication

**Key Functions:**
- `initializeGoogleSignIn()` - Configure Google Sign-In with web client ID
- `signInWithGoogle()` - Perform Google sign-in and get Firebase token
- `sendFirebaseTokenToBackend()` - Exchange Firebase token for JWT token
- `setJwtToken()` - Store JWT token for API requests
- `getApiClient()` - Get axios instance with JWT attached

**Key Code:**
```typescript
export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    // Initialize Google Sign-In
    await GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    });
    
    // Sign in with Google
    const response = await GoogleSignin.signIn();
    const firebaseToken = response.idToken;
    
    // Send Firebase token to backend for JWT
    const authResponse = await sendFirebaseTokenToBackend(firebaseToken);
    
    return {
      success: true,
      jwtToken: authResponse.token,
      user: authResponse.user,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### 2. **src/app/reducers/auth.ts** ✅ CREATED
Purpose: Redux reducer for authentication state management

**State Structure:**
```typescript
interface AuthState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isLoggedIn: boolean;
  jwtToken?: string;          // Stores JWT from backend
  user?: {
    id: string;
    email: string;
    name?: string;
    roles?: string[];
    photo?: string;
  };
}
```

**Actions:**
- `USER_LOGIN_REQUEST` - Initiated login attempt
- `USER_LOGIN_COMPLETED` - Login successful, store JWT & user data
- `USER_LOGIN_ERROR` - Login failed
- `GOOGLE_LOGIN_COMPLETED` - Google sign-in completed
- `GOOGLE_LOGIN_ERROR` - Google sign-in failed
- `USER_LOGOUT` - User logged out

### 3. **src/screens/auth/Login.tsx** ✅ CREATED/MODIFIED
Purpose: Login UI with email/password and Google Sign-In button

**Key Components:**
- Email/password input fields
- Custom styled login button
- Google Sign-In button integration
- Error handling and alerts
- Loading states during authentication

**Key Code:**
```typescript
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    
    if (result.success && result.user && result.jwtToken) {
      setJwtToken(result.jwtToken);
      dispatch(googleLoginCompleted({
        jwtToken: result.jwtToken,
        user: result.user,
      }));
      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.HOME }],
      });
    }
  } catch (error) {
    Alert.alert('Sign-In Failed', error.message);
  } finally {
    setGoogleLoading(false);
  }
};
```

### 4. **src/app/action.ts** ✅ MODIFIED
Purpose: Redux action type constants

**New Actions Added:**
```typescript
export const GOOGLE_LOGIN = 'GOOGLE_LOGIN';
export const GOOGLE_LOGIN_COMPLETED = 'GOOGLE_LOGIN_COMPLETED';
export const GOOGLE_LOGIN_ERROR = 'GOOGLE_LOGIN_ERROR';
```

### 5. **android/app/google-services.json** ✅ ADDED
Purpose: Firebase configuration for Android

Downloaded from Firebase Console. Contains:
- Project ID and number
- Android app configuration
- OAuth client credentials
- API keys
- Firebase services configuration

### 6. **android/build.gradle** ✅ MODIFIED
Added Google Services plugin dependency:
```gradle
classpath 'com.google.gms:google-services:4.4.4'
```

### 7. **android/app/build.gradle** ✅ MODIFIED
Applied Google Services plugin:
```gradle
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.facebook.react'
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

### 8. **.env** ✅ CREATED (NOT IN REPO)
Environment variables file (git-ignored):
```env
GOOGLE_WEB_CLIENT_ID=981559524498-e3otsf8p7jvpcile8jiqc2o9hgostbi0.apps.googleusercontent.com
BACKEND_URL=http://192.168.1.148:8000
```

### 9. **.env.example** ✅ CREATED
Template for environment variables (in repo):
```env
GOOGLE_WEB_CLIENT_ID=your-web-client-id-here
BACKEND_URL=http://192.168.1.148:8000
```

### 10. **package.json** ✅ MODIFIED
Added Firebase and authentication dependencies (see NPM Packages section)

---

## Implementation Details

### Authentication Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Native App (Frontend)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User clicks "Sign in with Google"                       │
│       ↓                                                      │
│  2. GoogleSignin.signIn() opens Google OAuth dialog         │
│       ↓                                                      │
│  3. User authenticates with Google                          │
│       ↓                                                      │
│  4. Receive Firebase ID Token (idToken)                     │
│       ↓                                                      │
│  5. Send Firebase ID Token to Backend                       │
│       ↓                                                      │
│  6. Backend verifies token with Firebase                    │
│       ↓                                                      │
│  7. Backend returns JWT Token                               │
│       ↓                                                      │
│  8. Store JWT in Redux & local storage                      │
│       ↓                                                      │
│  9. Attach JWT to all future API requests                   │
│       ↓                                                      │
│  10. Navigate to Home screen                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Integration Points

#### 1. GoogleSignin Configuration
Located in `src/services/authService.ts`:
```typescript
await GoogleSignin.configure({
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,  // From .env
  offlineAccess: true,
  scopes: ['profile', 'email'],
});
```

#### 2. Token Management
- **Firebase Token**: Received from Google, sent to backend
- **JWT Token**: Received from backend, stored in Redux & localStorage
- **Axios Interceptor**: Automatically attaches JWT to all API requests

#### 3. Redux Integration
```typescript
// In Login.tsx
const result = await signInWithGoogle();
dispatch(googleLoginCompleted({
  jwtToken: result.jwtToken,
  user: result.user,
}));

// In HomeScreen.tsx
const { user, jwtToken } = useSelector((state: any) => state.auth);
```

#### 4. API Client Initialization
```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,  // From Config
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (currentJwtToken) {
    config.headers.Authorization = `Bearer ${currentJwtToken}`;
  }
  return config;
});
```

---

## How Authentication Flow Works

### Scenario 1: User Signs in with Google

1. **User initiates sign-in:**
   - Clicks "Sign in with Google" button on Login screen

2. **GoogleSignin handles OAuth:**
   - Opens Google authentication dialog
   - User enters credentials
   - Google returns ID Token

3. **Token exchange with backend:**
   ```typescript
   // src/services/authService.ts
   const firebaseResponse = await GoogleSignin.signIn();
   const idToken = firebaseResponse.idToken;
   
   // Send to backend
   const response = await apiClient.post('/auth/verify-google-token', {
     token: idToken,
   });
   ```

4. **Backend verification:**
   - Backend receives ID Token
   - Verifies token with Firebase Admin SDK
   - Creates/updates user in database
   - Generates JWT Token
   - Returns JWT + user data

5. **Frontend stores authentication:**
   ```typescript
   // Store JWT for API requests
   setJwtToken(result.jwtToken);
   
   // Update Redux state
   dispatch(googleLoginCompleted({
     jwtToken: result.jwtToken,
     user: result.user,
   }));
   ```

6. **Navigate to home:**
   - Redux state updates trigger component re-render
   - useEffect detects `isLoggedIn` changed
   - Navigate to HOME screen

### Scenario 2: User Makes API Request

1. **API call with JWT:**
   ```typescript
   // src/services/productService.ts
   const response = await apiClient.get('/products');
   // JWT automatically attached by interceptor
   ```

2. **Interceptor adds JWT header:**
   ```typescript
   config.headers.Authorization = `Bearer ${currentJwtToken}`;
   ```

3. **Backend receives request:**
   - Validates JWT signature
   - Extracts user info from JWT claims
   - Returns authorized data

### Scenario 3: User Logs Out

1. **Logout triggered:**
   ```typescript
   const handleLogout = () => {
    dispatch(userLogout());
    dispatch(clearCart());
    GoogleSignin.signOut();
   };
   ```

2. **Clear state:**
   - Redux auth state reset
   - JWT token cleared
   - localStorage cleared

3. **Navigate to login:**
   - Next API request will fail due to missing JWT
   - App redirects to login screen

---

## Testing the Setup

### Prerequisites
- Android device or emulator running
- `.env` file with correct Google Web Client ID
- Backend server running at `BACKEND_URL`
- Firebase project configured

### Manual Testing Steps

#### Step 1: Test App Startup
```bash
npx react-native run-android
```
✅ App should start without errors
✅ Navigate to Login screen

#### Step 2: Test Google Sign-In Button
```
1. Click "Sign in with Google" button
2. Google authentication dialog should appear
3. Enter valid Google credentials
4. Should see loading indicator
```

#### Step 3: Verify Token Exchange
```
1. Check Android logcat for debug logs:
   adb logcat | grep "JWT\|Firebase\|GoogleSign"
```

Expected console output:
```
✓ GoogleSignin configured
✓ Google Sign-In successful: user@gmail.com
✓ Firebase token received
📤 Sending Firebase token to backend...
✓ JWT token updated
✓ Login successful
```

#### Step 4: Verify JWT Storage
```typescript
// In Chrome DevTools Console (if using React Native Debugger)
const state = store.getState();
console.log(state.auth.jwtToken);  // Should show JWT
console.log(state.auth.user);      // Should show user object
```

#### Step 5: Test API Requests
```
1. Login successfully
2. Navigate to Home screen
3. Should see product list loading
4. Check network requests in DevTools
```

Expected request header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Step 6: Test Logout
```
1. Click profile icon
2. Click "Logout"
3. Should return to Login screen
4. Try accessing protected screens
5. Should redirect to login
```

### Debugging Common Issues

| Issue | Solution |
|-------|----------|
| `GOOGLE_WEB_CLIENT_ID undefined` | Add to `.env` file, restart bundler |
| `google-services.json not found` | Ensure file at `android/app/google-services.json` |
| `Wrong package name in google-services.json` | Package name must match `android/app/build.gradle` namespace |
| `GoogleSignin.signIn() hangs` | Check internet connection, verify web client ID |
| `Backend returns 401 Unauthorized` | Verify JWT token in Authorization header, check backend token validation |
| `Cannot verify firebase token` | Ensure Firebase Admin SDK configured on backend |

---

## File Structure Summary

```
Project/
├── android/
│   ├── app/
│   │   ├── build.gradle                    ✅ MODIFIED - Google Services plugin
│   │   └── google-services.json            ✅ ADDED - Firebase config
│   └── build.gradle                        ✅ MODIFIED - Google Services dependency
├── src/
│   ├── services/
│   │   ├── authService.ts                  ✅ CREATED - Auth logic
│   │   └── productService.ts               ✅ MODIFIED - JWT attachment
│   ├── screens/
│   │   ├── auth/
│   │   │   └── Login.tsx                   ✅ CREATED - Google Sign-In UI
│   │   └── HomeScreen.tsx                  ✅ MODIFIED - Protected screen
│   └── app/
│       ├── action.ts                       ✅ MODIFIED - Auth actions
│       ├── reducers/
│       │   └── auth.ts                     ✅ CREATED - Auth reducer
│       └── store.ts                        ✅ MODIFIED - Redux store
├── .env                                    ✅ CREATED (git-ignored)
├── .env.example                            ✅ CREATED - Environment template
├── package.json                            ✅ MODIFIED - Dependencies
└── FIREBASE_GOOGLE_AUTH_SETUP.md          ✅ THIS FILE
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Keep google-services.json secure** - Can be reconstructed from Firebase Console
3. **API Key restrictions** - Enable in Firebase Console for Android
4. **JWT Token security** - Implement token refresh mechanism on backend
5. **SSL/HTTPS** - Use HTTPS for backend in production
6. **Token expiration** - Implement token refresh logic when JWT expires

---

## Next Steps

1. **Token Refresh**: Implement automatic JWT refresh when token expires
2. **Biometric Authentication**: Add fingerprint/face recognition
3. **Account Linking**: Link multiple authentication methods
4. **Session Management**: Implement logout on app background
5. **Error Handling**: Add comprehensive error recovery
6. **Analytics**: Track authentication events with Firebase Analytics

---

## References

- [Firebase Console](https://console.firebase.google.com/)
- [Google Sign-In for React Native](https://react-native-google-signin.github.io/docs/getting-started)
- [React Native Firebase Auth](https://rnfirebase.io/auth/usage)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Android Signing Configuration](https://developer.android.com/studio/publish/app-signing)

---

**Last Updated:** May 14, 2026
**Setup Status:** ✅ Complete and Tested
