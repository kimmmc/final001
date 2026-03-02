import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useDriverData } from '@/hooks/useDriverData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  Navigation, 
  Power, 
  PowerOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Route,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react-native';
import { apiService } from '@/services/api';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { location, requestLocation } = useLocation();
  const { bus, passengers, schedules, completedTripsCount, loading, error, refetch, updateOnlineStatus, updateBusLocation } = useDriverData();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (bus) {
      setIsOnline(bus.isOnline);
    }
  }, [bus]);

  const handleToggleOnline = async () => {
    if (!bus) {
      Alert.alert('Error', 'No bus assigned to you');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable location to go online');
      await requestLocation();
      return;
    }

    const newStatus = !isOnline;
    const success = await updateOnlineStatus(newStatus);
    
    if (success) {
      setIsOnline(newStatus);
      
      // If going online, start location tracking automatically
      if (newStatus) {
        // Start location tracking immediately
        const locationSuccess = await updateBusLocation(
          location.latitude,
          location.longitude,
          0, // speed
          0, // heading
          location.accuracy || 0
        );
        
        if (locationSuccess) {
          Alert.alert(
            'Status Updated',
            'You are now online and location tracking has started'
          );
        } else {
          Alert.alert(
            'Status Updated',
            'You are now online but location tracking failed. Please check your location settings.'
          );
        }
      } else {
        Alert.alert(
          'Status Updated',
          'You are now offline'
        );
      }
    } else {
      Alert.alert('Error', 'Failed to update status');
    }
  };



  const handleStartTrip = async () => {
    if (!schedules.length) {
      Alert.alert(t('no.schedules'), 'No schedules available to start');
      return;
    }

    // Get the next scheduled trip
    const nextSchedule = schedules.find(schedule => 
      schedule.status === 'scheduled' && new Date(schedule.departureTime) > new Date()
    );

    if (!nextSchedule) {
      Alert.alert(t('no.upcoming.trips'), 'No scheduled trips available to start');
      return;
    }

    // Show direction selection dialog
    Alert.alert(
      'Select Direction',
      'Choose the direction for this trip:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Outbound (To Destination)',
          onPress: async () => {
            try {
              const result = await apiService.startTrip(nextSchedule.id, 'outbound');
              const message = result.cleanedInterests > 0 
                ? `${t('trip.started.message')}\nCleaned up ${result.cleanedInterests} leftover interests from previous trips.`
                : t('trip.started.message');
              Alert.alert(t('trip.started'), message);
              refetch(); // Refresh the data
            } catch (error: any) {
              console.error('Error starting trip:', error);
              Alert.alert('Error', error.message || 'Failed to start trip');
            }
          }
        },
        {
          text: 'Inbound (To Origin)',
          onPress: async () => {
            try {
              const result = await apiService.startTrip(nextSchedule.id, 'inbound');
              const message = result.cleanedInterests > 0 
                ? `${t('trip.started.message')}\nCleaned up ${result.cleanedInterests} leftover interests from previous trips.`
                : t('trip.started.message');
              Alert.alert(t('trip.started'), message);
              refetch(); // Refresh the data
            } catch (error: any) {
              console.error('Error starting trip:', error);
              Alert.alert('Error', error.message || 'Failed to start trip');
            }
          }
        }
      ]
    );
  };

  const handleEndTrip = async () => {
    // Find the current in-transit trip
    const currentTrip = schedules.find(schedule => schedule.status === 'in-transit');

    if (!currentTrip) {
      Alert.alert(t('no.active.trip'), 'No trip is currently in progress');
      return;
    }

    Alert.alert(
      t('trip.ended'),
      t('end.trip.confirm'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('trip.ended'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiService.endTrip(currentTrip.id);
              Alert.alert(
                t('trip.ended'), 
                `${t('trip.ended.message')}\n${t('removed.interests')} ${result.deletedInterests} ${t('passenger.interests')}.\n${t('schedule.deleted')}`
              );
              refetch(); // Refresh the data to show updated schedules
            } catch (error: any) {
              console.error('Error ending trip:', error);
              Alert.alert('Error', error.message || 'Failed to end trip');
            }
          }
        }
      ]
    );
  };

  const todaySchedules = schedules.filter(schedule => {
    const today = new Date();
    const scheduleDate = new Date(schedule.departureTime);
    return scheduleDate.toDateString() === today.toDateString();
  });

  const nextSchedule = todaySchedules
    .filter(schedule => new Date(schedule.departureTime) > new Date())
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0];

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: theme.error + '15' }]}>
            <AlertCircle size={48} color={theme.error} />
          </View>
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {new Date().getHours() < 12 ? t('dashboard.greeting.morning') : new Date().getHours() < 18 ? t('dashboard.greeting.afternoon') : t('dashboard.greeting.evening')},
            </Text>
            <Text style={[styles.driverName, { color: theme.text }]}>
              {user?.name}
            </Text>

          </View>
          
          <View style={styles.headerButtons}>
            <Pressable
              style={[
                styles.onlineToggle,
                { backgroundColor: isOnline ? '#4CAF50' : '#d90429' }
              ]}
              onPress={handleToggleOnline}
            >
              {isOnline ? (
                <Power size={20} color="#FFFFFF" />
              ) : (
                <PowerOff size={20} color="#FFFFFF" />
              )}
              <Text style={styles.onlineText}>
                {isOnline ? t('dashboard.online') : t('dashboard.offline')}
              </Text>
            </Pressable>
            

          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statsIcon, { backgroundColor: theme.primary + '15' }]}>
              <Bus size={24} color={theme.primary} />
            </View>
            <View style={styles.statsContent}>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                {t('dashboard.bus.status')}
              </Text>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {bus ? bus.plateNumber : t('bus.no.assigned')}
              </Text>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statsIcon, { backgroundColor: '#4CAF50' + '15' }]}>
              <Users size={24} color="#4CAF50" />
            </View>
            <View style={styles.statsContent}>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                {t('dashboard.interested')}
              </Text>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {passengers.length}
              </Text>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statsIcon, { backgroundColor: '#d90429' + '15' }]}>
              <Clock size={24} color="#d90429" />
            </View>
            <View style={styles.statsContent}>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                {t('dashboard.today.trips')}
              </Text>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {todaySchedules.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Bus Information Card */}
        {bus && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
                <Bus size={20} color={theme.primary} />
              </View>
                          <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('dashboard.bus.details')}
            </Text>
            </View>
            <View style={styles.busInfo}>
              <View style={styles.busDetail}>
                              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                {t('dashboard.plate.number')}
              </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {bus.plateNumber}
                </Text>
              </View>
              <View style={styles.busDetail}>
                              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                {t('dashboard.capacity')}
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.text }]}>
                {bus.capacity} {t('dashboard.passengers')}
              </Text>
              </View>
              <View style={styles.busDetail}>
                              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                {t('dashboard.route')}
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.text }]}>
                {bus.route?.name || t('dashboard.no.route')}
              </Text>
              </View>
              {/* Direction display from current schedule */}
              {schedules.find(s => s.status === 'in-transit')?.directionDisplay && (
                <View style={styles.busDetail}>
                  <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                    Direction
                  </Text>
                  <Text style={[styles.busDetailValue, { color: theme.primary }]}>
                    {schedules.find(s => s.status === 'in-transit')?.directionDisplay}
                  </Text>
                </View>
              )}
              <View style={styles.busDetail}>
                              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                {t('dashboard.fare')}
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.primary }]}>
                {bus.fare} {t('dashboard.rwf')}
              </Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Schedule Card */}
        {nextSchedule && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#d90429' + '15' }]}>
                <Calendar size={20} color="#d90429" />
              </View>
                          <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('dashboard.next.schedule')}
            </Text>
            </View>
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={[styles.scheduleIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Clock size={20} color={theme.primary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleTime, { color: theme.text }]}>
                    {new Date(nextSchedule.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[styles.scheduleRoute, { color: theme.textSecondary }]}>
                    {bus?.route?.name}
                  </Text>
                </View>
                <View style={[styles.scheduleStatus, { backgroundColor: '#d90429' + '15' }]}>
                  <Text style={[styles.scheduleStatusText, { color: '#d90429' }]}>
                    {nextSchedule.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* All Upcoming Schedules */}
        {schedules.filter(s => s.status === 'scheduled' && new Date(s.departureTime) > new Date()).length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#2196F3' + '15' }]}>
                <Clock size={20} color="#2196F3" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Upcoming Trips
              </Text>
            </View>
            <View style={styles.schedulesList}>
              {schedules
                .filter(s => s.status === 'scheduled' && new Date(s.departureTime) > new Date())
                .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
                .map((schedule, index) => (
                  <View key={schedule.id} style={[styles.scheduleItem, { borderColor: theme.border }]}>
                    <View style={styles.scheduleItemHeader}>
                      <Text style={[styles.scheduleItemTime, { color: theme.text }]}>
                        {new Date(schedule.departureTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {schedule.directionDisplay && (
                        <View style={[styles.scheduleDirection, { backgroundColor: theme.primary + '15' }]}>
                          <Text style={[styles.scheduleDirectionText, { color: theme.primary }]}>
                            {schedule.directionDisplay}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.scheduleItemRoute, { color: theme.textSecondary }]}>
                      {bus?.route?.name || 'Unknown Route'}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Trip Status */}
        {schedules.some(s => s.status === 'in-transit') && (
          <View style={[styles.section, { backgroundColor: '#FF9800' + '15', borderColor: '#FF9800' + '30' }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FF9800' + '30' }]}>
                <Clock size={20} color="#FF9800" />
              </View>
              <Text style={[styles.sectionTitle, { color: '#FF9800' }]}>
                Trip in Progress
              </Text>
            </View>
            <Text style={[styles.tripStatusText, { color: '#FF9800' }]}>
              You have an active trip. Passengers can still show interest until you end the trip.
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={[styles.section, { borderColor: theme.border + '20' }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#4CAF50' + '15' }]}>
              <Navigation size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('dashboard.quick.actions')}
            </Text>
          </View>
          <View style={styles.quickActions}>
            <Pressable
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: schedules.some(s => s.status === 'in-transit') ? '#FF9800' : theme.primary,
                  opacity: schedules.some(s => s.status === 'in-transit') ? 0.6 : 1
                }
              ]}
              onPress={handleStartTrip}
              disabled={schedules.some(s => s.status === 'in-transit')}
            >
              <Navigation size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {schedules.some(s => s.status === 'in-transit') ? t('trip.in.progress') : t('dashboard.start.trip')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: schedules.some(s => s.status === 'in-transit') ? '#d90429' : '#4CAF50',
                  opacity: schedules.some(s => s.status === 'in-transit') ? 1 : 0.6
                }
              ]}
              onPress={handleEndTrip}
              disabled={!schedules.some(s => s.status === 'in-transit')}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {t('dashboard.end.trip')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#9C27B0' + '15' }]}>
              <TrendingUp size={20} color="#9C27B0" />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('dashboard.performance')}
            </Text>
          </View>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <View style={[styles.performanceIcon, { backgroundColor: theme.primary + '15' }]}>
                <Route size={16} color={theme.primary} />
              </View>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                {t('dashboard.trips.completed')}
              </Text>
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {completedTripsCount}
              </Text>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={[styles.performanceIcon, { backgroundColor: '#4CAF50' + '15' }]}>
                <Users size={16} color="#4CAF50" />
              </View>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                {t('dashboard.total.passengers')}
              </Text>
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {passengers.length}
              </Text>
            </View>
            
            <View style={styles.performanceItem}>
                          <View style={[styles.performanceIcon, { backgroundColor: '#d90429' + '15' }]}>
              <DollarSign size={16} color="#d90429" />
              </View>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                {t('dashboard.estimated.earnings')}
              </Text>
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {(passengers.length * (bus?.fare || 400)).toLocaleString()} {t('dashboard.rwf')}
              </Text>
            </View>
          </View>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  tripStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
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
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
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
  busInfo: {
    gap: 16,
  },
  busDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  busDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  busDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scheduleCard: {
    borderRadius: 10,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scheduleRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  scheduleStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scheduleStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
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
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  schedulesList: {
    gap: 12,
  },
  scheduleItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleItemTime: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scheduleDirection: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scheduleDirectionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  scheduleItemRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});