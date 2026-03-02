import mongoose from 'mongoose';
import Route from '../models/Route';

// Route destination mappings based on descriptions
const routeDestinationMappings = {
  'Route 302': 'Downtown/CBD',
  'Route 426': 'Masaka',
  'Route 274': 'Musave Terminal',
  'Route 325': 'Kabuga',
  'Route 322': 'Masaka Terminal',
};

export const updateRouteDestinations = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/ubmsdb';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const routes = await Route.find({});

    for (const route of routes) {
      const newDestination = routeDestinationMappings[route.name as keyof typeof routeDestinationMappings];

      if (newDestination && route.destination === 'Destination') {
        await Route.findByIdAndUpdate(route._id, {
          destination: newDestination
        });
        console.log(`Updated ${route.name} destination to: ${newDestination}`);
      }
    }

    console.log('Route destinations updated successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating route destinations:', error);
    await mongoose.disconnect();
  }
};

// Run the script if called directly
if (require.main === module) {
  updateRouteDestinations();
} 