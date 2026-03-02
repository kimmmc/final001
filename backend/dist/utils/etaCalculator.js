"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETACalculator = void 0;
class ETACalculator {
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    static calculateETA(busLocation, pickupPoint, averageSpeed = 30) {
        const distance = this.calculateDistance(busLocation.latitude, busLocation.longitude, pickupPoint.latitude, pickupPoint.longitude);
        const speed = busLocation.speed > 0 && busLocation.speed < 100 ? busLocation.speed : averageSpeed;
        const timeInHours = distance / speed;
        const timeInMinutes = Math.round(timeInHours * 60);
        return Math.max(1, timeInMinutes);
    }
    static findNearestPickupPoint(busLocation, pickupPoints) {
        if (!pickupPoints.length)
            return null;
        let nearest = pickupPoints[0];
        let minDistance = this.calculateDistance(busLocation.latitude, busLocation.longitude, nearest.latitude, nearest.longitude);
        for (const point of pickupPoints) {
            const distance = this.calculateDistance(busLocation.latitude, busLocation.longitude, point.latitude, point.longitude);
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
    static calculateETAForUser(busLocation, userLocation, pickupPoints, selectedPickupPointId) {
        if (selectedPickupPointId) {
            const selectedPoint = pickupPoints.find(p => p.id === selectedPickupPointId);
            if (selectedPoint) {
                const distance = this.calculateDistance(busLocation.latitude, busLocation.longitude, selectedPoint.latitude, selectedPoint.longitude);
                const eta = this.calculateETA(busLocation, selectedPoint);
                return { eta, pickupPoint: selectedPoint, distance };
            }
        }
        if (userLocation) {
            const nearestToUser = this.findNearestPickupPoint({ ...busLocation, latitude: userLocation.latitude, longitude: userLocation.longitude }, pickupPoints);
            if (nearestToUser) {
                const distance = this.calculateDistance(busLocation.latitude, busLocation.longitude, nearestToUser.pickupPoint.latitude, nearestToUser.pickupPoint.longitude);
                const eta = this.calculateETA(busLocation, nearestToUser.pickupPoint);
                return { eta, pickupPoint: nearestToUser.pickupPoint, distance };
            }
        }
        const nearestToBus = this.findNearestPickupPoint(busLocation, pickupPoints);
        if (nearestToBus) {
            return {
                eta: nearestToBus.eta,
                pickupPoint: nearestToBus.pickupPoint,
                distance: nearestToBus.distance
            };
        }
        return { eta: 15, pickupPoint: null, distance: 0 };
    }
    static calculateETAsForRoute(busLocation, pickupPoints) {
        return pickupPoints
            .sort((a, b) => a.order - b.order)
            .map(point => {
            const distance = this.calculateDistance(busLocation.latitude, busLocation.longitude, point.latitude, point.longitude);
            const eta = this.calculateETA(busLocation, point);
            return { pickupPoint: point, eta, distance };
        });
    }
}
exports.ETACalculator = ETACalculator;
