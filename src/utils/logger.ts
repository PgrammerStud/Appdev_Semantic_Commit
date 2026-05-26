// src/utils/logger.ts
const isDev = __DEV__;

export const logger = {
  log:   (...args: any[]) => isDev && console.log('📋', ...args),
  warn:  (...args: any[]) => isDev && console.warn('⚠️', ...args),
  error: (...args: any[]) => {
    console.error('❌', ...args);
    // Sentry.captureException(args[0]); // always send to Sentry even in prod
  },
};