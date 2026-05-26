# Stripe Configuration Documentation

## Overview
This document outlines the Stripe payment integration setup for the React Native application. The implementation uses the Stripe React Native SDK and integrates with a backend API for payment processing.

**Status**: ⚠️ **PARTIAL SETUP** - Core structure in place, some configurations still needed

---

## Table of Contents
1. [Project Setup Status](#project-setup-status)
2. [Installed Dependencies](#installed-dependencies)
3. [Current Implementation](#current-implementation)
4. [Frontend Configuration](#frontend-configuration)
5. [Backend Requirements](#backend-requirements)
6. [Environment Variables](#environment-variables)
7. [Implementation Guide](#implementation-guide)
8. [Testing Instructions](#testing-instructions)
9. [Next Steps](#next-steps)

---

## Project Setup Status

### ✅ Completed
- [x] Stripe React Native SDK installed (`@stripe/stripe-react-native@0.65.1`)
- [x] Basic payment service created (`src/services/stripeService.ts`)
- [x] Payment intent creation function implemented
- [x] Authentication flow integrated with JWT tokens
- [x] Axios configured for API calls
- [x] React Native Config for environment variables

### ⚠️ Pending
- [ ] Stripe Publishable Key configuration in app
- [ ] Android native configuration (build.gradle)
- [ ] iOS native configuration (Podfile/CocoaPods)
- [ ] Payment UI components implementation
- [ ] Backend payment processing endpoint
- [ ] Error handling and payment status monitoring
- [ ] Test payment flow with real/test keys

---

## Installed Dependencies

### Current Package Versions
```json
{
  "@stripe/stripe-react-native": "^0.65.1",
  "react-native-config": "^1.6.1",
  "axios": "^1.16.0",
  "react-native": "0.83.1",
  "@react-native-firebase/app": "^24.0.0",
  "@react-native-firebase/auth": "^24.0.0"
}
```

### Required for Full Stripe Integration
- **stripe-react-native**: ✅ Already installed
- **react-native-config**: ✅ Already installed (for environment variables)
- **Backend SDK**: Depends on backend technology (Node.js, Python, etc.)

---

## Current Implementation

### 1. Payment Service File
**Location**: `src/services/stripeService.ts`

**Current Code**:
```typescript
import axios from 'axios';
import Config from 'react-native-config';

export const createPaymentIntent = async (
  amountInPesos: number,
  jwtToken: string
): Promise<string> => {
  const amountInCentavos = Math.round(amountInPesos * 100);

  const response = await axios.post(
    `${Config.BACKEND_URL}/api/payment/create-intent`,
    { amount: amountInCentavos },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );

  return response.data.clientSecret;
};
```

**Functionality**:
- Accepts amount in Philippine Pesos
- Converts to centavos (cents) for Stripe
- Calls backend endpoint to create payment intent
- Uses JWT token for authentication
- Returns client secret for frontend payment processing

---

## Frontend Configuration

### Step 1: Initialize Stripe
Add initialization in your app entry point (likely `App.tsx` or `index.js`):

```typescript
import { initStripe } from '@stripe/stripe-react-native';

export default function App() {
  useEffect(() => {
    initStripe({
      publishableKey: Config.STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant_identifier', // Required for Apple Pay
      urlScheme: 'your-app-scheme', // Required for redirects
    });
  }, []);

  // Rest of app...
}
```

### Step 2: Create Environment Variables
Create `.env` file in project root:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
STRIPE_SECRET_KEY=sk_test_your_test_secret_key (BACKEND ONLY)
BACKEND_URL=http://your-backend-api-url
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret (BACKEND ONLY)
```

### Step 3: Environment Configuration File
Update or create `react-native.config.js`:

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    'react-native-stripe-sdk': {
      platforms: {
        android: null,
      },
    },
  },
};
```

---

## Backend Requirements

### Payment Intent Endpoint
**Endpoint**: `POST /api/payment/create-intent`

**Request**:
```json
{
  "amount": 500,
  "currency": "php"
}
```

**Response**:
```json
{
  "clientSecret": "pi_test_xxxxx_secret_xxxxx"
}
```

### Backend Implementation (Example - Node.js/Express)
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/payment/create-intent', authenticateJWT, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'php',
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Additional Endpoints Needed
```
POST /api/payment/confirm-payment
GET  /api/payment/status/:intentId
POST /api/payment/webhook (Stripe webhook handler)
```

---

## Environment Variables

### Frontend (.env)
```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
BACKEND_URL=https://api.your-app.com

# Firebase (existing)
FIREBASE_API_KEY=xxxxx
FIREBASE_PROJECT_ID=appdev-c1178
```

### Backend (.env)
```env
# Stripe Keys (KEEP SECRET)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Webhook Configuration
STRIPE_WEBHOOK_ENDPOINT=https://your-backend.com/webhook/stripe

# App Configuration
BACKEND_URL=https://api.your-app.com
NODE_ENV=test or production
```

---

## Implementation Guide

### Phase 1: Setup (Current)
1. ✅ Install Stripe React Native SDK
2. ✅ Create payment service
3. ⏳ Configure environment variables
4. ⏳ Initialize Stripe in App component

### Phase 2: Frontend Payment UI (Pending)
Create payment component (`src/screens/PaymentScreen.tsx`):

```typescript
import React, { useState } from 'react';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmPayment } = useStripe();

  const handlePayment = async (amount: number) => {
    try {
      // 1. Create payment intent from backend
      const clientSecret = await createPaymentIntent(amount, jwtToken);

      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Your App Name',
      });

      if (initError) throw initError;

      // 3. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) throw paymentError;

      console.log('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    // UI implementation
  );
}
```

### Phase 3: Backend Payment Processing (Pending)
1. Implement payment intent creation
2. Handle payment confirmation
3. Set up webhook handlers
4. Implement payment status tracking
5. Add order/transaction recording

### Phase 4: Error Handling & Security (Pending)
1. Add try-catch for all payment operations
2. Implement payment status polling
3. Add fraud prevention
4. Implement PCI compliance measures
5. Add logging and monitoring

---

## Testing Instructions

### 1. Get Stripe Test Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle **Test mode** (bottom left)
3. Go to **API keys**
4. Copy **Publishable key** and **Secret key**
5. Add to `.env` files

### 2. Test Payment Cards
Use Stripe's test card numbers:

| Card Number | CVC | Expiry | Result |
|-----------|-----|--------|--------|
| 4242 4242 4242 4242 | Any | Any future | Success |
| 4000 0000 0000 9995 | Any | Any future | Decline |
| 5555 5555 5555 4444 | Any | Any future | Visa Debit |

### 3. Test Payment Flow
```
1. Navigate to payment screen
2. Enter amount (e.g., 100 PHP)
3. Tap "Pay Now"
4. Use test card from table above
5. Verify payment intent created in Stripe Dashboard
6. Check backend logs for webhook
```

---

## Next Steps

### Immediate (High Priority)
- [ ] Configure Stripe Publishable Key in `.env`
- [ ] Create `.env` file from template
- [ ] Initialize Stripe in `App.tsx`
- [ ] Implement payment UI component

### Short Term (Medium Priority)
- [ ] Implement backend payment intent endpoint
- [ ] Add error handling to payment service
- [ ] Create payment confirmation flow
- [ ] Add payment status tracking

### Medium Term (Lower Priority)
- [ ] Implement webhook handlers
- [ ] Add order/transaction recording
- [ ] Implement saved payment methods
- [ ] Add payment history/receipts
- [ ] Integrate with cart system

### Long Term (Future)
- [ ] Mobile wallet integration (Apple Pay, Google Pay)
- [ ] Installment payments
- [ ] Multi-currency support
- [ ] Advanced fraud detection
- [ ] Payment analytics dashboard

---

## File Structure Summary

```
Project Root
├── .env (⏳ TO CREATE)
├── App.tsx (⏳ UPDATE - Add Stripe init)
├── package.json (✅ CONFIGURED)
├── src/
│   ├── services/
│   │   ├── stripeService.ts (✅ EXISTS)
│   │   ├── authService.ts (✅ EXISTS)
│   │   └── productService.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── CartScreen.tsx (⏳ INTEGRATE STRIPE)
│   │   ├── ProfileScreen.tsx
│   │   └── PaymentScreen.tsx (⏳ TO CREATE)
│   └── components/
│       └── (⏳ Payment components needed)
└── android/ (⏳ Native config needed)
    └── app/
        └── build.gradle (⏳ UPDATE)
```

---

## Troubleshooting

### Common Issues

#### Issue: Stripe not initializing
**Solution**:
```typescript
// Make sure Config loads env variables
import Config from 'react-native-config';
console.log('STRIPE_KEY:', Config.STRIPE_PUBLISHABLE_KEY);
```

#### Issue: Payment intent creation fails
**Solution**:
1. Verify JWT token is valid
2. Check backend endpoint responds
3. Verify Stripe keys in backend `.env`
4. Check network requests in browser console

#### Issue: Android build fails
**Solution**:
- Update `android/app/build.gradle` targetSdkVersion to 33+
- Ensure gradle wrapper is updated
- Clear build cache: `cd android && ./gradlew clean`

---

## Resources

- [Stripe React Native Documentation](https://stripe.com/docs/stripe-js/react-native)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [React Native Config](https://github.com/lugg/react-native-config)
- [Philippine Peso Currency Info](https://stripe.com/docs/currencies/php)

---

## Configuration Checklist

- [ ] Stripe React Native SDK installed
- [ ] `.env` file created with keys
- [ ] Stripe initialized in App component
- [ ] Backend payment intent endpoint created
- [ ] Payment UI component implemented
- [ ] Error handling added
- [ ] Testing with test cards completed
- [ ] Webhook handlers implemented
- [ ] Order recording system ready
- [ ] Production keys configured
- [ ] Security audit completed

---

**Last Updated**: May 17, 2026
**Status**: ⚠️ Partial Configuration - Phase 1 Complete
