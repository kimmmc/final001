import { Bus, BusStop, Route } from '@/types/bus';

// Real Rwanda bus route data
export const RWANDA_BUS_ROUTES = [
  {
    route: '302',
    destination: 'Downtown / CBD',
    direction: '↔ Kimironko',
    fare: 426,
    schedule: '05:00–23:00',
    color: '#16697a',
  },
  {
    route: '305',
    destination: 'Nyabugogo Bus Park',
    direction: '↔ Kimironko',
    fare: 543,
    schedule: '05:00–23:00',
    color: '#52796f',
  },
  {
    route: '309',
    destination: 'Kinyinya Terminal',
    direction: '↔ Kimironko',
    fare: 319,
    schedule: '05:00–23:00',
    color: '#16697a',
  },
  {
    route: '316',
    destination: 'Musave via Zindiro',
    direction: '↔ Kimironko',
    fare: 274,
    schedule: '05:00–23:00',
    color: '#52796f',
  },
  {
    route: '318',
    destination: 'Batsinda Terminal',
    direction: '↔ Kimironko',
    fare: 369,
    schedule: '05:00–23:00',
    color: '#16697a',
  },
  {
    route: '322',
    destination: 'Masaka Terminal',
    direction: '↔ Kimironko',
    fare: 426,
    schedule: '05:00–23:00',
    color: '#52796f',
  },
  {
    route: '325',
    destination: 'Kabuga Bus Park',
    direction: '↔ Kimironko',
    fare: 504,
    schedule: '05:00–23:00',
    color: '#16697a',
  },
  {
    route: '314',
    destination: 'Nyabugogo Bus Park',
    direction: '↔ Kimironko (alt.)',
    fare: 504,
    schedule: '05:00–23:00',
    color: '#52796f',
  },
];

// Key locations in Kigali
export const KIGALI_LOCATIONS = {
  KIMIRONKO: { latitude: -1.9441, longitude: 30.1056, name: 'Kimironko' },
  KICUKIRO: { latitude: -1.9706, longitude: 30.1044, name: 'Kicukiro' },
  DOWNTOWN: { latitude: -1.9441, longitude: 30.0619, name: 'Downtown/CBD' },
  NYABUGOGO: { latitude: -1.9378, longitude: 30.0434, name: 'Nyabugogo Bus Park' },
  KINYINYA: { latitude: -1.9167, longitude: 30.1167, name: 'Kinyinya Terminal' },
  MUSAVE: { latitude: -1.9500, longitude: 30.0800, name: 'Musave' },
  BATSINDA: { latitude: -1.9800, longitude: 30.1200, name: 'Batsinda Terminal' },
  MASAKA: { latitude: -2.0000, longitude: 30.1000, name: 'Masaka Terminal' },
  KABUGA: { latitude: -1.9300, longitude: 30.1400, name: 'Kabuga Bus Park' },
};

export const busStops: BusStop[] = Object.entries(KIGALI_LOCATIONS).map(([key, location]) => ({
  id: key.toLowerCase(),
  name: location.name,
  location: { latitude: location.latitude, longitude: location.longitude },
  routes: RWANDA_BUS_ROUTES
    .filter(route => 
      route.destination.toLowerCase().includes(location.name.toLowerCase()) ||
      route.direction.toLowerCase().includes(location.name.toLowerCase())
    )
    .map(route => route.route),
}));

export const routes: Route[] = RWANDA_BUS_ROUTES.map(routeData => {
  const startLocation = KIGALI_LOCATIONS.KIMIRONKO;
  const endLocationKey = Object.keys(KIGALI_LOCATIONS).find(key => 
    routeData.destination.toLowerCase().includes(KIGALI_LOCATIONS[key as keyof typeof KIGALI_LOCATIONS].name.toLowerCase())
  );
  const endLocation = endLocationKey ? KIGALI_LOCATIONS[endLocationKey as keyof typeof KIGALI_LOCATIONS] : KIGALI_LOCATIONS.DOWNTOWN;

  return {
    id: routeData.route,
    name: `${routeData.route} - ${routeData.destination}`,
    stops: [
      {
        id: 'kimironko',
        name: startLocation.name,
        location: { latitude: startLocation.latitude, longitude: startLocation.longitude },
        routes: [routeData.route],
      },
      {
        id: endLocationKey?.toLowerCase() || 'downtown',
        name: endLocation.name,
        location: { latitude: endLocation.latitude, longitude: endLocation.longitude },
        routes: [routeData.route],
      },
    ],
    color: routeData.color,
    fare: routeData.fare,
    schedule: routeData.schedule,
  };
});

