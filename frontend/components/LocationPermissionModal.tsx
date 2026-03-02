import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Navigation } from 'lucide-react-native';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onClose: () => void;
}

export function LocationPermissionModal({ 
  visible, 
  onRequestPermission, 
  onClose 
}: LocationPermissionModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <MapPin size={32} color={theme.primary} />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
            Enable Location Services
          </Text>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            To show you the nearest buses and accurate arrival times, we need access to your location.
          </Text>
          
          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Navigation size={16} color={theme.primary} />
              <Text style={[styles.benefitText, { color: theme.text }]}>
                Find buses near you
              </Text>
            </View>
            <View style={styles.benefit}>
              <MapPin size={16} color={theme.primary} />
              <Text style={[styles.benefitText, { color: theme.text }]}>
                Get accurate ETAs
              </Text>
            </View>
          </View>
          
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={onRequestPermission}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                Enable Location
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
                Maybe Later
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  benefits: {
    width: '100%',
    marginBottom: 24,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set via theme
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});