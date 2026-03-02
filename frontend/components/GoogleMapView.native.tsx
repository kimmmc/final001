import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/contexts/ThemeContext';
import { Bus } from '@/types/bus';
import { Navigation } from 'lucide-react-native';

interface GoogleMapViewProps {
  buses: Bus[];
  userLocation?: { latitude: number; longitude: number };
  onBusPress?: (bus: Bus) => void;
}

const { width, height } = Dimensions.get('window');

// Default location (Kigali, Rwanda)
const DEFAULT_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function GoogleMapView({ buses, userLocation, onBusPress }: GoogleMapViewProps) {
  const { theme } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [region, setRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userLocation]);

  // Native map implementation using react-native-maps
  return (
    <View style={[styles.nativeMapContainer, { backgroundColor: theme.surface }]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        onMapReady={() => setMapLoaded(true)}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={[styles.userLocationMarker, { backgroundColor: '#4285f4' }]}>
              <Navigation size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Bus markers */}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={bus.currentLocation}
            title={`${bus.route}`}
            description={`${bus.destination}${bus.directionDisplay ? ` - ${bus.directionDisplay}` : ''} - ${bus.eta}min ETA`}
            onPress={() => onBusPress?.(bus)}
          >
            <View style={[
              styles.busMarker,
              {
                backgroundColor: bus.isActive ? theme.primary : theme.textSecondary,
                borderColor: theme.background,
              }
            ]}>
              <Text style={[styles.busMarkerText, { color: theme.background }]}>
                🚌
              </Text>
              <Text style={[styles.busMarkerEta, { color: theme.background }]}>
                {bus.eta}m
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>



      <View style={[styles.mapStats, { backgroundColor: theme.surface + 'E6' }]}>
        <Text style={[styles.statsText, { color: theme.text }]}>
          📍 {buses.filter(b => b.isActive).length} active buses
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          🗺️ Google Maps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  nativeMapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  map: {
    flex: 1,
  },

  userLocationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  busMarker: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  busMarkerText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  busMarkerEta: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginTop: 1,
  },
  mapStats: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  mapInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  mapInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});