export const generateRealisticBuses = (userLocation?: { latitude: number; longitude: number }): Bus[] => {
  const buses: Bus[] = [];
  
  RWANDA_BUS_ROUTES.forEach((routeData, index) => {
    // Generate 2-4 buses per route
    const busCount = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < busCount; i++) {
      const startLocation = KIGALI_LOCATIONS.KIMIRONKO;
      const endLocationKey = Object.keys(KIGALI_LOCATIONS).find(key => 
        routeData.destination.toLowerCase().includes(KIGALI_LOCATIONS[key as keyof typeof KIGALI_LOCATIONS].name.toLowerCase())
      );
      const endLocation = endLocationKey ? KIGALI_LOCATIONS[endLocationKey as keyof typeof KIGALI_LOCATIONS] : KIGALI_LOCATIONS.DOWNTOWN;
      
      // Simulate bus position along the route
      const progress = Math.random();
      const currentLat = startLocation.latitude + (endLocation.latitude - startLocation.latitude) * progress;
      const currentLng = startLocation.longitude + (endLocation.longitude - startLocation.longitude) * progress;
      
      // Calculate ETA based on distance from user location if available
      let eta = Math.floor(Math.random() * 25) + 5; // Default 5-30 minutes
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          currentLat,
          currentLng
        );
        // Estimate ETA based on distance (assuming 20 km/h average speed in city)
        eta = Math.max(Math.floor(distance * 3), 2); // Minimum 2 minutes
      }
      
      // Determine next stop
      const isGoingToEnd = progress < 0.5;
      const nextStop = isGoingToEnd ? endLocation.name : startLocation.name;
      
      buses.push({
        id: `${routeData.route}_${i}`,
        route: `Route ${routeData.route}`,
        destination: routeData.destination,
        currentLocation: {
          latitude: currentLat + (Math.random() - 0.5) * 0.005, // Add some randomness
          longitude: currentLng + (Math.random() - 0.5) * 0.005,
        },
        nextStop,
        eta,
        capacity: 30,
        currentPassengers: Math.floor(Math.random() * 25),
        isActive: Math.random() > 0.15, // 85% active
        interested: Math.floor(Math.random() * 15),
        fare: routeData.fare,
        schedule: routeData.schedule,
      });
    }
  });
  
  return buses.sort((a, b) => a.eta - b.eta); // Sort by ETA
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

export const findNearestBuses = (
  userLocation: { latitude: number; longitude: number },
  buses: Bus[],
  maxDistance: number = 5 // km
): Bus[] => {
  return buses
    .map(bus => ({
      ...bus,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        bus.currentLocation.latitude,
        bus.currentLocation.longitude
      ),
    }))
    .filter(bus => bus.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

export const getRecommendedRoutes = (
  userLocation: { latitude: number; longitude: number }
): typeof RWANDA_BUS_ROUTES => {
  // Find the closest major location to user
  const distances = Object.entries(KIGALI_LOCATIONS).map(([key, location]) => ({
    key,
    location,
    distance: calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    ),
  }));
  
  const nearestLocation = distances.sort((a, b) => a.distance - b.distance)[0];
  
  // Return routes that serve the nearest location
  return RWANDA_BUS_ROUTES.filter(route =>
    route.destination.toLowerCase().includes(nearestLocation.location.name.toLowerCase()) ||
    route.direction.toLowerCase().includes(nearestLocation.location.name.toLowerCase())
  );
};