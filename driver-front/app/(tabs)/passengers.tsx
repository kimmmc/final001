import { View, Text, StyleSheet, FlatList, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useDriverData } from '@/hooks/useDriverData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Users, MapPin, Clock, Filter, CheckCircle, XCircle, UserCheck, UserX, UserPlus, RefreshCw } from 'lucide-react-native';
import { apiService } from '@/services/api';

export default function Passengers() {
  const { theme } = useTheme();
  const { passengers, schedules, loading, refetch } = useDriverData();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'interested' | 'confirmed'>('all');
  const [updatingInterest, setUpdatingInterest] = useState<string | null>(null);

  const handleConfirmInterest = async (interestId: string, passengerName: string) => {
    try {
      setUpdatingInterest(interestId);
      await apiService.updateUserInterestStatus(interestId, 'confirmed');
      Alert.alert(t('common.success'), `${passengerName} ${t('passengers.confirmed')}!`);
      refetch(); // Refresh the data
    } catch (error: any) {
      console.error('Error confirming interest:', error);
      Alert.alert(t('common.error'), error.message || t('passengers.no.found'));
    } finally {
      setUpdatingInterest(null);
    }
  };

  const handleDenyInterest = async (interestId: string, passengerName: string) => {
    try {
      setUpdatingInterest(interestId);
      await apiService.updateUserInterestStatus(interestId, 'cancelled');
      Alert.alert(t('common.success'), `${passengerName} ${t('passengers.deny')}.`);
      refetch(); // Refresh the data
    } catch (error: any) {
      console.error('Error denying interest:', error);
      Alert.alert(t('common.error'), error.message || t('passengers.no.found'));
    } finally {
      setUpdatingInterest(null);
    }
  };

  const filteredPassengers = passengers.filter(passenger => {
    if (filter === 'all') return true;
    return passenger.status === filter;
  });

  const renderFilterButton = (filterType: 'all' | 'interested' | 'confirmed', label: string) => (
    <Pressable
      key={filterType}
      style={[
        styles.filterButton,
        { 
          backgroundColor: filter === filterType ? theme.primary : theme.surface,
          borderColor: theme.border 
        }
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: filter === filterType ? theme.background : theme.text }
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderPassengerCard = ({ item: passenger }: { item: any }) => (
    <View style={[styles.passengerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.passengerHeader}>
        <View style={[styles.passengerAvatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.passengerInitial}>
            {passenger.user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.passengerInfo}>
          <Text style={[styles.passengerName, { color: theme.text }]}>
            {passenger.user?.name || t('passengers.unknown')}
          </Text>
        </View>
                  <View style={[
            styles.statusBadge,
            { backgroundColor: passenger.status === 'confirmed' ? '#4CAF50' + '15' : '#d90429' + '15' }
          ]}>
            {passenger.status === 'confirmed' ? (
              <CheckCircle size={16} color="#4CAF50" />
            ) : (
              <Clock size={16} color="#d90429" />
            )}
            <Text style={[
              styles.statusText,
              { color: passenger.status === 'confirmed' ? '#4CAF50' : '#d90429' }
            ]}>
            {passenger.status}
          </Text>
        </View>
      </View>

      <View style={styles.passengerDetails}>
        <View style={styles.detailItem}>
          <MapPin size={16} color={theme.primary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            {t('passengers.pickup.point')}
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {passenger.pickupPoint?.name || 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Clock size={16} color={theme.textSecondary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            {t('passengers.interested.since')}
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {new Date(passenger.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Action Buttons for Interested Passengers */}
      {passenger.status === 'interested' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.confirmButton, 
              { 
                backgroundColor: updatingInterest === passenger.id ? theme.surface : '#4CAF50',
                borderColor: updatingInterest === passenger.id ? theme.border : '#4CAF50'
              }
            ]}
            onPress={() => {
              Alert.alert(
                'Confirm Passenger',
                `Are you sure you want to confirm ${passenger.user?.name || 'this passenger'}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Confirm', 
                    onPress: () => handleConfirmInterest(passenger.id, passenger.user?.name || 'this passenger')
                  }
                ]
              );
            }}
            disabled={updatingInterest === passenger.id}
          >
            <Text style={[
              styles.filterButtonText,
              { color: updatingInterest === passenger.id ? theme.textSecondary : '#FFFFFF' }
            ]}>
              {updatingInterest === passenger.id ? t('passengers.confirming') : t('passengers.confirm')}
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.denyButton, 
              { 
                backgroundColor: updatingInterest === passenger.id ? theme.surface : '#d90429',
                borderColor: updatingInterest === passenger.id ? theme.border : '#d90429'
              }
            ]}
            onPress={() => {
              Alert.alert(
                t('passengers.deny'),
                `${t('passengers.deny')} ${passenger.user?.name || t('passengers.unknown')}?`,
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('passengers.deny'), 
                    onPress: () => handleDenyInterest(passenger.id, passenger.user?.name || t('passengers.unknown'))
                  }
                ]
              );
            }}
            disabled={updatingInterest === passenger.id}
          >
            <Text style={[
              styles.filterButtonText,
              { color: updatingInterest === passenger.id ? theme.textSecondary : '#FFFFFF' }
            ]}>
              {updatingInterest === passenger.id ? t('passengers.denying') : t('passengers.deny')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

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
              {t('passengers.title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {filteredPassengers.length} {t('passengers.found')}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.refreshButton, { backgroundColor: theme.primary }]}
              onPress={refetch}
              disabled={loading}
            >
              <RefreshCw size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.primary + '15' }]}>
              <Users size={24} color={theme.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {passengers.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                {t('passengers.total.interested')}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: '#4CAF50' + '15' }]}>
              <UserCheck size={24} color="#4CAF50" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {passengers.filter(p => p.status === 'confirmed').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                {t('passengers.confirmed')}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: '#d90429' + '15' }]}>
              <UserPlus size={24} color="#d90429" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {passengers.filter(p => p.status === 'interested').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                {t('passengers.pending')}
              </Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {renderFilterButton('all', t('passengers.all'))}
          {renderFilterButton('interested', t('passengers.interested'))}
          {renderFilterButton('confirmed', t('passengers.confirmed'))}
        </View>

        {/* Passengers List */}
        <FlatList
          data={filteredPassengers}
          renderItem={renderPassengerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={() => (
            <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.emptyStateIcon, { backgroundColor: theme.textSecondary + '15' }]}>
                <Users size={40} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyStateText, { color: theme.text }]}>
                {t('passengers.no.found')}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                {filter === 'all' 
                  ? t('passengers.no.interest')
                  : t('passengers.no.pending')
                }
              </Text>
            </View>
          )}
        />
      </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  passengerCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  passengerInitial: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  passengerDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  confirmButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  denyButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

});