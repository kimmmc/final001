import Route from '../models/Route';
import Bus from '../models/Bus';
import BusSchedule from '../models/BusSchedule';

export const migrateDirectionData = async () => {
  try {
    console.log('🔄 Starting direction data migration...');

    // Update routes with direction information
    const routes = await Route.find({});
    console.log(`Found ${routes.length} routes to migrate`);

    for (const route of routes) {
      // Parse the description to extract origin and destination
      const description = route.description || '';
      const parts = description.split(' - ');
      
      if (parts.length >= 2) {
        const origin = parts[0].trim();
        const destination = parts[1].trim();
        
        // Update route with direction information
        await Route.findByIdAndUpdate(route._id, {
          origin,
          destination,
          isBidirectional: true,
        });
        
        console.log(`Updated route ${route.name}: ${origin} → ${destination}`);
      } else {
        // For routes without clear origin-destination format, use defaults
        await Route.findByIdAndUpdate(route._id, {
          origin: 'Kimironko',
          destination: 'Destination',
          isBidirectional: true,
        });
        
        console.log(`Updated route ${route.name} with default direction info`);
      }
    }

    // Update schedules with random direction
    const schedules = await BusSchedule.find({});
    console.log(`Found ${schedules.length} schedules to migrate`);

    for (const schedule of schedules) {
      // Assign random direction if not already set
      if (!schedule.direction) {
        const direction = Math.random() > 0.5 ? 'outbound' : 'inbound';
        await BusSchedule.findByIdAndUpdate(schedule._id, {
          direction,
        });
        
        console.log(`Updated schedule ${schedule._id} with direction: ${direction}`);
      }
    }

    console.log('✅ Direction data migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during direction data migration:', error);
    throw error;
  }
}; 