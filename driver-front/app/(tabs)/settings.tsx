import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Wifi,
  MapPin,
  Volume2,
  Smartphone,
  Mail,
  Phone,
  Info,
  ChevronRight,
  Globe,
  FileText
} from 'lucide-react-native';
import LegalAgreements from '@/components/LegalAgreements';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLegalAgreements, setShowLegalAgreements] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logout.confirm'),
      [
        { text: t('settings.logout.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout.confirm.button'), 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Settings: Logout button pressed');
              await logout();
              console.log('Settings: Logout completed successfully');
            } catch (error) {
              console.error('Settings: Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      t('settings.contact.support'),
      `${t('settings.support.info')}\n\n${t('settings.support.email')}\n${t('settings.support.phone')}`,
      [{ text: t('common.ok') }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      t('settings.about.title'),
      `${t('settings.about.version')}\n\n${t('settings.about.description')}\n\n${t('settings.about.copyright')}`,
      [{ text: t('common.ok') }]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      t('settings.language.select'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.language.english'), 
          onPress: () => setLanguage('en')
        },
        { 
          text: t('settings.language.kinyarwanda'), 
          onPress: () => setLanguage('rw')
        }
      ]
    );
  };

  const handleLegalAgreements = () => {
    setShowLegalAgreements(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('settings.title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('settings.subtitle')}
            </Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
              <User size={20} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('settings.profile')}
            </Text>
          </View>
          
          <View style={styles.profileCard}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0) || 'D'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {user?.name || 'Driver Name'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {user?.email || 'driver@example.com'}
              </Text>
              <Text style={[styles.profileRole, { color: theme.primary }]}>
                {t('settings.profile')}
              </Text>
            </View>
          </View>
        </View>



        {/* Preferences */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
              <SettingsIcon size={20} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('settings.preferences')}
            </Text>
          </View>
          
          <View style={styles.settingItems}>
                        <Pressable
              style={styles.settingItem}
              onPress={toggleTheme}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                  {isDark ? <Moon size={18} color={theme.primary} /> : <Sun size={18} color={theme.primary} />}
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {t('settings.dark.mode')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {t('settings.dark.mode.description')}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={handleLanguageChange}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Globe size={18} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {t('settings.language')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {language === 'en' ? t('settings.language.english') : t('settings.language.kinyarwanda')}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Support */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
              <HelpCircle size={20} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('settings.support')}
            </Text>
          </View>
          
          <View style={styles.settingItems}>
            <Pressable
              style={styles.settingItem}
              onPress={handleContactSupport}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Phone size={18} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {t('settings.contact.support')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {t('settings.contact.support.description')}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={handleAbout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Info size={18} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {t('settings.about')}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {t('settings.about.description')}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={handleLegalAgreements}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                  <FileText size={18} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Legal Agreements
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Driver Terms, Privacy Policy & Copyright
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: '#d90429' }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>
              {t('settings.logout')}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t('settings.about.title')} v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
            {t('settings.about.copyright')}
          </Text>
        </View>
      </ScrollView>

      <LegalAgreements
        visible={showLegalAgreements}
        readOnly={true}
        onDecline={() => setShowLegalAgreements(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  settingItems: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  logoutSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});