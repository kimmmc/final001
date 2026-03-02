"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePickupPoint = exports.updatePickupPoint = exports.getPickupPointById = exports.getAllPickupPoints = exports.createPickupPoint = void 0;
const PickupPoint_1 = __importDefault(require("../models/PickupPoint"));
const Route_1 = __importDefault(require("../models/Route"));
const createPickupPoint = async (req, res) => {
    try {
        const { name, description, latitude, longitude, routeId, order } = req.body;
        const route = await Route_1.default.findById(routeId);
        if (!route) {
            return res.status(400).json({ error: 'Invalid route' });
        }
        const pickupPoint = new PickupPoint_1.default({
            name,
            description,
            latitude,
            longitude,
            routeId,
            order,
        });
        await pickupPoint.save();
        await Route_1.default.findByIdAndUpdate(routeId, { $push: { pickupPoints: pickupPoint._id } });
        res.status(201).json({
            message: 'Pickup point created successfully',
            pickupPoint,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createPickupPoint = createPickupPoint;
const getAllPickupPoints = async (req, res) => {
    try {
        const { routeId } = req.query;
        let query = { isActive: true };
        if (routeId) {
            query.routeId = routeId;
        }
        const pickupPoints = await PickupPoint_1.default.find(query)
            .populate('routeId', 'name description')
            .sort({ order: 1 });
        res.json({ pickupPoints });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllPickupPoints = getAllPickupPoints;
const getPickupPointById = async (req, res) => {
    try {
        const pickupPoint = await PickupPoint_1.default.findById(req.params.id)
            .populate('routeId', 'name description');
        if (!pickupPoint) {
            return res.status(404).json({ error: 'Pickup point not found' });
        }
        res.json({ pickupPoint });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getPickupPointById = getPickupPointById;
const updatePickupPoint = async (req, res) => {
    try {
        const { name, description, latitude, longitude, order } = req.body;
        const pickupPoint = await PickupPoint_1.default.findByIdAndUpdate(req.params.id, { name, description, latitude, longitude, order }, { new: true }).populate('routeId', 'name description');
        if (!pickupPoint) {
            return res.status(404).json({ error: 'Pickup point not found' });
        }
        res.json({
            message: 'Pickup point updated successfully',
            pickupPoint,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updatePickupPoint = updatePickupPoint;
const deletePickupPoint = async (req, res) => {
    try {
        const pickupPoint = await PickupPoint_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!pickupPoint) {
            return res.status(404).json({ error: 'Pickup point not found' });
        }
        await Route_1.default.findByIdAndUpdate(pickupPoint.routeId, { $pull: { pickupPoints: pickupPoint._id } });
        res.json({ message: 'Pickup point deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deletePickupPoint = deletePickupPoint;
