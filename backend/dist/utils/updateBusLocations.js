"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBusLocations = void 0;
const Bus_1 = __importDefault(require("../models/Bus"));
const RWANDA_LOCATIONS = [
    { name: 'Kimironko Market', latitude: -1.9441, longitude: 30.1056 },
    { name: 'Downtown/CBD', latitude: -1.9441, longitude: 30.0619 },
    { name: 'Nyabugogo Bus Park', latitude: -1.9378, longitude: 30.0434 },
    { name: 'Kinyinya Terminal', latitude: -1.9167, longitude: 30.1167 },
    { name: 'Musave', latitude: -1.9500, longitude: 30.0800 },
    { name: 'Batsinda Terminal', latitude: -1.9800, longitude: 30.1200 },
    { name: 'Remera', latitude: -1.9578, longitude: 30.1086 },
    { name: 'Kicukiro Center', latitude: -1.9706, longitude: 30.1044 },
    { name: 'Masaka Terminal', latitude: -2.0000, longitude: 30.1000 },
    { name: 'Kabuga Bus Park', latitude: -1.9300, longitude: 30.1400 },
];
const updateBusLocations = async () => {
    try {
        console.log('Updating bus locations...');
        const buses = await Bus_1.default.find({ isActive: true });
        console.log(`Found ${buses.length} active buses to update`);
        for (const bus of buses) {
            if (bus.currentLocation.latitude &&
                bus.currentLocation.longitude &&
                bus.currentLocation.latitude > -3 && bus.currentLocation.latitude < 0 &&
                bus.currentLocation.longitude > 29 && bus.currentLocation.longitude < 31 &&
                bus.currentLocation.lastUpdated &&
                (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 24 * 60 * 60 * 1000) {
                console.log(`Skipping bus ${bus.plateNumber} - already has recent Rwanda location`);
                continue;
            }
            const location = RWANDA_LOCATIONS[Math.floor(Math.random() * RWANDA_LOCATIONS.length)];
            const latVariation = (Math.random() - 0.5) * 0.02;
            const lngVariation = (Math.random() - 0.5) * 0.02;
            const newLocation = {
                latitude: location.latitude + latVariation,
                longitude: location.longitude + lngVariation,
                lastUpdated: new Date(),
                speed: Math.random() * 40,
                heading: Math.random() * 360,
            };
            await Bus_1.default.findByIdAndUpdate(bus._id, {
                currentLocation: newLocation,
                isOnline: Math.random() > 0.3,
            });
            console.log(`Updated bus ${bus.plateNumber} to location: ${newLocation.latitude}, ${newLocation.longitude}`);
        }
        console.log('Bus location update completed!');
    }
    catch (error) {
        console.error('Error updating bus locations:', error);
        throw error;
    }
};
exports.updateBusLocations = updateBusLocations;
