"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserInterest = exports.updateUserInterest = exports.getUserInterests = exports.createUserInterest = void 0;
const UserInterest_1 = __importDefault(require("../models/UserInterest"));
const BusSchedule_1 = __importDefault(require("../models/BusSchedule"));
const PickupPoint_1 = __importDefault(require("../models/PickupPoint"));
const Bus_1 = __importDefault(require("../models/Bus"));
const User_1 = __importDefault(require("../models/User"));
const socketService_1 = __importDefault(require("../services/socketService"));
const createUserInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { busScheduleId, pickupPointId } = req.body;
        let busSchedule = await BusSchedule_1.default.findById(busScheduleId);
        if (!busSchedule) {
            console.error('Bus schedule not found for ID:', busScheduleId);
            return res.status(400).json({ error: 'Bus schedule not found' });
        }
        let pickupPointDoc = await PickupPoint_1.default.findById(pickupPointId);
        if (!pickupPointDoc) {
            console.error('Pickup point not found for ID:', pickupPointId);
            return res.status(400).json({ error: 'Pickup point not found' });
        }
        const existingInterest = await UserInterest_1.default.findOne({
            userId,
            busScheduleId,
            status: { $in: ['interested', 'confirmed'] }
        });
        if (existingInterest) {
            return res.status(400).json({ error: 'Already interested in this bus schedule' });
        }
        const userInterest = new UserInterest_1.default({
            userId,
            busScheduleId,
            pickupPointId,
            status: 'interested',
        });
        await userInterest.save();
        const populatedInterest = await UserInterest_1.default.findById(userInterest._id)
            .populate('busScheduleId', 'departureTime status')
            .populate('pickupPointId', 'name description');
        const populatedBusSchedule = populatedInterest.busScheduleId;
        const bus = await Bus_1.default.findById(populatedBusSchedule.busId);
        const user = await User_1.default.findById(userId);
        const pickupPoint = pickupPointDoc;
        if (bus && user && pickupPoint) {
            socketService_1.default.emitUserInterestUpdate({
                busId: bus._id.toString(),
                userId: user._id.toString(),
                userName: user.name,
                pickupPointId: pickupPoint._id.toString(),
                pickupPointName: pickupPoint.name,
                action: 'added',
            });
        }
        res.status(201).json({
            message: 'Interest registered successfully',
            interest: populatedInterest,
        });
    }
    catch (error) {
        console.error('Error creating user interest:', error, req.body);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createUserInterest = createUserInterest;
const getUserInterests = async (req, res) => {
    try {
        const userId = req.user.id;
        const interests = await UserInterest_1.default.find({
            userId,
            status: { $in: ['interested', 'confirmed'] }
        })
            .populate({
            path: 'busScheduleId',
            populate: [
                { path: 'busId', select: 'plateNumber capacity fare' },
                { path: 'routeId', select: 'name description fare' }
            ]
        })
            .populate('pickupPointId', 'name description')
            .sort({ createdAt: -1 });
        res.json({ interests });
    }
    catch (error) {
        console.error('Error fetching user interests:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getUserInterests = getUserInterests;
const updateUserInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;
        const interest = await UserInterest_1.default.findOneAndUpdate({ _id: req.params.id, userId }, { status }, { new: true }).populate('busScheduleId', 'departureTime status')
            .populate('pickupPointId', 'name description');
        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.json({
            message: 'Interest updated successfully',
            interest,
        });
    }
    catch (error) {
        console.error('Error updating user interest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateUserInterest = updateUserInterest;
const deleteUserInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const interest = await UserInterest_1.default.findOneAndUpdate({ _id: req.params.id, userId }, { status: 'cancelled' }, { new: true });
        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.json({ message: 'Interest cancelled successfully' });
    }
    catch (error) {
        console.error('Error deleting user interest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteUserInterest = deleteUserInterest;
