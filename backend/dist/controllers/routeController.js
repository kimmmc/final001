"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.updateRoute = exports.getRouteById = exports.getAllRoutes = exports.createRoute = void 0;
const Route_1 = __importDefault(require("../models/Route"));
const PickupPoint_1 = __importDefault(require("../models/PickupPoint"));
const createRoute = async (req, res) => {
    try {
        const { name, description, estimatedDuration, fare } = req.body;
        const route = new Route_1.default({
            name,
            description,
            estimatedDuration,
            fare,
        });
        await route.save();
        res.status(201).json({
            message: 'Route created successfully',
            route,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createRoute = createRoute;
const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route_1.default.find({ isActive: true })
            .populate('pickupPoints');
        res.json({ routes });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAllRoutes = getAllRoutes;
const getRouteById = async (req, res) => {
    try {
        const route = await Route_1.default.findById(req.params.id)
            .populate('pickupPoints');
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json({ route });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getRouteById = getRouteById;
const updateRoute = async (req, res) => {
    try {
        const { name, description, estimatedDuration, fare } = req.body;
        const updateData = { name, description, estimatedDuration };
        if (fare !== undefined) {
            updateData.fare = fare;
        }
        const route = await Route_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('pickupPoints');
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json({
            message: 'Route updated successfully',
            route,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateRoute = updateRoute;
const deleteRoute = async (req, res) => {
    try {
        const route = await Route_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        await PickupPoint_1.default.updateMany({ routeId: req.params.id }, { isActive: false });
        res.json({ message: 'Route deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteRoute = deleteRoute;
