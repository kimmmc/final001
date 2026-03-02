import { Request, Response } from 'express';
import User from '../models/User';
import BusSchedule from '../models/BusSchedule';
import UserInterest from '../models/UserInterest';
import Bus from '../models/Bus';

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    const currentUserId = (req as any).user.id;
    if (userId === currentUserId && isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Prevent admin from changing their own role
    const currentUserId = (req as any).user.id;
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const currentUserId = (req as any).user.id;

    // Prevent admin from deleting themselves
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'driver', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({}),
    ]);

    res.json({
      stats: {
        activeUsers: stats[0],
        activeDrivers: stats[1],
        activeAdmins: stats[2],
        inactiveUsers: stats[3],
        totalUsers: stats[4],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDrivers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isActive = true, page = 1, limit = 10 } = req.query;
    
    // Build query for drivers only
    let query: any = { role: 'driver' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get drivers with pagination
    const drivers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      drivers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalDrivers: total,
        hasNext: skip + drivers.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRegularUsers = async (req: Request, res: Response) => {
  try {
    const { isActive = true, page = 1, limit = 10 } = req.query;
    
    // Build query for regular users only
    let query: any = { role: 'user' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, role } = req.body;
    const user = new User({ name, email, phone, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWeeklyActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('Fetching weekly activity data...');
    
    // Get the start of the week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    console.log('Start of week:', startOfWeek);

    // Get data for each day of the week
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);

      console.log(`Processing day ${i}: ${currentDate} to ${nextDate}`);

      // Count new users for this day
      const newUsers = await User.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });

      // Count new bus schedules for this day
      const newSchedules = await BusSchedule.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });

      // Count user interests for this day
      const newInterests = await UserInterest.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      weeklyData.push({
        name: dayNames[i],
        users: newUsers,
        schedules: newSchedules,
        interests: newInterests,
        trips: newSchedules + Math.floor(newInterests / 2) // Estimate trips based on schedules and interests
      });
    }

    console.log('Weekly data prepared:', weeklyData);
    res.json({ weeklyData });
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('Fetching recent activity data...');
    const { limit = 10 } = req.query;
    const activities = [];

    // Get recent user registrations
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${recentUsers.length} recent users`);

    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        action: 'registered',
        text: `New ${user.role} registered: ${user.name}`,
        time: user.createdAt,
        icon: 'Users'
      });
    });

    // Get recent bus schedules
    const recentSchedules = await BusSchedule.find({})
      .populate('busId', 'plateNumber')
      .populate('routeId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${recentSchedules.length} recent schedules`);

    recentSchedules.forEach(schedule => {
      const busPlateNumber = (schedule.busId as any)?.plateNumber || 'Bus';
      const routeName = (schedule.routeId as any)?.name || 'Route';
      
      activities.push({
        type: 'schedule',
        action: 'created',
        text: `Schedule created for ${busPlateNumber} on ${routeName}`,
        time: schedule.createdAt,
        icon: 'Calendar'
      });
    });

    // Get recent bus status changes (online/offline)
    const recentBuses = await Bus.find({})
      .populate('driverId', 'name')
      .sort({ 'currentLocation.lastUpdated': -1 })
      .limit(5);

    console.log(`Found ${recentBuses.length} recent buses`);

    recentBuses.forEach(bus => {
      if (bus.currentLocation?.lastUpdated) {
        const isOnline = bus.isOnline && 
          (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 5 * 60 * 1000;
        
        activities.push({
          type: 'bus',
          action: isOnline ? 'online' : 'offline',
          text: `Bus ${bus.plateNumber} went ${isOnline ? 'online' : 'offline'}`,
          time: bus.currentLocation.lastUpdated,
          icon: 'Bus'
        });
      }
    });

    // Get recent user interests
    const recentInterests = await UserInterest.find({})
      .populate('userId', 'name')
      .populate('pickupPointId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${recentInterests.length} recent interests`);

    recentInterests.forEach(interest => {
      const userName = (interest.userId as any)?.name || 'User';
      const pickupPointName = (interest.pickupPointId as any)?.name || 'location';
      
      activities.push({
        type: 'interest',
        action: 'added',
        text: `${userName} interested in pickup at ${pickupPointName}`,
        time: interest.createdAt,
        icon: 'MapPin'
      });
    });

    // Sort all activities by time and take the most recent ones
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, Number(limit));

    console.log(`Returning ${sortedActivities.length} activities`);
    res.json({ activities: sortedActivities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};