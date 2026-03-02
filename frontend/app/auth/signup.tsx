import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, Shield } from 'lucide-react-native';
import LegalAgreements from '@/components/LegalAgreements';

export default function Signup() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { signup, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await signup(name, email, phone, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft color={theme.text} size={20} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('signup')}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                Create Account
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
                Join thousands of users tracking buses across Rwanda
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('name')}
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: nameFocused ? theme.primary : theme.border,
                  shadowColor: theme.text,
                }
              ]}>
                <User color={theme.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textSecondary}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('email')}
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: emailFocused ? theme.primary : theme.border,
                  shadowColor: theme.text,
                }
              ]}>
                <Mail color={theme.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('phone')}
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: phoneFocused ? theme.primary : theme.border,
                  shadowColor: theme.text,
                }
              ]}>
                <Phone color={theme.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+250 7XX XXX XXX"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('password')}
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: passwordFocused ? theme.primary : theme.border,
                  shadowColor: theme.text,
                }
              ]}>
                <Lock color={theme.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color={theme.textSecondary} size={20} />
                  ) : (
                    <Eye color={theme.textSecondary} size={20} />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                Confirm Password
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: confirmPasswordFocused ? theme.primary : theme.border,
                  shadowColor: theme.text,
                }
              ]}>
                <Lock color={theme.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff color={theme.textSecondary} size={20} />
                  ) : (
                    <Eye color={theme.textSecondary} size={20} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[
                styles.signupButton, 
                { 
                  backgroundColor: loading ? theme.textSecondary : theme.primary,
                  opacity: loading ? 0.7 : 1,
                }
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={[styles.signupButtonText, { color: theme.background }]}>
                {loading ? 'Creating account...' : t('signup')}
              </Text>
            </Pressable>

            <View style={styles.agreementNotice}>
              <Shield color={theme.primary} size={16} />
              <Text style={[styles.agreementText, { color: theme.textSecondary }]}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Pressable onPress={() => router.push('/auth/login')}>
                <Text style={[styles.linkText, { color: theme.primary }]}>
                  {t('login')}
                </Text>
              </Pressable>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  form: {
    flex: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
  },
  signupButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  signupButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    textDecorationLine: 'underline',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  agreementNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  agreementText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 18,
  },
  agreementLink: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    textDecorationLine: 'underline',
  },
});