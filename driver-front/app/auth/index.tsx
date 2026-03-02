import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Bus, Shield, FileText } from 'lucide-react-native';
import LegalAgreements from '@/components/LegalAgreements';

export default function AuthIndex() {
  const { theme } = useTheme();
  const router = useRouter();
  const [showTermsPreview, setShowTermsPreview] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>UBMS Driver</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Professional Bus Tracking
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Shield color={theme.primary} size={24} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Secure driver authentication
            </Text>
          </View>
          <View style={styles.feature}>
            <Bus color={theme.primary} size={24} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Real-time bus tracking
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              Driver Login
            </Text>
          </Pressable>

          <Pressable
            style={[styles.termsButton]}
            onPress={() => setShowTermsPreview(true)}
          >
            <FileText color={theme.primary} size={16} />
            <Text style={[styles.termsButtonText, { color: theme.primary }]}>
              View Driver Terms & Privacy Policy
            </Text>
          </Pressable>
        </View>

        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            This app is exclusively for authorized bus drivers.
          </Text>
        </View>
      </View>

      <LegalAgreements
        visible={showTermsPreview}
        readOnly={true}
        onDecline={() => setShowTermsPreview(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 26,
  },
  features: {
    marginBottom: 60,
    paddingHorizontal: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    marginLeft: 16,
    letterSpacing: -0.2,
  },
  buttons: {
    marginBottom: 50,
    paddingHorizontal: 8,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    // backgroundColor set via theme
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  disclaimer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  disclaimerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  termsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textDecorationLine: 'underline',
  },
});