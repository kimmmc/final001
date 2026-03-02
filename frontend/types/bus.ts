export interface Bus {
  id: string;
  plateNumber: string; // Added plate number
  route: string;
  destination: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  nextStop: string;
  eta: number; // in minutes
  capacity: number;
  currentPassengers: number;
  isActive: boolean;
  isOnline: boolean; // Added online status
  interested: number; // number of people interested
  fare?: number; // in RWF
  schedule?: string;
  distance?: number; // distance from user in km
  scheduleId?: string; // real schedule ObjectId
  pickupPointId?: string; // real pickup point ObjectId
  // Direction information
  currentDirection?: 'outbound' | 'inbound'; // outbound = origin to destination, inbound = destination to origin
  routeOrigin?: string; // Route origin (e.g., "Kimironko")
  routeDestination?: string; // Route destination (e.g., "Kabuga")
  directionDisplay?: string; // Human-readable direction (e.g., "To Kabuga" or "To Kimironko")
}

export interface BusStop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  routes: string[];
}

export interface Route {
  id: string;
  name: string;
  stops: BusStop[];
  color: string;
  fare?: number;
  schedule?: string;
}