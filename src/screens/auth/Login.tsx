import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';
import { userLogin, resetLogin } from '../../app/reducers/auth';

// ─── Brand Palette ───────────────────────────────────────────────
const AMBER        = '#dd8928';
const AMBER_DARK   = '#b56c18';
const AMBER_GLOW   = 'rgba(221,137,40,0.18)';
const AMBER_BORDER = 'rgba(221,137,40,0.35)';
const BROWN        = '#3b2416';
const BROWN_SOFT   = '#5c3820';
const BROWN_MUTED  = '#7a5038';
const CREAM        = '#fdf4e3';
const CREAM_MID    = '#f5e0b8';
const CREAM_DARK   = '#e8c98a';
const PARCHMENT    = '#fffbf2';
const WHITE        = '#ffffff';

// ─── Fonts ────────────────────────────────────────────────────────
// Titles/headings: Pacifico-Regular, OpenSansCondensed-Regular
// Body:            OpenSans-Regular / OpenSans-SemiBold

const Login: React.FC = () => {
  const [username, setUsername]     = useState('');
  // const [emailAdd, setEmailAdd]     = useState('');
  const [password, setPassword]     = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  // const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading = false, isError = false, errorMessage = null, isLoggedIn = false } = useSelector((state: any) => state.auth || {});

  useEffect(() => {
    if (isLoggedIn) {
      Alert.alert('Success', 'Login successful!');
      dispatch(resetLogin());
      (navigation.reset as any)({
        index: 0,
        routes: [{ name: ROUTES.HOME }],
      });
    }
  }, [isLoggedIn, dispatch, navigation]);

  useEffect(() => {
    if (isError && errorMessage) {
      Alert.alert('Login Failed', errorMessage);
    }
  }, [isError, errorMessage]);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Oops!', 'Please enter your username and password.');
      return;
    }
    dispatch(userLogin({ username, password }));
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Decorative Background ── */}
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />
        <View style={s.bgCircle3} />

        {/* ── Texture dots pattern ── */}
        <View style={s.dotsLayer} pointerEvents="none">
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={[s.dot, {
              top: (i % 6) * 52 + 18,
              left: Math.floor(i / 6) * 78 + 14,
              opacity: 0.06 + (i % 3) * 0.03,
            }]} />
          ))}
        </View>

        {/* ── Hero Badge ── */}
        <View style={s.heroBadge}>
          <View style={s.badgeGlow} />
          <View style={s.badgeInner}>
            <Text style={s.badgeEmoji}>🥐</Text>
          </View>
        </View>

        {/* ── Brand ── */}
        <View style={s.brandWrap}>
          <Text style={s.brandName}>Catalbas</Text>
          <View style={s.brandSubRow}>
            <View style={s.brandLine} />
            <Text style={s.brandSub}>BAKERY</Text>
            <View style={s.brandLine} />
          </View>
          <Text style={s.tagline}>Baked daily · Delivered with love</Text>
        </View>

        {/* ── Card ── */}
        <View style={s.card}>

          {/* Card top accent bar */}
          <View style={s.cardAccentBar} />

          {/* Heading */}
          <Text style={s.heading}>
            Welcome <Text style={s.headingAccent}>Back</Text>
          </Text>
          <Text style={s.subheading}>Sign in to place your order</Text>

          {/* ── Inputs ── */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Username</Text>
            <View style={[s.inputShell, usernameFocused && s.inputShellFocused]}>
              <Text style={s.inputIcon}>👤</Text>
              <CustomTextInput
                placeholder="your username"
                value={username}
                onChangeText={setUsername}
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
              />
            </View>
          </View>

          {/* <View style={s.fieldWrap}>
            <Text style={s.label}>Email Address</Text>
            <View style={[s.inputShell, emailFocused && s.inputShellFocused]}>
              <Text style={s.inputIcon}>✉</Text>
              <CustomTextInput
                placeholder="you@example.com"
                value={emailAdd}
                onChangeText={setEmailAdd}
                keyboardType="email-address"
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View> */}

          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={[s.inputShell, passFocused && s.inputShellFocused]}>
              <Text style={s.inputIcon}>🔒</Text>
              <CustomTextInput
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
            </View>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotWrap}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* ── Login CTA ── */}
          <TouchableOpacity
            style={[s.loginBtn, isLoading && s.loginBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : (
              <>
                <View style={s.loginBtnSheen} />
                <Text style={s.loginBtnText}>Sign In</Text>
                <Text style={s.loginBtnArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>or continue with</Text>
            <View style={s.orLine} />
          </View>

          {/* ── Social ── */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <Text style={s.socialBtnIcon}>G</Text>
              <Text style={s.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.socialBtn, s.socialBtnFB]}>
              <Text style={[s.socialBtnIcon, { color: '#1877F2' }]}>f</Text>
              <Text style={[s.socialBtnText, { color: '#1877F2' }]}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={s.footerRow}>
            <Text style={s.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              style={{ marginLeft: 6 }}
              onPress={() => navigation.navigate(ROUTES.REGISTER as never)}
            >
              <Text style={s.footerLink}>Register →</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Floating crumbs */}
        <Text style={[s.crumb, { top: 110, left: 28, fontSize: 18, opacity: 0.25 }]}>✦</Text>
        <Text style={[s.crumb, { top: 220, right: 22, fontSize: 12, opacity: 0.18 }]}>✦</Text>
        <Text style={[s.crumb, { bottom: 140, left: 40, fontSize: 14, opacity: 0.20 }]}>✦</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 22,
  },

  // Background
  bgCircle1: {
    position: 'absolute',
    top: -120, left: -80,
    width: 320, height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(221,137,40,0.12)',
  },
  bgCircle2: {
    position: 'absolute',
    top: 200, right: -100,
    width: 240, height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(59,36,22,0.06)',
  },
  bgCircle3: {
    position: 'absolute',
    bottom: 80, left: -60,
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(221,137,40,0.08)',
  },

  dotsLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dot: {
    position: 'absolute',
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: BROWN,
  },

  crumb: { position: 'absolute', color: AMBER },

  // Hero badge
  heroBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  badgeGlow: {
    position: 'absolute',
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: AMBER_GLOW,
  },
  badgeInner: {
    width: 68, height: 68,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 2.5,
    borderColor: CREAM_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AMBER_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  badgeEmoji: { fontSize: 30 },

  // Brand
  brandWrap: { alignItems: 'center', marginBottom: 24 },
  brandName: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 36,
    color: BROWN,
    letterSpacing: 0.5,
  },
  brandSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  brandLine: {
    width: 28, height: 1.5,
    backgroundColor: AMBER,
    borderRadius: 1,
  },
  brandSub: {
    fontFamily: 'OpenSansCondensed-Regular',
    fontSize: 13,
    color: AMBER,
    letterSpacing: 5,
    fontWeight: '700',
  },
  tagline: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 11.5,
    color: BROWN_MUTED,
    marginTop: 8,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: PARCHMENT,
    borderRadius: 28,
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderWidth: 1.5,
    borderColor: AMBER_BORDER,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 5,
    marginHorizontal: -24,
    marginBottom: 24,
    backgroundColor: AMBER,
    // Striped shimmer illusion
  },

  heading: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 26,
    color: BROWN,
    marginBottom: 4,
  },
  headingAccent: { color: AMBER },
  subheading: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 13,
    color: BROWN_MUTED,
    marginBottom: 22,
  },

  // Fields
  fieldWrap: { marginBottom: 14 },
  label: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 10.5,
    color: BROWN_SOFT,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CREAM_DARK,
    paddingHorizontal: 14,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputShellFocused: {
    borderColor: AMBER,
    shadowColor: AMBER,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  inputIcon: {
    fontSize: 14,
    marginRight: 10,
    opacity: 0.5,
  },
  inputInner: {
    flex:1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 48,
  },
  inputText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    color: BROWN,
    paddingVertical: 12,
  },

  // Forgot
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 12,
    color: AMBER_DARK,
  },

  // Login button
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AMBER,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderBottomWidth: 4,
    borderBottomColor: AMBER_DARK,
    shadowColor: AMBER_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnSheen: {
    position: 'absolute',
    top: 0, left: 0, right: '50%', bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  loginBtnText: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 17,
    color: WHITE,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loginBtnArrow: {
    fontSize: 18,
    color: WHITE,
    marginLeft: 8,
    opacity: 0.85,
  },

  // OR
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  orLine: {
    flex: 1, height: 1,
    backgroundColor: CREAM_DARK,
  },
  orText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 11,
    color: BROWN_MUTED,
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: CREAM_DARK,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  socialBtnFB: {},
  socialBtnIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: BROWN,
  },
  socialBtnText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: BROWN,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 13,
    color: BROWN_MUTED,
  },
  footerLink: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: AMBER_DARK,
  },
});

export default Login;
