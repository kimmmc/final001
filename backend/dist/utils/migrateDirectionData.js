"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateDirectionData = void 0;
const Route_1 = __importDefault(require("../models/Route"));
const BusSchedule_1 = __importDefault(require("../models/BusSchedule"));
const migrateDirectionData = async () => {
    try {
        console.log('🔄 Starting direction data migration...');
        const routes = await Route_1.default.find({});
        console.log(`Found ${routes.length} routes to migrate`);
        for (const route of routes) {
            const description = route.description || '';
            const parts = description.split(' - ');
            if (parts.length >= 2) {
                const origin = parts[0].trim();
                const destination = parts[1].trim();
                await Route_1.default.findByIdAndUpdate(route._id, {
                    origin,
                    destination,
                    isBidirectional: true,
                });
                console.log(`Updated route ${route.name}: ${origin} → ${destination}`);
            }
            else {
                await Route_1.default.findByIdAndUpdate(route._id, {
                    origin: 'Kimironko',
                    destination: 'Destination',
                    isBidirectional: true,
                });
                console.log(`Updated route ${route.name} with default direction info`);
            }
        }
        const schedules = await BusSchedule_1.default.find({});
        console.log(`Found ${schedules.length} schedules to migrate`);
        for (const schedule of schedules) {
            if (!schedule.direction) {
                const direction = Math.random() > 0.5 ? 'outbound' : 'inbound';
                await BusSchedule_1.default.findByIdAndUpdate(schedule._id, {
                    direction,
                });
                console.log(`Updated schedule ${schedule._id} with direction: ${direction}`);
            }
        }
        console.log('✅ Direction data migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during direction data migration:', error);
        throw error;
    }
};
exports.migrateDirectionData = migrateDirectionData;
