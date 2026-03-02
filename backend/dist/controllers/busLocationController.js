"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDriverOnlineStatus = exports.getNearbyBuses = exports.getBusLocationHistory = exports.getAllBusLocations = exports.getBusLocation = exports.updateBusLocation = void 0;
const Bus_1 = __importDefault(require("../models/Bus"));
const BusLocationHistory_1 = __importDefault(require("../models/BusLocationHistory"));
const PickupPoint_1 = __importDefault(require("../models/PickupPoint"));
const socketService_1 = __importDefault(require("../services/socketService"));
const etaCalculator_1 = require("../utils/etaCalculator");
const updateBusLocation = async (req, res) => {
    try {
        const { busId, latitude, longitude, speed = 0, heading = 0, accuracy = 0 } = req.body;
        const driverId = req.user.id;
        const bus = await Bus_1.default.findOne({ _id: busId, driverId });
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found or not assigned to you' });
        }
        const updatedBus = await Bus_1.default.findByIdAndUpdate(busId, {
            currentLocation: {
                latitude,
                longitude,
                lastUpdated: new Date(),
                speed,
                heading,
            },
        }, { new: true }).populate('driverId', 'name email phone')
            .populate('routeId', 'name description');
        const locationHistory = new BusLocationHistory_1.default({
            busId,
            location: { latitude, longitude },
            speed,
            heading,
            accuracy,
        });
        await locationHistory.save();
        socketService_1.default.emitBusLocationUpdate({
            busId,
            latitude,
            longitude,
            speed,
            heading,
            isOnline: updatedBus.isOnline,
        });
        res.json({
            message: 'Location updated successfully',
            bus: updatedBus,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateBusLocation = updateBusLocation;
const getBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        const bus = await Bus_1.default.findById(busId)
            .populate('driverId', 'name email phone')
            .populate('routeId', 'name description');
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        const isLocationRecent = bus.currentLocation.lastUpdated &&
            (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 5 * 60 * 1000;
        res.json({
            bus: {
                id: bus._id,
                plateNumber: bus.plateNumber,
                driver: bus.driverId,
                route: bus.routeId,
                currentLocation: bus.currentLocation,
                isOnline: bus.isOnline && isLocationRecent,
                lastSeen: bus.currentLocation.lastUpdated,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getBusLocation = getBusLocation;
const getAllBusLocations = async (req, res) => {
    try {
        const { routeId, isOnline, userLat, userLng, pickupPointId } = req.query;
        let query = { isActive: true };
        if (routeId)
            query.routeId = routeId;
        const buses = await Bus_1.default.find(query)
            .populate('driverId', 'name email phone')
            .populate('routeId', 'name description');
        const pickupPoints = await PickupPoint_1.default.find({ routeId: routeId || { $exists: true } });
        const busLocations = buses.map(bus => {
            const isLocationRecent = bus.currentLocation.lastUpdated &&
                (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 10 * 60 * 1000;
            const busOnline = bus.isOnline && isLocationRecent;
            let eta = 15;
            let nearestPickupPoint = null;
            let distance = 0;
            if (busOnline && bus.currentLocation.latitude && bus.currentLocation.longitude) {
                const userLocation = userLat && userLng ?
                    { latitude: parseFloat(userLat), longitude: parseFloat(userLng) } : null;
                const routePickupPoints = pickupPoints
                    .filter(p => p.routeId === bus.routeId)
                    .map(p => ({
                    id: p._id.toString(),
                    name: p.name,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    order: p.order
                }));
                const etaResult = etaCalculator_1.ETACalculator.calculateETAForUser({
                    latitude: bus.currentLocation.latitude,
                    longitude: bus.currentLocation.longitude,
                    speed: bus.currentLocation.speed,
                    heading: bus.currentLocation.heading
                }, userLocation, routePickupPoints, pickupPointId);
                eta = etaResult.eta;
                nearestPickupPoint = etaResult.pickupPoint;
                distance = etaResult.distance;
            }
            return {
                id: bus._id,
                plateNumber: bus.plateNumber,
                driver: bus.driverId,
                route: bus.routeId,
                currentLocation: bus.currentLocation,
                isOnline: busOnline,
                lastSeen: bus.currentLocation.lastUpdated,
                eta,
                nearestPickupPoint,
                distance: Math.round(distance * 10) / 10,
            };
        }).filter(bus => {
            if (isOnline === 'true')
                return bus.isOnline;
            if (isOnline === 'false')
                return !bus.isOnline;
            return true;
        });
        res.json({ buses: busLocations });
    }
    catch (error) {
        console.error('Error in getAllBusLocations:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllBusLocations = getAllBusLocations;
const getBusLocationHistory = async (req, res) => {
    try {
        const { busId } = req.params;
        const { hours = 1 } = req.query;
        const timeRange = new Date();
        timeRange.setHours(timeRange.getHours() - Number(hours));
        const locationHistory = await BusLocationHistory_1.default.find({
            busId,
            timestamp: { $gte: timeRange },
        }).sort({ timestamp: -1 });
        res.json({ locationHistory });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getBusLocationHistory = getBusLocationHistory;
const getNearbyBuses = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        const radiusInDegrees = Number(radius) / 111;
        let buses = await Bus_1.default.find({
            isActive: true,
            isOnline: true,
            'currentLocation.latitude': {
                $gte: Number(latitude) - radiusInDegrees,
                $lte: Number(latitude) + radiusInDegrees,
            },
            'currentLocation.longitude': {
                $gte: Number(longitude) - radiusInDegrees,
                $lte: Number(longitude) + radiusInDegrees,
            },
            'currentLocation.lastUpdated': {
                $gte: new Date(Date.now() - 15 * 60 * 1000),
            },
        }).populate('driverId', 'name email phone')
            .populate('routeId', 'name description');
        if (buses.length === 0) {
            console.log('No recent online buses found, trying with 24-hour filter...');
            buses = await Bus_1.default.find({
                isActive: true,
                isOnline: true,
                'currentLocation.latitude': {
                    $gte: Number(latitude) - radiusInDegrees,
                    $lte: Number(latitude) + radiusInDegrees,
                },
                'currentLocation.longitude': {
                    $gte: Number(longitude) - radiusInDegrees,
                    $lte: Number(longitude) + radiusInDegrees,
                },
                'currentLocation.lastUpdated': {
                    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            }).populate('driverId', 'name email phone')
                .populate('routeId', 'name description');
        }
        if (buses.length === 0) {
            console.log('No online buses found with time filter, trying any online buses with location data...');
            buses = await Bus_1.default.find({
                isActive: true,
                isOnline: true,
                $and: [
                    {
                        'currentLocation.latitude': {
                            $gte: Number(latitude) - radiusInDegrees,
                            $lte: Number(latitude) + radiusInDegrees,
                        }
                    },
                    {
                        'currentLocation.longitude': {
                            $gte: Number(longitude) - radiusInDegrees,
                            $lte: Number(longitude) + radiusInDegrees,
                        }
                    },
                    {
                        'currentLocation.latitude': { $ne: null }
                    },
                    {
                        'currentLocation.longitude': { $ne: null }
                    }
                ]
            }).populate('driverId', 'name email phone')
                .populate('routeId', 'name description');
        }
        const nearbyBuses = buses.map(bus => {
            const distance = calculateDistance(Number(latitude), Number(longitude), bus.currentLocation.latitude, bus.currentLocation.longitude);
            const isLocationRecent = bus.currentLocation.lastUpdated &&
                (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 10 * 60 * 1000;
            const isOnline = bus.isOnline && isLocationRecent;
            const route = bus.routeId;
            let directionDisplay = '';
            if (route && bus.currentDirection) {
                if (bus.currentDirection === 'outbound') {
                    directionDisplay = `To ${route.destination || 'Destination'}`;
                }
                else {
                    directionDisplay = `To ${route.origin || 'Origin'}`;
                }
            }
            return {
                id: bus._id,
                plateNumber: bus.plateNumber,
                driver: bus.driverId,
                route: bus.routeId,
                currentLocation: bus.currentLocation,
                distance: Math.round(distance * 100) / 100,
                isOnline: isOnline,
                lastSeen: bus.currentLocation.lastUpdated,
                currentDirection: bus.currentDirection,
                routeOrigin: route?.origin,
                routeDestination: route?.destination,
                directionDisplay,
            };
        }).filter(bus => bus.distance <= Number(radius))
            .sort((a, b) => a.distance - b.distance);
        console.log(`Found ${nearbyBuses.length} nearby online buses within ${radius}km`);
        res.json({ buses: nearbyBuses });
    }
    catch (error) {
        console.error('Error in getNearbyBuses:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getNearbyBuses = getNearbyBuses;
const setDriverOnlineStatus = async (req, res) => {
    try {
        const { busId, isOnline } = req.body;
        const driverId = req.user.id;
        console.log('setDriverOnlineStatus called with:', { busId, isOnline, driverId });
        const allBuses = await Bus_1.default.find({ isActive: true }).select('_id plateNumber driverId');
        console.log('All active buses in database:', allBuses.map(b => ({
            id: b._id.toString(),
            plateNumber: b.plateNumber,
            driverId: b.driverId?.toString() || 'null'
        })));
        let bus = await Bus_1.default.findOne({ _id: busId, driverId });
        console.log('Bus lookup result:', bus ? 'Found' : 'Not found');
        console.log('Looking for bus with driverId:', driverId);
        if (!bus) {
            console.log('Bus not found or not assigned to driver. BusId:', busId, 'DriverId:', driverId);
            const driverBuses = await Bus_1.default.find({ driverId });
            console.log('All buses for this driver:', driverBuses.map(b => ({ id: b._id, plateNumber: b.plateNumber })));
            const busWithDifferentDriver = await Bus_1.default.findOne({ _id: busId });
            if (busWithDifferentDriver) {
                console.log('Bus exists but assigned to different driver:', {
                    busId,
                    assignedDriverId: busWithDifferentDriver.driverId?.toString(),
                    currentDriverId: driverId
                });
                console.log('Auto-reassigning bus to current driver...');
                bus = await Bus_1.default.findByIdAndUpdate(busId, { driverId }, { new: true });
                console.log('Bus reassigned successfully');
            }
            else {
                return res.status(404).json({ error: 'Bus not found or not assigned to you' });
            }
        }
        console.log('Updating bus status:', { busId, isOnline });
        await Bus_1.default.findByIdAndUpdate(busId, { isOnline });
        socketService_1.default.emitBusStatusChange(busId, isOnline);
        console.log('Driver status updated successfully');
        res.json({
            message: `Driver status updated to ${isOnline ? 'online' : 'offline'}`,
        });
    }
    catch (error) {
        console.error('Error in setDriverOnlineStatus:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.setDriverOnlineStatus = setDriverOnlineStatus;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
