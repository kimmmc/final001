import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useBuses } from '@/hooks/useBuses';
import { useState, useEffect } from 'react';
import { Bus as BusType } from '@/types/bus';
import { Navigation, MapPin, CircleAlert as AlertCircle, BarChart3, Clock, Cloud, Calendar, Map as MapIcon, Users, Zap, ChevronDown } from 'lucide-react-native';
import { GoogleMapView } from '@/components/GoogleMapView';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { apiService } from '@/services/api';

export default function Map() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { location, loading: locationLoading, requestLocation, hasPermission, error } = useLocation();
  const { buses, loading: busesLoading, error: busesError, refetch } = useBuses(location || undefined, false); // false = all buses for map
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Prediction state
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  
  // Selection modals state
  const [showDayModal, setShowDayModal] = useState(false);
  const [showRoadModal, setShowRoadModal] = useState(false);
  const [showDensityModal, setShowDensityModal] = useState(false);
  const [showRainfallModal, setShowRainfallModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  
  // Debug modal states
  console.log('Modal states:', {
    showDayModal,
    showRoadModal,
    showDensityModal,
    showRainfallModal,
    showHolidayModal
  });
  
  // Prediction form state
  const [predictionForm, setPredictionForm] = useState({
    hour: 8,
    dayOfWeek: '',
    roadName: '',
    populationDensity: '',
    rainfall: '',
    publicHoliday: ''
  });

  useEffect(() => {
    if (!hasPermission && !location) {
      setShowLocationModal(true);
    }
  }, [hasPermission, location]);

  const handleBusPress = (bus: BusType) => {
    setSelectedBus(bus);
  };

  const handleLocationRequest = async () => {
    setShowLocationModal(false);
    await requestLocation();
  };

  const handlePredictionSubmit = async () => {
    // Validate form
    if (!predictionForm.dayOfWeek || !predictionForm.roadName || 
        !predictionForm.populationDensity || !predictionForm.rainfall || 
        !predictionForm.publicHoliday) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setPredictionLoading(true);
    
    try {
      // Use the API service to call the prediction endpoint
      const result = await apiService.predictTraffic({
        Hour: predictionForm.hour,
        Day_of_Week: predictionForm.dayOfWeek,
        Road_Name: predictionForm.roadName,
        Population_Density: predictionForm.populationDensity,
        Rainfall: predictionForm.rainfall,
        Public_Holiday: predictionForm.publicHoliday
      });
      
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Failed to get traffic prediction. Please try again.');
    } finally {
      setPredictionLoading(false);
    }
  };

  const getCongestionIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🔴';
      default:
        return '🟡';
    }
  };

  const getCongestionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  // Custom selection function for Android compatibility
  const showSelectionDialog = (title: string, options: string[], onSelect: (value: string) => void) => {
    if (Platform.OS === 'android') {
      // For Android, use a custom modal approach since Alert has limitations
      Alert.alert(
        title,
        'Select an option:',
        options.map(option => ({
          text: option,
          onPress: () => onSelect(option)
        })).concat([
          { text: 'Cancel', style: 'cancel' as const }
        ])
      );
    } else {
      // For iOS, use the standard Alert approach
      Alert.alert(
        title,
        'Choose an option',
        options.map(option => ({
          text: option,
          onPress: () => onSelect(option)
        })).concat([
          { text: 'Cancel', style: 'cancel' as const }
        ])
      );
    }
  };

  if (busesError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {busesError}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={refetch}
          >
            <Text style={[styles.retryButtonText, { color: theme.background }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('map')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {`${buses.length} buses tracked`}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.predictionButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              console.log('Prediction button pressed');
              setShowPredictionModal(true);
            }}
          >
            <BarChart3 size={16} color="#FFFFFF" />
            <Text style={[styles.predictionButtonText, { color: '#FFFFFF' }]}>
              Predict
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.locationButton, { backgroundColor: location ? theme.primary + '20' : theme.error + '20' }]}
            onPress={requestLocation}
            disabled={locationLoading}
          >
            {location ? (
              <>
                <Navigation size={16} color={theme.primary} />
                <Text style={[styles.locationButtonText, { color: theme.primary }]}>
                  Located
                </Text>
              </>
            ) : (
              <>
                <AlertCircle size={16} color={theme.error} />
                <Text style={[styles.locationButtonText, { color: theme.error }]}>
                  Enable
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.error + '20' }]}>
          <AlertCircle size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
        </View>
      )}

      <GoogleMapView
        buses={buses}
        userLocation={location || undefined}
        onBusPress={handleBusPress}
      />

      {selectedBus && (
        <View style={[styles.busDetails, { backgroundColor: theme.surface }]}>
          <View style={styles.busDetailsHeader}>
            <View>
              <Text style={[styles.busDetailsRoute, { color: theme.text }]}>
                {selectedBus.route}
              </Text>
              <Text style={[styles.busDetailsPlate, { color: theme.primary }]}>
                {selectedBus.plateNumber}
              </Text>
              <Text style={[styles.busDetailsDestination, { color: theme.textSecondary }]}>
                {selectedBus.destination}
              </Text>
              {/* Direction display */}
              {selectedBus.directionDisplay && (
                <View style={styles.directionContainer}>
                  <Navigation size={12} color={theme.primary} />
                  <Text style={[styles.busDetailsDirection, { color: theme.primary, marginLeft: 4 }]}>
                    {selectedBus.directionDisplay}
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedBus(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.busDetailsContent}>

            
            <View style={styles.busDetailItem}>
              <Navigation size={16} color={theme.primary} />
              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                ETA:
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.text }]}>
                {selectedBus.eta} minutes
              </Text>
            </View>
            
            {selectedBus.fare && (
              <View style={styles.busDetailItem}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Fare:
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.primary }]}>
                  {selectedBus.fare} RWF
                </Text>
              </View>
            )}
            
            {selectedBus.distance && (
              <View style={styles.busDetailItem}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Distance:
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {selectedBus.distance.toFixed(1)} km
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <LocationPermissionModal
        visible={showLocationModal}
        onRequestPermission={handleLocationRequest}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Traffic Prediction Modal */}
      <Modal
        visible={showPredictionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Traffic Prediction
            </Text>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => {
                setShowPredictionModal(false);
                // Don't reset the result when closing, only when starting a new prediction
              }}
            >
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {!predictionResult ? (
              <View>
                {/* Time Settings */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Clock size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Time Settings
                    </Text>
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={styles.formField}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                        Hour of Day
                      </Text>
                      <View style={[styles.numberInput, { borderColor: theme.border, backgroundColor: theme.background }]}>
                        <TextInput
                          style={[styles.numberInputText, { color: theme.text }]}
                          value={predictionForm.hour.toString()}
                          onChangeText={(text) => setPredictionForm(prev => ({ ...prev, hour: parseInt(text) || 0 }))}
                          keyboardType="numeric"
                          placeholder="8"
                          placeholderTextColor={theme.textSecondary}
                        />
                        <Text style={[styles.numberInputSuffix, { color: theme.textSecondary }]}>
                          :00
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.formField}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                        Day of Week
                      </Text>
                      <Pressable
                        style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => {
                          console.log('Day button pressed');
                          showSelectionDialog(
                            'Select Day',
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            (day) => setPredictionForm(prev => ({ ...prev, dayOfWeek: day }))
                          );
                        }}
                      >
                        <Text style={[styles.selectButtonText, { color: predictionForm.dayOfWeek ? theme.text : theme.textSecondary }]}>
                          {predictionForm.dayOfWeek || ''}
                        </Text>
                        <ChevronDown size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Road Settings */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <MapIcon size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Road Settings
                    </Text>
                  </View>
                  
                  <View style={styles.formField}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                      Road Name
                    </Text>
                    <Pressable
                      style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                      onPress={() => {
                        console.log('Road button pressed');
                        showSelectionDialog(
                          'Select Road',
                          ['KG 11 Ave', 'KK 15 Rd', 'KN 1 Rd', 'KN 3 Rd', 'RN1'],
                          (road) => setPredictionForm(prev => ({ ...prev, roadName: road }))
                        );
                      }}
                    >
                                              <Text style={[styles.selectButtonText, { color: predictionForm.roadName ? theme.text : theme.textSecondary }]}>
                          {predictionForm.roadName || ''}
                        </Text>
                      <ChevronDown size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                {/* Environmental Factors */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Cloud size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Environmental Factors
                    </Text>
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={styles.formField}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                        Population Density
                      </Text>
                      <Pressable
                        style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => {
                          console.log('Density button pressed');
                          showSelectionDialog(
                            'Select Population Density',
                            ['Medium', 'High'],
                            (density) => setPredictionForm(prev => ({ ...prev, populationDensity: density }))
                          );
                        }}
                      >
                        <Text style={[styles.selectButtonText, { color: predictionForm.populationDensity ? theme.text : theme.textSecondary }]}>
                          {predictionForm.populationDensity || ''}
                        </Text>
                        <ChevronDown size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                    
                    <View style={styles.formField}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                        Rainfall
                      </Text>
                      <Pressable
                        style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => {
                          console.log('Rainfall button pressed');
                          showSelectionDialog(
                            'Select Rainfall',
                            ['No', 'Yes'],
                            (rainfall) => setPredictionForm(prev => ({ ...prev, rainfall }))
                          );
                        }}
                      >
                        <Text style={[styles.selectButtonText, { color: predictionForm.rainfall ? theme.text : theme.textSecondary }]}>
                          {predictionForm.rainfall || ''}
                        </Text>
                        <ChevronDown size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Special Conditions */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Calendar size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Special Conditions
                    </Text>
                  </View>
                  
                  <View style={styles.formField}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                      Public Holiday
                    </Text>
                    <Pressable
                      style={[styles.selectButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                      onPress={() => {
                        console.log('Holiday button pressed');
                        showSelectionDialog(
                          'Select Public Holiday',
                          ['No', 'Yes'],
                          (holiday) => setPredictionForm(prev => ({ ...prev, publicHoliday: holiday }))
                        );
                      }}
                    >
                                              <Text style={[styles.selectButtonText, { color: predictionForm.publicHoliday ? theme.text : theme.textSecondary }]}>
                          {predictionForm.publicHoliday || ''}
                        </Text>
                      <ChevronDown size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={[styles.submitButton, { backgroundColor: theme.primary }]}
                  onPress={handlePredictionSubmit}
                  disabled={predictionLoading}
                >
                  {predictionLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={[styles.loadingSpinner, { borderColor: '#FFFFFF', borderTopColor: 'transparent' }]} />
                      <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                        Analyzing...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Zap size={20} color="#FFFFFF" />
                      <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                        Generate Prediction
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              <View>
                {/* Prediction Results */}
                <View style={[styles.resultsSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <BarChart3 size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Prediction Results
                    </Text>
                  </View>
                  
                  <View style={styles.congestionIndicator}>
                    <View style={[styles.congestionIconContainer, { backgroundColor: getCongestionColor(predictionResult.prediction) + '20' }]}>
                      <Text style={styles.congestionIcon}>
                        {getCongestionIcon(predictionResult.prediction)}
                      </Text>
                    </View>
                    <View style={styles.congestionText}>
                      <Text style={[styles.congestionLevel, { color: getCongestionColor(predictionResult.prediction) }]}>
                        {predictionResult.prediction} Traffic
                      </Text>
                      <Text style={[styles.congestionDescription, { color: theme.textSecondary }]}>
                        {predictionResult.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.confidenceMeter}>
                    <View style={styles.confidenceHeader}>
                      <Text style={[styles.confidenceLabel, { color: theme.textSecondary }]}>
                        Confidence Level
                      </Text>
                      <Text style={[styles.confidencePercentage, { color: getCongestionColor(predictionResult.prediction) }]}>
                        {predictionResult.confidence}%
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor: getCongestionColor(predictionResult.prediction),
                            width: `${predictionResult.confidence}%`
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>

                {/* Analysis Details */}
                <View style={[styles.detailsSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <BarChart3 size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Analysis Details
                    </Text>
                  </View>
                  
                  <View style={styles.detailsGrid}>
                    <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                      <Text style={[styles.detailCardLabel, { color: theme.textSecondary }]}>
                        Time
                      </Text>
                      <Text style={[styles.detailCardValue, { color: theme.text }]}>
                        {predictionForm.hour}:00
                      </Text>
                    </View>
                    <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                      <Text style={[styles.detailCardLabel, { color: theme.textSecondary }]}>
                        Road
                      </Text>
                      <Text style={[styles.detailCardValue, { color: theme.text }]}>
                        {predictionForm.roadName}
                      </Text>
                    </View>
                    <View style={[styles.detailCard, { backgroundColor: theme.background }]}>
                      <Text style={[styles.detailCardLabel, { color: theme.textSecondary }]}>
                        Conditions
                      </Text>
                      <Text style={[styles.detailCardValue, { color: theme.text }]}>
                        {predictionForm.rainfall === 'Yes' ? 'Rainy' : 'Clear'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recommendations */}
                <View style={[styles.recommendationsSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Zap size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Recommendations
                    </Text>
                  </View>
                  
                  <View style={styles.recommendationsList}>
                    {predictionResult.recommendations.map((rec: string, index: number) => (
                      <View key={index} style={[styles.recommendationCard, { backgroundColor: theme.background }]}>
                        <View style={[styles.recommendationBullet, { backgroundColor: theme.primary }]}>
                          <Text style={[styles.recommendationBulletText, { color: '#FFFFFF' }]}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={[styles.recommendationText, { color: theme.text }]}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Pressable
                  style={[styles.newPredictionButton, { backgroundColor: theme.primary }]}
                  onPress={() => setPredictionResult(null)}
                >
                  <Text style={[styles.newPredictionButtonText, { color: '#FFFFFF' }]}>
                    New Prediction
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Day Selection Modal */}
      <Modal
        visible={showDayModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onShow={() => console.log('Day modal shown')}
        onRequestClose={() => {
          console.log('Day modal close requested');
          setShowDayModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.selectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionTitle, { color: theme.text }]}>
                Select Day of Week
              </Text>
              <Pressable 
                style={styles.selectionCloseButton}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={[styles.closeModalText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <Pressable
                  key={day}
                  style={[
                    styles.selectionItem,
                    { backgroundColor: predictionForm.dayOfWeek === day ? theme.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    console.log('Selecting day:', day);
                    setPredictionForm(prev => ({ ...prev, dayOfWeek: day }));
                    setShowDayModal(false);
                  }}
                >
                  <Text style={[
                    styles.selectionItemText,
                    { color: predictionForm.dayOfWeek === day ? theme.primary : theme.text }
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Road Selection Modal */}
      <Modal
        visible={showRoadModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.selectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionTitle, { color: theme.text }]}>
                Select Road
              </Text>
              <Pressable 
                style={styles.selectionCloseButton}
                onPress={() => setShowRoadModal(false)}
              >
                <Text style={[styles.closeModalText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
              {['KG 11 Ave', 'KK 15 Rd', 'KN 1 Rd', 'KN 3 Rd', 'RN1'].map((road) => (
                <Pressable
                  key={road}
                  style={[
                    styles.selectionItem,
                    { backgroundColor: predictionForm.roadName === road ? theme.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    console.log('Selecting road:', road);
                    setPredictionForm(prev => ({ ...prev, roadName: road }));
                    setShowRoadModal(false);
                  }}
                >
                  <Text style={[
                    styles.selectionItemText,
                    { color: predictionForm.roadName === road ? theme.primary : theme.text }
                  ]}>
                    {road}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Density Selection Modal */}
      <Modal
        visible={showDensityModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.selectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionTitle, { color: theme.text }]}>
                Select Population Density
              </Text>
              <Pressable 
                style={styles.selectionCloseButton}
                onPress={() => setShowDensityModal(false)}
              >
                <Text style={[styles.closeModalText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
              {['Medium', 'High'].map((density) => (
                <Pressable
                  key={density}
                  style={[
                    styles.selectionItem,
                    { backgroundColor: predictionForm.populationDensity === density ? theme.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    console.log('Selecting density:', density);
                    setPredictionForm(prev => ({ ...prev, populationDensity: density }));
                    setShowDensityModal(false);
                  }}
                >
                  <Text style={[
                    styles.selectionItemText,
                    { color: predictionForm.populationDensity === density ? theme.primary : theme.text }
                  ]}>
                    {density}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rainfall Selection Modal */}
      <Modal
        visible={showRainfallModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.selectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionTitle, { color: theme.text }]}>
                Select Rainfall Condition
              </Text>
              <Pressable 
                style={styles.selectionCloseButton}
                onPress={() => setShowRainfallModal(false)}
              >
                <Text style={[styles.closeModalText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
              {['No', 'Yes'].map((rainfall) => (
                <Pressable
                  key={rainfall}
                  style={[
                    styles.selectionItem,
                    { backgroundColor: predictionForm.rainfall === rainfall ? theme.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    console.log('Selecting rainfall:', rainfall);
                    setPredictionForm(prev => ({ ...prev, rainfall }));
                    setShowRainfallModal(false);
                  }}
                >
                  <Text style={[
                    styles.selectionItemText,
                    { color: predictionForm.rainfall === rainfall ? theme.primary : theme.text }
                  ]}>
                    {rainfall}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Holiday Selection Modal */}
      <Modal
        visible={showHolidayModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.selectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionTitle, { color: theme.text }]}>
                Select Public Holiday
              </Text>
              <Pressable 
                style={styles.selectionCloseButton}
                onPress={() => setShowHolidayModal(false)}
              >
                <Text style={[styles.closeModalText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
              {['No', 'Yes'].map((holiday) => (
                <Pressable
                  key={holiday}
                  style={[
                    styles.selectionItem,
                    { backgroundColor: predictionForm.publicHoliday === holiday ? theme.primary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    console.log('Selecting holiday:', holiday);
                    setPredictionForm(prev => ({ ...prev, publicHoliday: holiday }));
                    setShowHolidayModal(false);
                  }}
                >
                  <Text style={[
                    styles.selectionItemText,
                    { color: predictionForm.publicHoliday === holiday ? theme.primary : theme.text }
                  ]}>
                    {holiday}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  busDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  busDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  busDetailsRoute: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  busDetailsPlate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  busDetailsDestination: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  busDetailsDirection: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  busDetailsContent: {
    gap: 12,
  },
  busDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  busDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  predictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  predictionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  formSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
    color: '#333333',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    color: '#666666',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberInputText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    color: '#333333',
  },
  numberInputSuffix: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  selectInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
    backgroundColor: '#ffffff',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    color: '#333333',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#16697a',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  resultsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  congestionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  congestionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  congestionIcon: {
    fontSize: 24,
  },
  congestionText: {
    flex: 1,
  },
  congestionLevel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  congestionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  confidenceMeter: {
    marginTop: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  confidencePercentage: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceScore: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  detailsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailItem: {
    flex: 1,
    marginRight: 10,
  },
  detailCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailCardLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailCardValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  recommendationsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationsList: {
    gap: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationCard: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recommendationBulletText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  recommendationText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 18,
  },
  newPredictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  newPredictionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  selectionModal: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '70%',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  selectionCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 36,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  selectionList: {
    maxHeight: '60%',
  },
  selectionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 50,
    justifyContent: 'center',
  },
  selectionItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  directionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
});