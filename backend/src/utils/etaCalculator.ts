interface Location {
  latitude: number;
  longitude: number;
}

interface PickupPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}

export class ETACalculator {
  
  // Calculate distance between two points using Haversine formula
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; 
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Calculate ETA to a specific pickup point
  static calculateETA(
    busLocation: BusLocation,
    pickupPoint: PickupPoint,
    averageSpeed: number = 30 
  ): number {
    const distance = this.calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      pickupPoint.latitude,
      pickupPoint.longitude
    );

    // Use bus speed if available and reasonable, otherwise use average speed
    const speed = busLocation.speed > 0 && busLocation.speed < 100 ? busLocation.speed : averageSpeed;
    
    // Calculate time in minutes
    const timeInHours = distance / speed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    return Math.max(1, timeInMinutes); // Minimum 1 minute
  }

  // Find nearest pickup point to bus location
  static findNearestPickupPoint(
    busLocation: BusLocation,
    pickupPoints: PickupPoint[]
  ): { pickupPoint: PickupPoint; distance: number; eta: number } | null {
    if (!pickupPoints.length) return null;

    let nearest = pickupPoints[0];
    let minDistance = this.calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      nearest.latitude,
      nearest.longitude
    );

    for (const point of pickupPoints) {
      const distance = this.calculateDistance(
        busLocation.latitude,
        busLocation.longitude,
        point.latitude,
        point.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    const eta = this.calculateETA(busLocation, nearest);
    
    return {
      pickupPoint: nearest,
      distance: minDistance,
      eta
    };
  }

  // Calculate ETA to user's location or nearest pickup point
  static calculateETAForUser(
    busLocation: BusLocation,
    userLocation: Location | null,
    pickupPoints: PickupPoint[],
    selectedPickupPointId?: string
  ): { eta: number; pickupPoint: PickupPoint | null; distance: number } {
    // If user selected a specific pickup point, use that
    if (selectedPickupPointId) {
      const selectedPoint = pickupPoints.find(p => p.id === selectedPickupPointId);
      if (selectedPoint) {
        const distance = this.calculateDistance(
          busLocation.latitude,
          busLocation.longitude,
          selectedPoint.latitude,
          selectedPoint.longitude
        );
        const eta = this.calculateETA(busLocation, selectedPoint);
        return { eta, pickupPoint: selectedPoint, distance };
      }
    }

    // If user location is available, find nearest pickup point to user
    if (userLocation) {
      const nearestToUser = this.findNearestPickupPoint(
        { ...busLocation, latitude: userLocation.latitude, longitude: userLocation.longitude },
        pickupPoints
      );
      
      if (nearestToUser) {
        const distance = this.calculateDistance(
          busLocation.latitude,
          busLocation.longitude,
          nearestToUser.pickupPoint.latitude,
          nearestToUser.pickupPoint.longitude
        );
        const eta = this.calculateETA(busLocation, nearestToUser.pickupPoint);
        return { eta, pickupPoint: nearestToUser.pickupPoint, distance };
      }
    }

    // Fallback: find nearest pickup point to bus
    const nearestToBus = this.findNearestPickupPoint(busLocation, pickupPoints);
    if (nearestToBus) {
      return {
        eta: nearestToBus.eta,
        pickupPoint: nearestToBus.pickupPoint,
        distance: nearestToBus.distance
      };
    }

    // Default fallback
    return { eta: 15, pickupPoint: null, distance: 0 };
  }

  // Calculate ETA for all pickup points on a route
  static calculateETAsForRoute(
    busLocation: BusLocation,
    pickupPoints: PickupPoint[]
  ): Array<{ pickupPoint: PickupPoint; eta: number; distance: number }> {
    return pickupPoints
      .sort((a, b) => a.order - b.order) // Sort by order
      .map(point => {
        const distance = this.calculateDistance(
          busLocation.latitude,
          busLocation.longitude,
          point.latitude,
          point.longitude
        );
        const eta = this.calculateETA(busLocation, point);
        return { pickupPoint: point, eta, distance };
      });
  }
} 