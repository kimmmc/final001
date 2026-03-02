"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInterestStatus = exports.validateDriverStatus = exports.validateBusLocation = exports.validateUserRole = exports.validateUserStatus = exports.validateUserInterest = exports.validateBusSchedule = exports.validatePickupPoint = exports.validateRoute = exports.validateBus = exports.validateLogin = exports.validateSignup = void 0;
const joi_1 = __importDefault(require("joi"));
const validateSignup = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().min(2).max(50),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required().min(6),
        phone: joi_1.default.string().required().min(10).max(15),
        role: joi_1.default.string().valid('user', 'driver', 'admin').default('user'),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateSignup = validateSignup;
const validateLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateLogin = validateLogin;
const validateBus = (req, res, next) => {
    const schema = joi_1.default.object({
        plateNumber: joi_1.default.string().required(),
        capacity: joi_1.default.number().required().min(1),
        driverId: joi_1.default.string().required(),
        routeId: joi_1.default.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateBus = validateBus;
const validateRoute = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().optional(),
        estimatedDuration: joi_1.default.number().required().min(1),
        fare: joi_1.default.number().optional().min(0),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateRoute = validateRoute;
const validatePickupPoint = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().optional(),
        latitude: joi_1.default.number().required(),
        longitude: joi_1.default.number().required(),
        routeId: joi_1.default.string().required(),
        order: joi_1.default.number().required().min(1),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validatePickupPoint = validatePickupPoint;
const validateBusSchedule = (req, res, next) => {
    const schema = joi_1.default.object({
        busId: joi_1.default.string().required(),
        routeId: joi_1.default.string().required(),
        departureTime: joi_1.default.date().required(),
        estimatedArrivalTimes: joi_1.default.array().items(joi_1.default.object({
            pickupPointId: joi_1.default.string().required(),
            estimatedTime: joi_1.default.date().required(),
        })).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateBusSchedule = validateBusSchedule;
const validateUserInterest = (req, res, next) => {
    const schema = joi_1.default.object({
        busScheduleId: joi_1.default.string().required(),
        pickupPointId: joi_1.default.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateUserInterest = validateUserInterest;
const validateUserStatus = (req, res, next) => {
    const schema = joi_1.default.object({
        isActive: joi_1.default.boolean().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateUserStatus = validateUserStatus;
const validateUserRole = (req, res, next) => {
    const schema = joi_1.default.object({
        role: joi_1.default.string().valid('user', 'driver', 'admin').required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateUserRole = validateUserRole;
const validateBusLocation = (req, res, next) => {
    const schema = joi_1.default.object({
        busId: joi_1.default.string().required(),
        latitude: joi_1.default.number().required().min(-90).max(90),
        longitude: joi_1.default.number().required().min(-180).max(180),
        speed: joi_1.default.number().optional().min(0),
        heading: joi_1.default.number().optional().min(0).max(360),
        accuracy: joi_1.default.number().optional().min(0),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateBusLocation = validateBusLocation;
const validateDriverStatus = (req, res, next) => {
    const schema = joi_1.default.object({
        busId: joi_1.default.string().required(),
        isOnline: joi_1.default.boolean().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateDriverStatus = validateDriverStatus;
const validateInterestStatus = (req, res, next) => {
    const schema = joi_1.default.object({
        status: joi_1.default.string().valid('interested', 'confirmed', 'cancelled').required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateInterestStatus = validateInterestStatus;
