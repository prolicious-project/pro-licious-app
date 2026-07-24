// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageStyle,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { api } from '../lib/axios';
import { authApi } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Colors, Spacing, Radius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signInMethod, setSignInMethod] = useState<'email' | 'phone'>('email');

  // Sign In Email/Pass State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign In Phone/OTP State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { accessToken, role } = res.data.data;

      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = meRes.data.data;

      dispatch(setCredentials({ user, token: accessToken }));
      setSuccess('Logged in successfully!');

      setTimeout(() => {
        navigateBasedOnRole(role);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.sendOtp(phone);
      setIsOtpSent(true);
      setSuccess('Verification code sent to your phone.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.verifyOtp({
        phone,
        otp,
        name: activeTab === 'signup' ? name : undefined,
        role: 'CUSTOMER',
      });
      const { accessToken, role } = res.data.data;

      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = meRes.data.data;

      dispatch(setCredentials({ user, token: accessToken }));
      setSuccess('Account verified successfully!');

      setTimeout(() => {
        navigateBasedOnRole(role);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || '';
      if (msg.includes('Name required for signup')) {
        setError('This phone number is not registered. Redirecting you to sign up...');
        setTimeout(() => {
          navigation.navigate('Signup');
        }, 1500);
      } else {
        setError(msg || 'Invalid OTP code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateBasedOnRole = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      navigation.replace('AdminStack');
    } else if (role === 'VENDOR') {
      navigation.replace('VendorStack');
    } else if (role === 'RIDER') {
      navigation.replace('RiderStack');
    } else {
      navigation.replace('CustomerTabs');
    }
  };

  const handleResetPhoneFlow = () => {
    setIsOtpSent(false);
    setOtp('');
    setSuccess('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2000&auto=format&fit=crop' }}
              style={styles.bannerImage as ImageStyle}
            />
            <View style={styles.overlay} />
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImage as ImageStyle}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.logoText}>meatinminutes</Text>
            </View>
            <Text style={styles.bannerTitle}>Craving Premium Quality?</Text>
            <Text style={styles.bannerSub}>Fresh, clean, and temperature-controlled.</Text>
          </View>

          <View style={styles.formCard}>
            {/* Active Tab Selector */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                onPress={() => { setActiveTab('signin'); handleResetPhoneFlow(); }}
                style={[styles.tabButton, activeTab === 'signin' && styles.activeTabButton]}
              >
                <Text style={[styles.tabButtonText, activeTab === 'signin' && styles.activeTabButtonText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={styles.tabButton}
              >
                <Text style={styles.tabButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtext}>Sign in to access your platform dashboard</Text>

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign in switcher */}
            <View style={styles.methodSwitcher}>
              <TouchableOpacity
                onPress={() => { setSignInMethod('email'); handleResetPhoneFlow(); }}
                style={[styles.methodButton, signInMethod === 'email' && styles.activeMethodButton]}
              >
                <Text style={[styles.methodButtonText, signInMethod === 'email' && styles.activeMethodButtonText]}>
                  Email & Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSignInMethod('phone'); handleResetPhoneFlow(); }}
                style={[styles.methodButton, signInMethod === 'phone' && styles.activeMethodButton]}
              >
                <Text style={[styles.methodButtonText, signInMethod === 'phone' && styles.activeMethodButtonText]}>
                  Phone & OTP
                </Text>
              </TouchableOpacity>
            </View>

            {signInMethod === 'email' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={Colors.zinc400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="john@example.com"
                    placeholderTextColor={Colors.zinc600}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.zinc400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.zinc600}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                {!isOtpSent ? (
                  <>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="phone-portrait-outline" size={18} color={Colors.zinc400} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="10-digit number"
                        placeholderTextColor={Colors.zinc600}
                        value={phone}
                        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                        keyboardType="phone-pad"
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.submitButton, isLoading && styles.disabledButton]}
                      onPress={handleSendOtp}
                      disabled={isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Verification Code (6-digit OTP)</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, { textAlign: 'center', fontSize: 20, letterSpacing: 8 }]}
                        placeholder="000000"
                        placeholderTextColor={Colors.zinc600}
                        value={otp}
                        onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                    <Text style={styles.infoText}>Code sent to {phone}</Text>

                    <View style={styles.otpBtnRow}>
                      <TouchableOpacity
                        onPress={handleResetPhoneFlow}
                        style={styles.backButton}
                      >
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleVerifyOtp}
                        style={[styles.submitButton, { flex: 2 }, isLoading && styles.disabledButton]}
                        disabled={isLoading || otp.length < 6}
                      >
                        <Text style={styles.submitButtonText}>
                          {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupLink}>
              <Text style={styles.signupLinkText}>Don't have an account? <Text style={{ color: Colors.red }}>Sign Up here</Text></Text>
            </TouchableOpacity>

            {/* TEMP: remove before production */}
            <View style={styles.demoCredentialsBox}>
              <Text style={styles.demoTitle}>DEMO CREDENTIALS</Text>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Customer:</Text>
                <Text style={styles.demoValue}>john@example.com</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Vendor:</Text>
                <Text style={styles.demoValue}>vendor@example.com</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Rider:</Text>
                <Text style={styles.demoValue}>rider@example.com</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Admin:</Text>
                <Text style={styles.demoValue}>admin@example.com</Text>
              </View>
              <Text style={styles.demoPass}>Password for all: password123</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['2xl'],
  },
  bannerContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.7)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    zIndex: 10,
  },
  logoIcon: {
    backgroundColor: Colors.red,
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    zIndex: 10,
  },
  bannerSub: {
    color: Colors.zinc400,
    fontSize: 12,
    marginTop: 4,
    zIndex: 10,
  },
  formCard: {
    backgroundColor: Colors.bgCardDark,
    marginHorizontal: Spacing.base,
    marginTop: -Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  activeTabButton: {
    backgroundColor: Colors.red,
  },
  tabButtonText: {
    color: Colors.zinc400,
    fontWeight: '700',
    fontSize: 12,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtext: {
    color: Colors.zinc400 || '#71717a',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
    gap: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  methodSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    gap: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  activeMethodButton: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  methodButtonText: {
    color: Colors.zinc600,
    fontWeight: '700',
    fontSize: 10,
  },
  activeMethodButtonText: {
    color: '#fff',
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.zinc400,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: Colors.red,
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.base,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoText: {
    color: Colors.zinc400,
    fontSize: 11,
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  otpBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.zinc300,
    fontWeight: '700',
    fontSize: 13,
  },
  signupLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  signupLinkText: {
    color: Colors.zinc400,
    fontSize: 12,
    fontWeight: '600',
  },
  demoCredentialsBox: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDark,
    alignItems: 'stretch',
  },
  demoTitle: {
    color: Colors.zinc400,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.6)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginBottom: 4,
  },
  demoLabel: {
    color: Colors.zinc300,
    fontWeight: '700',
    fontSize: 10,
  },
  demoValue: {
    color: Colors.zinc400,
    fontSize: 10,
  },
  demoPass: {
    color: Colors.redLight,
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
