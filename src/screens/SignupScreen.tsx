// src/screens/SignupScreen.tsx
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

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authApi.register({
        name,
        email,
        phone,
        password,
        role: 'CUSTOMER',
      });
      const { accessToken } = res.data.data;

      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = meRes.data.data;

      dispatch(setCredentials({ user, token: accessToken }));
      setSuccess('Account created successfully! Redirecting...');

      setTimeout(() => {
        navigation.replace('CustomerTabs');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Email or Phone might already be registered.');
    } finally {
      setIsLoading(false);
    }
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
              style={styles.bannerImage}
            />
            <View style={styles.overlay} />
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>P</Text>
              </View>
              <Text style={styles.logoText}>PRO<Text style={{ color: Colors.red }}>LICIOUS</Text></Text>
            </View>
            <Text style={styles.bannerTitle}>Join Pro-Licious Today</Text>
            <Text style={styles.bannerSub}>Get traceably fresh gourmet cuts delivered fast.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Create Customer Account</Text>
            <Text style={styles.subtext}>Sign up as a new customer to order premium meats</Text>

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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.zinc400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.zinc600}
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: Colors.red }}>Sign In here</Text></Text>
            </TouchableOpacity>

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
  },
  logoIconText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
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
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtext: {
    color: Colors.zinc450 || '#71717a',
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
  loginLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.zinc400,
    fontSize: 12,
    fontWeight: '600',
  },
});
