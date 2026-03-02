"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const busScheduleSchema = new mongoose_1.Schema({
    busId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true,
    },
    routeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Route',
        required: true,
    },
    departureTime: {
        type: Date,
        required: true,
    },
    estimatedArrivalTimes: [
        {
            pickupPointId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'PickupPoint',
                required: true,
            },
            estimatedTime: {
                type: Date,
                required: true,
            },
            actualTime: {
                type: Date,
            },
        },
    ],
    status: {
        type: String,
        enum: ['scheduled', 'in-transit', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    direction: {
        type: String,
        enum: ['outbound', 'inbound'],
        default: 'outbound',
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('BusSchedule', busScheduleSchema);
