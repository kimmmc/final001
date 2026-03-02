import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, Shield, FileText } from 'lucide-react-native';
import LegalAgreements from '@/components/LegalAgreements';

export default function Login() {
  const { theme } = useTheme();
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid credentials or not a driver account');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={theme.text} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>
          Driver Login
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.securityNotice}>
          <Shield size={20} color={theme.primary} />
          <Text style={[styles.securityText, { color: theme.textSecondary }]}>
            Secure driver authentication required
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Driver Email
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your driver email"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Password
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
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

        <Pressable
          style={[styles.loginButton, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.loginButtonText, { color: theme.background }]}>
            Sign In as Driver
          </Text>
        </Pressable>

        <View style={styles.agreementNotice}>
          <FileText color={theme.primary} size={16} />
          <Text style={[styles.agreementText, { color: theme.textSecondary }]}>
            By signing in, you agree to our Driver Terms of Service and Privacy Policy
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Only authorized drivers can access this app.
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Contact your administrator for access.
          </Text>
        </View>
      </View>
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.2,
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
  input: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingRight: 55,
    borderRadius: 16,
    borderWidth: 2,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    padding: 6,
    borderRadius: 12,
  },
  loginButton: {
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
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
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