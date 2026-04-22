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
// import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';
import { userRegister, resetRegister } from '../../app/reducers/auth';

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

// Password strength config
const getStrength = (pass: string) => {
  if (!pass)       return { level: 0, label: '',          color: 'transparent' };
  if (pass.length < 5)  return { level: 1, label: 'Weak',      color: '#e25c4b' };
  if (pass.length < 9)  return { level: 2, label: 'Fair',      color: '#e8a030' };
  if (pass.length < 12) return { level: 3, label: 'Good',      color: AMBER };
  return                       { level: 4, label: 'Excellent',  color: '#5aaa72' };
};

const Register: React.FC = () => {
  const [firstName, setFirstName]             = useState('');
  const [lastName, setLastName]               = useState('');
  const [username, setUsername]               = useState('');
  const [emailAdd, setEmailAdd]               = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms]     = useState(false);

  const [focused, setFocused] = useState<string | null>(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const strength   = getStrength(password);
  const { isLoading = false, isError = false, errorMessage = null, isRegistered = false } = useSelector((state: any) => state.auth || {});

  useEffect(() => {
    if (isRegistered) {
      Alert.alert('Success', 'Registration successful!.Verify your email to log in.');
      dispatch(resetRegister());
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN as never }],
      });
    }
  }, [isRegistered, dispatch, navigation]);

  useEffect(() => {
    if (isError && errorMessage) {
      Alert.alert('Registration Failed', errorMessage);
    }
  }, [isError, errorMessage]);

  const handleRegister = () => {
    if (!firstName ||!lastName || !username || !emailAdd || !password || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms and Privacy Policy.');
      return;
    }
    
    // Dispatch register action
    dispatch(userRegister({
      lastname: lastName,
      firstname: firstName,
      username,
      email: emailAdd,
      password,
    }));
  };

  const shell = (name: string) => [s.inputShell, focused === name && s.inputShellFocused];

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

        {/* ── Background ── */}
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />
        <View style={s.bgCircle3} />

        {/* Dot pattern */}
        <View style={s.dotsLayer} pointerEvents="none">
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={[s.dot, {
              top: (i % 6) * 64 + 18,
              left: Math.floor(i / 6) * 78 + 14,
              opacity: 0.05 + (i % 3) * 0.025,
            }]} />
          ))}
        </View>

        {/* ── Back button ── */}
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.navigate(ROUTES.LOGIN as never)}
        >
          <Text style={s.backBtnText}>← Back to Login</Text>
        </TouchableOpacity>

        {/* ── Brand strip ── */}
        <View style={s.brandWrap}>
          <View style={s.heroBadge}>
            <View style={s.badgeGlow} />
            <View style={s.badgeInner}>
              <Text style={s.badgeEmoji}>🍞</Text>
            </View>
          </View>
          <Text style={s.brandName}>Catalbas</Text>
          <View style={s.brandSubRow}>
            <View style={s.brandLine} />
            <Text style={s.brandSub}>BAKERY</Text>
            <View style={s.brandLine} />
          </View>
        </View>

        {/* ── Card ── */}
        <View style={s.card}>

          {/* Progress steps */}
          <View style={s.stepsRow}>
            <View style={[s.stepSegment, s.stepDone]}>
              <Text style={s.stepDoneIcon}>✓</Text>
            </View>
            <View style={s.stepConnector} />
            <View style={[s.stepSegment, s.stepActive]}>
              <Text style={s.stepActiveNum}>2</Text>
            </View>
            <View style={s.stepConnector} />
            <View style={s.stepSegment}>
              <Text style={s.stepNum}>3</Text>
            </View>
          </View>
          <Text style={s.stepHint}>Account details</Text>

          {/* Heading */}
          <Text style={s.heading}>
            Join <Text style={s.headingAccent}>Us!</Text>
          </Text>
          <Text style={s.subheading}>Fill in your details to get started</Text>

          {/* ── Name row ── */}
          <View style={s.nameRow}>
            <View style={[s.fieldWrap, { flex: 1 }]}>
              <Text style={s.label}>First Name</Text>
              <View style={shell('fname')}>
                <CustomTextInput
                  placeholder="Juan"
                  value={firstName}
                  onChangeText={setFirstName}
                  containerStyle={s.inputInner}
                  textStyle={s.inputText}
                  onFocus={() => setFocused('fname')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            <View style={{ width: 10 }} />
            <View style={[s.fieldWrap, { flex: 1 }]}>
              <Text style={s.label}>Last Name</Text>
              <View style={shell('lname')}>
                <CustomTextInput
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChangeText={setLastName}
                  containerStyle={s.inputInner}
                  textStyle={s.inputText}
                  onFocus={() => setFocused('lname')}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>
          </View>

        <View style={s.fieldWrap}>
            <Text style={s.label}>Username</Text>
            <View style={shell('username')}>
              <Text style={s.inputIcon}>👤</Text>
              <CustomTextInput
                placeholder="juandelacruz"
                value={username}
                onChangeText={setUsername}
                // keyboardType="username"
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>
        
          {/* Email */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Email Address</Text>
            <View style={shell('email')}>
              <Text style={s.inputIcon}>✉</Text>
              <CustomTextInput
                placeholder="you@example.com"
                value={emailAdd}
                onChangeText={setEmailAdd}
                keyboardType="email-address"
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={shell('pass')}>
              <Text style={s.inputIcon}>🔒</Text>
              <CustomTextInput
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
              />
            </View>
            {/* Strength bar */}
            {password.length > 0 && (
              <View style={s.strengthWrap}>
                <View style={s.strengthBar}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        s.strengthSeg,
                        i <= strength.level && { backgroundColor: strength.color, opacity: 1 },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[s.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Confirm Password</Text>
            <View style={shell('cpass')}>
              <Text style={s.inputIcon}>🔒</Text>
              <CustomTextInput
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                containerStyle={s.inputInner}
                textStyle={s.inputText}
                onFocus={() => setFocused('cpass')}
                onBlur={() => setFocused(null)}
              />
            </View>
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <Text style={[
                s.matchHint,
                { color: confirmPassword === password ? '#5aaa72' : '#e25c4b' }
              ]}>
                {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}
          </View>

          {/* ── Terms ── */}
          <TouchableOpacity
            style={s.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.75}
          >
            <View style={[s.checkbox, agreedToTerms && s.checkboxChecked]}>
              {agreedToTerms && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.termsText}>
              I agree to the{' '}
              <Text style={s.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={s.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* ── Register CTA ── */}
          <TouchableOpacity
            style={[s.registerBtn, isLoading && s.registerBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : (
              <>
                <View style={s.registerBtnSheen} />
                <Text style={s.registerBtnText}>Create Account</Text>
                <Text style={s.registerBtnArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Footer ── */}
          <View style={s.footerRow}>
            <Text style={s.footerText}>Already have an account?</Text>
            <TouchableOpacity
              style={{ marginLeft: 6 }}
              onPress={() => navigation.navigate(ROUTES.LOGIN as never)}
            >
              <Text style={s.footerLink}>Login →</Text>
            </TouchableOpacity>
          </View>

        </View>

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
    paddingTop: 52,
    paddingBottom: 48,
    paddingHorizontal: 22,
  },

  // Background
  bgCircle1: {
    position: 'absolute',
    top: -100, right: -80,
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(221,137,40,0.12)',
  },
  bgCircle2: {
    position: 'absolute',
    top: 320, left: -90,
    width: 230, height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(59,36,22,0.06)',
  },
  bgCircle3: {
    position: 'absolute',
    bottom: 100, right: -50,
    width: 170, height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(221,137,40,0.08)',
  },

  dotsLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dot: {
    position: 'absolute',
    width: 3.5, height: 3.5,
    borderRadius: 2,
    backgroundColor: BROWN,
  },

  // Back button
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CREAM_DARK,
  },
  backBtnText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 12,
    color: BROWN_SOFT,
  },

  // Brand
  brandWrap: { alignItems: 'center', marginBottom: 20 },
  heroBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeGlow: {
    position: 'absolute',
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: AMBER_GLOW,
  },
  badgeInner: {
    width: 60, height: 60,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: CREAM_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AMBER_DARK,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  badgeEmoji: { fontSize: 26 },
  brandName: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 30,
    color: BROWN,
  },
  brandSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  brandLine: {
    width: 24, height: 1.5,
    backgroundColor: AMBER,
    borderRadius: 1,
  },
  brandSub: {
    fontFamily: 'OpenSansCondensed-Regular',
    fontSize: 12,
    color: AMBER,
    letterSpacing: 4.5,
    fontWeight: '700',
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: PARCHMENT,
    borderRadius: 28,
    paddingTop: 26,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderWidth: 1.5,
    borderColor: AMBER_BORDER,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 12,
  },

  // Progress steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepSegment: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: CREAM_MID,
    borderWidth: 1.5,
    borderColor: CREAM_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: CREAM_DARK,
    marginHorizontal: 4,
  },
  stepActive: {
    backgroundColor: AMBER,
    borderColor: AMBER_DARK,
  },
  stepDone: {
    backgroundColor: AMBER_DARK,
    borderColor: AMBER_DARK,
  },
  stepNum: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 11,
    color: BROWN_MUTED,
  },
  stepActiveNum: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 11,
    color: WHITE,
  },
  stepDoneIcon: {
    fontSize: 12,
    color: WHITE,
    fontWeight: '800',
  },
  stepHint: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 11,
    color: BROWN_MUTED,
    marginBottom: 18,
    marginTop: 4,
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
    marginBottom: 20,
  },

  // Name row
  nameRow: {
    flexDirection: 'row',
    marginBottom: 0,
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
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: CREAM_DARK,
    paddingHorizontal: 12,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputShellFocused: {
    borderColor: AMBER,
    shadowColor: AMBER,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputIcon: {
    fontSize: 13,
    marginRight: 9,
    opacity: 0.45,
  },
  inputInner: {
    flex:1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  inputText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 13.5,
    color: BROWN,
  },

  // Strength
  strengthWrap: {
    marginTop: 7,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: CREAM_MID,
    opacity: 0.5,
  },
  strengthLabel: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 10.5,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Match hint
  matchHint: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 11,
    marginTop: 5,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 22,
  },
  checkbox: {
    width: 20, height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AMBER,
    backgroundColor: 'rgba(221,137,40,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: AMBER,
    borderColor: AMBER_DARK,
  },
  checkmark: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontFamily: 'OpenSans-Regular',
    fontSize: 12,
    color: BROWN_MUTED,
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: 'OpenSans-SemiBold',
    color: AMBER_DARK,
  },

  // Register button
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AMBER,
    borderRadius: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: AMBER_DARK,
    shadowColor: AMBER_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnSheen: {
    position: 'absolute',
    top: 0, left: 0, right: '50%', bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  registerBtnText: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 17,
    color: WHITE,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  registerBtnArrow: {
    fontSize: 18,
    color: WHITE,
    marginLeft: 8,
    opacity: 0.85,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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

export default Register;
