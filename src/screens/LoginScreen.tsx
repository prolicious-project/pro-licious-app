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
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials, setGuest } from '../store/slices/authSlice';
import { api } from '../lib/axios';
import { authApi } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Colors, Spacing, Radius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  // Did the user get redirected here from Checkout because they aren't logged in?
  const returnToCheckout = route?.params?.returnToCheckout ?? false;

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
        navigateAfterLogin(role);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // After successful login: vendor/rider/admin go to their stacks;
  // customers return to checkout if that's what triggered the login, else home.
  const navigateAfterLogin = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      navigation.replace('AdminStack');
    } else if (role === 'VENDOR') {
      navigation.replace('VendorStack');
    } else if (role === 'RIDER') {
      navigation.replace('RiderStack');
    } else {
      // Customer: go back to checkout if that's what triggered login
      if (returnToCheckout) {
        navigation.replace('CustomerTabs');
        // Small delay to let CustomerTabs mount, then push Checkout
        setTimeout(() => {
          navigation.navigate('CustomerTabs', undefined);
          // Navigate into the nested HomeStack to Checkout
          (navigation as any).navigate('Checkout');
        }, 150);
      } else {
        navigation.replace('CustomerTabs');
      }
    }
  };

  // "Skip" — let user browse as guest without logging in
  const handleSkip = () => {
    dispatch(setGuest());
    navigation.replace('CustomerTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Skip button — top-right, like Swiggy/Zomato */}
        {!returnToCheckout && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.red} />
          </TouchableOpacity>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Return-to-checkout banner */}
          {returnToCheckout && (
            <View style={styles.checkoutBanner}>
              <Ionicons name="lock-closed" size={16} color={Colors.red} />
              <Text style={styles.checkoutBannerText}>
                Please log in to complete your order
              </Text>
            </View>
          )}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/appicon.png')}
              style={styles.logo as ImageStyle}
              resizeMode="contain"
            />
          </View>

          {/* Form Card */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username, email or mobile number"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupButtonText}>Create new account</Text>
            </TouchableOpacity>
          </View>

          {/* Skip hint text — only when not forced */}
          {!returnToCheckout && (
            <TouchableOpacity onPress={handleSkip} style={styles.guestHintContainer}>
              <Text style={styles.guestHintText}>
                Just browsing?{' '}
                <Text style={styles.guestHintLink}>Continue as guest →</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Branding */}
          <View style={styles.brandingContainer}>
            <Text style={styles.brandingText}>MeatInMinutes</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 48, // leave space for skip button
  },

  // ── Skip Button (top-right, Swiggy/Zomato style) ──────────────────────────
  skipButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.redBorder,
    backgroundColor: Colors.redBg,
  },
  skipText: {
    color: Colors.red,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Checkout-required banner ───────────────────────────────────────────────
  checkoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: Colors.redBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: Spacing.lg,
  },
  checkoutBannerText: {
    flex: 1,
    color: Colors.red,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 190,
    height: 190,
  },

  // ── Form Card ─────────────────────────────────────────────────────────────
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.base,
    maxWidth: 380,
    alignSelf: 'center',
    width: '100%',
  },

  // ── Alerts ────────────────────────────────────────────────────────────────
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 12,
    marginBottom: Spacing.base,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 12,
    marginBottom: Spacing.base,
    gap: 8,
  },
  successText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputContainer: {
    position: 'relative',
    marginVertical: Spacing.sm,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000',
    height: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 10,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  loginButton: {
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    height: 44,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: Spacing.md,
  },

  // ── Sign Up ───────────────────────────────────────────────────────────────
  signupButton: {
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  signupButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 15,
  },

  // ── Guest hint ────────────────────────────────────────────────────────────
  guestHintContainer: {
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  guestHintText: {
    fontSize: 13,
    color: Colors.gray500,
  },
  guestHintLink: {
    color: Colors.red,
    fontWeight: '600',
  },

  // ── Branding ──────────────────────────────────────────────────────────────
  brandingContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  brandingText: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '500',
  },
});
