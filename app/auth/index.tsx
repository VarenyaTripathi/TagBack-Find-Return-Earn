import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Mail, Lock, User, CircleAlert as AlertCircle, Eye, EyeOff, Info } from 'lucide-react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authError, setAuthError] = useState<string>('');
  
  const { signIn, signUp, isLoading } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showDemoCredentials = () => {
    Alert.alert(
      'Demo Credentials',
      'For testing purposes, you can:\n\n1. Create a new account by switching to "Sign Up"\n2. Use any valid email format (e.g., test@example.com)\n3. Use a password with at least 6 characters\n\nNote: Make sure your Supabase project is properly configured with the correct URL and API key.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setAuthError('');

    try {
      if (isLogin) {
        console.log('Attempting to sign in with:', email);
        await signIn(email, password);
      } else {
        console.log('Attempting to sign up with:', email, username);
        await signUp(email, password, username);
      }
      console.log('Authentication successful, navigating to tabs');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        setAuthError('An account with this email already exists. Please sign in instead.');
        setIsLogin(true); // Switch to login mode
      } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        if (isLogin) {
          setAuthError('Invalid email or password. Please check your credentials or create a new account if you don\'t have one yet.');
        } else {
          setAuthError('Unable to create account. Please try again or contact support.');
        }
      } else if (error.message.includes('Email not confirmed')) {
        setAuthError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('too_many_requests') || error.message.includes('over_email_send_rate_limit')) {
        setAuthError('Too many attempts. Please wait a moment before trying again.');
      } else if (error.message.includes('signup_disabled')) {
        setAuthError('Account creation is currently disabled. Please contact support.');
      } else {
        setAuthError(error.message || 'Authentication failed. Please check your internet connection and try again.');
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setAuthError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={48} color="white" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Smart Lost & Found</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Join our community'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {authError ? (
              <View style={styles.authErrorContainer}>
                <AlertCircle size={20} color="#E53E3E" />
                <Text style={styles.authErrorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Demo info banner */}
            <View style={styles.demoInfoContainer}>
              <Info size={16} color="#3182CE" />
              <Text style={styles.demoInfoText}>
                {isLogin ? 'Don\'t have an account? Switch to Sign Up to create one.' : 'Creating your first account? Use any valid email and a secure password.'}
              </Text>
              <TouchableOpacity onPress={showDemoCredentials} style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Help</Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#667eea" />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#667eea" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={switchMode}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchButtonTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FED7D7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  authErrorText: {
    color: '#E53E3E',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  demoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  demoInfoText: {
    color: '#2B6CB0',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  helpButton: {
    backgroundColor: '#3182CE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  helpButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1A202C',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  switchButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  switchButtonTextBold: {
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
});