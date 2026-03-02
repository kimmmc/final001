import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { X, FileText, Shield, Copyright, Car, BookOpen } from 'lucide-react-native';

interface LegalAgreementsProps {
  visible: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  readOnly?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LegalAgreements({ visible, onAccept, onDecline, readOnly = false }: LegalAgreementsProps) {
  const { theme } = useTheme();

  const summaryContent = {
    overview: {
      title: 'Driver Legal Agreements',
      description: 'As a professional driver, you are governed by specific legal agreements that ensure passenger safety and service quality.',
      sections: [
        {
          title: 'Driver License Agreement',
          icon: <Car size={20} color={theme.primary} />,
          keyPoints: [
            'Maintain accurate location data sharing while driving',
            'Follow all traffic laws and safety regulations',
            'Provide accurate passenger count information',
            'Report technical issues promptly',
            'Maintain confidentiality of passenger information',
            'Use hands-free operation only while driving'
          ]
        },
        {
          title: 'Driver Privacy Policy',
          icon: <Shield size={20} color={theme.primary} />,
          keyPoints: [
            'Real-time location sharing for passenger tracking',
            'Route optimization and schedule management',
            'Safety monitoring and emergency response',
            'Performance analysis and quality assurance',
            'Compliance with transportation regulations',
            'Company management and reporting'
          ]
        },
        {
          title: 'Driver Copyright Notice',
          icon: <Copyright size={20} color={theme.primary} />,
          keyPoints: [
            'All app content protected by copyright laws',
            'Authorized professional driving use only',
            'Maintain confidentiality of company information',
            'Passenger data must be kept secure and private',
            'No sharing of driver credentials with others',
            'Company policies and procedures must be followed'
          ]
        }
      ]
    }
  };

  const renderSummary = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryHeader}>
        <BookOpen color={theme.primary} size={24} />
        <Text style={[styles.summaryTitle, { color: theme.text }]}>
          {summaryContent.overview.title}
        </Text>
      </View>
      
      <Text style={[styles.summaryDescription, { color: theme.textSecondary }]}>
        {summaryContent.overview.description}
      </Text>

      {summaryContent.overview.sections.map((section, index) => (
        <View key={index} style={[styles.summarySection, { backgroundColor: theme.surface }]}>
          <View style={styles.summarySectionHeader}>
            {section.icon}
            <Text style={[styles.summarySectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>
          </View>
          {section.keyPoints.map((point, pointIndex) => (
            <View key={pointIndex} style={styles.summaryPoint}>
              <View style={[styles.summaryBullet, { backgroundColor: theme.primary }]} />
              <Text style={[styles.summaryPointText, { color: theme.textSecondary }]}>
                {point}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={[styles.summaryFooter, { backgroundColor: theme.surface }]}>
        <Text style={[styles.summaryFooterText, { color: theme.textSecondary }]}>
          These agreements govern your professional use of this driver application. By using this app, you acknowledge that you have read, understood, and agree to be bound by these terms as a professional driver.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Car color={theme.primary} size={24} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Driver Terms & Privacy Policy
            </Text>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={onDecline || (() => {})}
          >
            <X color={theme.text} size={24} />
          </Pressable>
        </View>

        {renderSummary()}

        {!readOnly && onAccept && onDecline && (
          <View style={styles.footer}>
            <Pressable
              style={[styles.declineButton, { borderColor: theme.border }]}
              onPress={onDecline}
            >
              <Text style={[styles.declineButtonText, { color: theme.text }]}>
                Decline
              </Text>
            </Pressable>

            <Pressable
              style={[styles.acceptButton, { backgroundColor: theme.primary }]}
              onPress={onAccept}
            >
              <Text style={[styles.acceptButtonText, { color: theme.background }]}>
                Accept & Continue
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: screenHeight * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  summaryDescription: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  summarySection: {
    marginBottom: 20,
    padding: Math.min(screenWidth * 0.04, 16),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  summarySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  summarySectionTitle: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontFamily: 'Inter-Bold',
  },
  summaryPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  summaryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  summaryPointText: {
    fontSize: Math.min(screenWidth * 0.032, 13),
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 18,
  },
  summaryFooter: {
    padding: Math.min(screenWidth * 0.04, 16),
    borderRadius: 12,
    marginTop: 8,
  },
  summaryFooterText: {
    fontSize: Math.min(screenWidth * 0.032, 13),
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontFamily: 'Inter-SemiBold',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontFamily: 'Inter-SemiBold',
  },
}); 