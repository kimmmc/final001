import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Bus } from '@/types/bus';
import { MapPin } from 'lucide-react-native';

interface GoogleMapViewProps {
    buses: Bus[];
    userLocation?: { latitude: number; longitude: number };
    onBusPress?: (bus: Bus) => void;
}

export function GoogleMapView({ }: GoogleMapViewProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.webMapContainer, { backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: theme.text }}>Google Maps is currently only supported on mobile devices.</Text>
            <MapPin size={48} color={theme.textSecondary} style={{ marginTop: 16 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    webMapContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 16,
    }
});
