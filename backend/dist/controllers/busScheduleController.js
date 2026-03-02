"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endTrip = exports.startTrip = exports.deleteBusSchedule = exports.updateUserInterestStatus = exports.getInterestedUsers = exports.updateArrivalTime = exports.updateBusSchedule = exports.getBusScheduleById = exports.getAllBusSchedules = exports.createBusSchedule = void 0;
const BusSchedule_1 = __importDefault(require("../models/BusSchedule"));
const Bus_1 = __importDefault(require("../models/Bus"));
const Route_1 = __importDefault(require("../models/Route"));
const UserInterest_1 = __importDefault(require("../models/UserInterest"));
const socketService_1 = __importDefault(require("../services/socketService"));
const createBusSchedule = async (req, res) => {
    try {
        const { busId, routeId, departureTime, estimatedArrivalTimes } = req.body;
        const bus = await Bus_1.default.findById(busId);
        if (!bus) {
            return res.status(400).json({ error: 'Invalid bus' });
        }
        const route = await Route_1.default.findById(routeId);
        if (!route) {
            return res.status(400).json({ error: 'Invalid route' });
        }
        const busSchedule = new BusSchedule_1.default({
            busId,
            routeId,
            departureTime,
            estimatedArrivalTimes,
        });
        await busSchedule.save();
        const populatedSchedule = await BusSchedule_1.default.findById(busSchedule._id)
            .populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description')
            .populate('estimatedArrivalTimes.pickupPointId', 'name description');
        res.status(201).json({
            message: 'Bus schedule created successfully',
            schedule: populatedSchedule,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createBusSchedule = createBusSchedule;
const getAllBusSchedules = async (req, res) => {
    try {
        const { status, routeId, date } = req.query;
        let query = {};
        if (status)
            query.status = status;
        if (routeId)
            query.routeId = routeId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.departureTime = { $gte: startDate, $lt: endDate };
        }
        const schedules = await BusSchedule_1.default.find(query)
            .populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description origin destination isBidirectional')
            .populate('estimatedArrivalTimes.pickupPointId', 'name description')
            .sort({ departureTime: 1 });
        const schedulesWithDirection = schedules.map(schedule => {
            const scheduleObj = schedule.toObject();
            const route = scheduleObj.routeId;
            let directionDisplay = '';
            if (route && route.isBidirectional) {
                if (scheduleObj.direction === 'outbound') {
                    directionDisplay = `To ${route.destination}`;
                }
                else {
                    directionDisplay = `To ${route.origin}`;
                }
            }
            else {
                directionDisplay = route?.name || 'Unknown Route';
            }
            return {
                ...scheduleObj,
                directionDisplay,
                routeOrigin: route?.origin,
                routeDestination: route?.destination,
            };
        });
        res.json({ schedules: schedulesWithDirection });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
exports.getAllBusSchedules = getAllBusSchedules;
const getBusScheduleById = async (req, res) => {
    try {
        const schedule = await BusSchedule_1.default.findById(req.params.id)
            .populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description')
            .populate('estimatedArrivalTimes.pickupPointId', 'name description');
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule not found' });
        }
        res.json({ schedule });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getBusScheduleById = getBusScheduleById;
const updateBusSchedule = async (req, res) => {
    try {
        const { departureTime, estimatedArrivalTimes, status } = req.body;
        const schedule = await BusSchedule_1.default.findByIdAndUpdate(req.params.id, { departureTime, estimatedArrivalTimes, status }, { new: true }).populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description')
            .populate('estimatedArrivalTimes.pickupPointId', 'name description');
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule not found' });
        }
        res.json({
            message: 'Bus schedule updated successfully',
            schedule,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateBusSchedule = updateBusSchedule;
const updateArrivalTime = async (req, res) => {
    try {
        const { pickupPointId, actualTime } = req.body;
        const schedule = await BusSchedule_1.default.findOneAndUpdate({
            _id: req.params.id,
            'estimatedArrivalTimes.pickupPointId': pickupPointId
        }, {
            $set: { 'estimatedArrivalTimes.$.actualTime': actualTime }
        }, { new: true }).populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description')
            .populate('estimatedArrivalTimes.pickupPointId', 'name description');
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule or pickup point not found' });
        }
        res.json({
            message: 'Arrival time updated successfully',
            schedule,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateArrivalTime = updateArrivalTime;
const getInterestedUsers = async (req, res) => {
    try {
        const interests = await UserInterest_1.default.find({
            busScheduleId: req.params.id,
            status: { $in: ['interested', 'confirmed'] }
        }).populate('userId', 'name email phone')
            .populate('pickupPointId', 'name description');
        res.json({ interests });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getInterestedUsers = getInterestedUsers;
const updateUserInterestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { interestId } = req.params;
        const driverId = req.user.id;
        console.log('updateUserInterestStatus called with:', {
            interestId,
            status,
            driverId,
            userRole: req.user.role,
            headers: req.headers
        });
        const interest = await UserInterest_1.default.findById(interestId)
            .populate({
            path: 'busScheduleId',
            populate: {
                path: 'busId',
                select: 'driverId plateNumber'
            }
        });
        if (!interest) {
            console.log('Interest not found for ID:', interestId);
            return res.status(404).json({ error: 'Interest not found' });
        }
        const busSchedule = interest.busScheduleId;
        const bus = busSchedule?.busId;
        console.log('Authorization check:', {
            interestId,
            driverId,
            busDriverId: bus?.driverId,
            busDriverIdString: bus?.driverId?.toString(),
            busScheduleId: busSchedule?._id,
            busId: bus?._id,
            isMatch: bus?.driverId?.toString() === driverId
        });
        const busDriverId = bus?.driverId;
        const isAuthorized = busDriverId && (busDriverId.toString() === driverId ||
            busDriverId === driverId ||
            (typeof busDriverId === 'object' && busDriverId._id?.toString() === driverId) ||
            (typeof busDriverId === 'object' && busDriverId.toString() === driverId));
        if (!bus || !isAuthorized) {
            console.log('Authorization failed:', {
                driverId,
                busDriverId: busDriverId?.toString(),
                busId: bus?._id,
                isAuthorized,
                busDriverIdType: typeof busDriverId,
                driverIdType: typeof driverId
            });
            return res.status(403).json({
                error: 'Not authorized to manage this interest',
                debug: {
                    driverId,
                    busDriverId: busDriverId?.toString(),
                    busId: bus?._id,
                    driverIdType: typeof driverId,
                    busDriverIdType: typeof busDriverId
                }
            });
        }
        const updatedInterest = await UserInterest_1.default.findByIdAndUpdate(interestId, { status }, { new: true }).populate('userId', 'name email phone')
            .populate('pickupPointId', 'name description')
            .populate('busScheduleId', 'departureTime status');
        if (!updatedInterest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        socketService_1.default.emitInterestStatusUpdateToUser({
            interestId: updatedInterest._id.toString(),
            userId: updatedInterest.userId.toString(),
            status: status,
            busId: bus._id.toString(),
            busScheduleId: busSchedule._id.toString(),
            pickupPointId: updatedInterest.pickupPointId.toString(),
        });
        console.log('Interest updated successfully:', {
            interestId,
            newStatus: status,
            driverId
        });
        res.json({
            message: `Interest ${status} successfully`,
            interest: updatedInterest,
        });
    }
    catch (error) {
        console.error('Error updating user interest status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateUserInterestStatus = updateUserInterestStatus;
const deleteBusSchedule = async (req, res) => {
    try {
        const schedule = await BusSchedule_1.default.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule not found' });
        }
        res.json({ message: 'Bus schedule cancelled successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteBusSchedule = deleteBusSchedule;
const startTrip = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { scheduleId, direction } = req.body;
        console.log('startTrip called with:', { scheduleId, driverId, direction });
        const schedule = await BusSchedule_1.default.findById(scheduleId)
            .populate({
            path: 'busId',
            select: 'driverId plateNumber'
        });
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule not found' });
        }
        const bus = schedule.busId;
        if (!bus || bus.driverId.toString() !== driverId) {
            return res.status(403).json({ error: 'Not authorized to manage this schedule' });
        }
        if (schedule.status === 'in-transit') {
            return res.status(400).json({ error: 'Trip is already in progress' });
        }
        const cleanedInterests = await UserInterest_1.default.deleteMany({
            busScheduleId: scheduleId
        });
        console.log('Cleaned up ALL leftover interests:', {
            scheduleId,
            cleanedCount: cleanedInterests.deletedCount
        });
        if (direction && (direction === 'outbound' || direction === 'inbound')) {
            await BusSchedule_1.default.findByIdAndUpdate(scheduleId, { direction: direction });
            console.log('Updated schedule direction to:', direction);
        }
        const updatedSchedule = await BusSchedule_1.default.findByIdAndUpdate(scheduleId, { status: 'in-transit', actualDepartureTime: new Date() }, { new: true }).populate('busId', 'plateNumber capacity')
            .populate('routeId', 'name description');
        console.log('Trip started successfully:', {
            scheduleId,
            busPlate: bus.plateNumber,
            driverId,
            cleanedInterestsCount: cleanedInterests.deletedCount
        });
        res.json({
            message: 'Trip started successfully',
            schedule: updatedSchedule,
            cleanedInterests: cleanedInterests.deletedCount,
        });
    }
    catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.startTrip = startTrip;
const endTrip = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { scheduleId } = req.body;
        console.log('endTrip called with:', { scheduleId, driverId });
        const schedule = await BusSchedule_1.default.findById(scheduleId)
            .populate({
            path: 'busId',
            select: 'driverId plateNumber'
        });
        if (!schedule) {
            return res.status(404).json({ error: 'Bus schedule not found' });
        }
        const bus = schedule.busId;
        if (!bus || bus.driverId.toString() !== driverId) {
            return res.status(403).json({ error: 'Not authorized to manage this schedule' });
        }
        if (schedule.status !== 'in-transit') {
            return res.status(400).json({ error: 'Trip is not in progress' });
        }
        const deletedInterests = await UserInterest_1.default.deleteMany({
            busScheduleId: scheduleId
        });
        const deletedSchedule = await BusSchedule_1.default.findByIdAndDelete(scheduleId);
        console.log('Trip ended successfully - ALL interests and schedule removed:', {
            scheduleId,
            busPlate: bus.plateNumber,
            driverId,
            deletedInterestsCount: deletedInterests.deletedCount,
            scheduleDeleted: !!deletedSchedule
        });
        res.json({
            message: 'Trip ended successfully. All interests cleared and schedule removed. Driver now waits for new schedule.',
            deletedInterests: deletedInterests.deletedCount,
            scheduleDeleted: true,
        });
    }
    catch (error) {
        console.error('Error ending trip:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.endTrip = endTrip;
