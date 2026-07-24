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
  ImageStyle,
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Language Selector */}
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>English (US)</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
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
                <Ionicons name="checkmark-circle" size={18} color="#dc2626" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <Text style={styles.titleText}>Create Customer Account</Text>
            <Text style={styles.subtitleText}>Sign up as a new customer to order premium meats</Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="10-digit number"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
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
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Sign In Link */}
            <TouchableOpacity 
              style={styles.signinButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signinButtonText}>Already have an account? <Text style={{ color: '#dc2626', fontWeight: '700' }}>Sign in here</Text></Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  
  // Language Selector
  languageButton: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  languageText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },

  // Logo Container
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
  },

  // Form Container
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

  // Title and Subtitle
  titleText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  // Error and Success Boxes
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
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 12,
    marginBottom: Spacing.base,
    gap: 8,
  },
  successText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // Input Container
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

  // Buttons
  createButton: {
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    height: 44,
    flexDirection: 'row',
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: Spacing.md,
  },

  // Sign In Button
  signinButton: {
    alignItems: 'center',
  },
  signinButtonText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
});

