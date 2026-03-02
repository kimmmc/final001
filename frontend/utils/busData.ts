import { Bus, BusStop, Route } from '@/types/bus';

// Kimironko and Kicukiro area coordinates
export const KIMIRONKO_CENTER = {
  latitude: -1.9441,
  longitude: 30.1056,
};

export const KICUKIRO_CENTER = {
  latitude: -1.9706,
  longitude: 30.1044,
};

export const busStops: BusStop[] = [
  {
    id: '1',
    name: 'Kimironko Market',
    location: { latitude: -1.9441, longitude: 30.1056 },
    routes: ['101', '102', '103'],
  },
  {
    id: '2',
    name: 'Kicukiro Center',
    location: { latitude: -1.9706, longitude: 30.1044 },
    routes: ['201', '202', '203'],
  },
  {
    id: '3',
    name: 'Nyamirambo',
    location: { latitude: -1.9536, longitude: 30.0445 },
    routes: ['101', '201'],
  },
  {
    id: '4',
    name: 'Town Center',
    location: { latitude: -1.9441, longitude: 30.0619 },
    routes: ['101', '102', '201', '202'],
  },
  {
    id: '5',
    name: 'Remera',
    location: { latitude: -1.9578, longitude: 30.1086 },
    routes: ['102', '103'],
  },
];

export const routes: Route[] = [
  {
    id: '101',
    name: 'Kimironko - Town - Nyamirambo',
    stops: [busStops[0], busStops[3], busStops[2]],
    color: '#16697a',
  },
  {
    id: '102',
    name: 'Kimironko - Town - Remera',
    stops: [busStops[0], busStops[3], busStops[4]],
    color: '#52796f',
  },
  {
    id: '201',
    name: 'Kicukiro - Town - Nyamirambo',
    stops: [busStops[1], busStops[3], busStops[2]],
    color: '#16697a',
  },
  {
    id: '202',
    name: 'Kicukiro - Town - Remera',
    stops: [busStops[1], busStops[3], busStops[4]],
    color: '#52796f',
  },
];

export const generateMockBuses = (): Bus[] => {
  const buses: Bus[] = [];
  
  // Generate buses for each route
  routes.forEach((route, routeIndex) => {
    for (let i = 0; i < 3; i++) {
      const stopIndex = Math.floor(Math.random() * route.stops.length);
      const stop = route.stops[stopIndex];
      
      buses.push({
        id: `${route.id}_${i}`,
        route: route.name,
        destination: route.stops[route.stops.length - 1].name,
        currentLocation: {
          latitude: stop.location.latitude + (Math.random() - 0.5) * 0.01,
          longitude: stop.location.longitude + (Math.random() - 0.5) * 0.01,
        },
        nextStop: route.stops[(stopIndex + 1) % route.stops.length].name,
        eta: Math.floor(Math.random() * 20) + 5,
        capacity: 30,
        currentPassengers: Math.floor(Math.random() * 25),
        isActive: Math.random() > 0.2,
        interested: Math.floor(Math.random() * 10),
      });
    }
  });
  
  return buses;
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