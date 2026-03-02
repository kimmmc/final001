"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLocationHistoryCleanup = exports.startLocationScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Bus_1 = __importDefault(require("../models/Bus"));
const checkOfflineBuses = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        await Bus_1.default.updateMany({
            isOnline: true,
            'currentLocation.lastUpdated': { $lt: fiveMinutesAgo }
        }, { isOnline: false });
        console.log('Checked and updated offline buses');
    }
    catch (error) {
        console.error('Error checking offline buses:', error);
    }
};
const startLocationScheduler = () => {
    node_cron_1.default.schedule('* * * * *', checkOfflineBuses);
    console.log('Location scheduler started - checking for offline buses every minute');
};
exports.startLocationScheduler = startLocationScheduler;
const cleanOldLocationHistory = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const BusLocationHistory = require('../models/BusLocationHistory').default;
        const result = await BusLocationHistory.deleteMany({
            timestamp: { $lt: twentyFourHoursAgo }
        });
        console.log(`Cleaned ${result.deletedCount} old location records`);
    }
    catch (error) {
        console.error('Error cleaning old location history:', error);
    }
};
const startLocationHistoryCleanup = () => {
    node_cron_1.default.schedule('0 * * * *', cleanOldLocationHistory);
    console.log('Location history cleanup scheduler started - running every hour');
};
exports.startLocationHistoryCleanup = startLocationHistoryCleanup;
