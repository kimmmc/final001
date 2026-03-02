"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouteDestinations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Route_1 = __importDefault(require("../models/Route"));
const routeDestinationMappings = {
    'Route 302': 'Downtown/CBD',
    'Route 426': 'Masaka',
    'Route 274': 'Musave Terminal',
    'Route 325': 'Kabuga',
    'Route 322': 'Masaka Terminal',
};
const updateRouteDestinations = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://kimclarat23_db_user:qFYOTf3BfF6zDWQE@final.y7h2fks.mongodb.net/?appName=final';
        await mongoose_1.default.connect(mongoURI);
        console.log('Connected to MongoDB');
        const routes = await Route_1.default.find({});
        for (const route of routes) {
            const newDestination = routeDestinationMappings[route.name];
            if (newDestination && route.destination === 'Destination') {
                await Route_1.default.findByIdAndUpdate(route._id, {
                    destination: newDestination
                });
                console.log(`Updated ${route.name} destination to: ${newDestination}`);
            }
        }
        console.log('Route destinations updated successfully!');
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('Error updating route destinations:', error);
        await mongoose_1.default.disconnect();
    }
};
exports.updateRouteDestinations = updateRouteDestinations;
if (require.main === module) {
    (0, exports.updateRouteDestinations)();
}
