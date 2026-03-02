import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateSignup = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phone: Joi.string().required().min(10).max(15),
    role: Joi.string().valid('user', 'driver', 'admin').default('user'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateBus = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    plateNumber: Joi.string().required(),
    capacity: Joi.number().required().min(1),
    driverId: Joi.string().required(),
    routeId: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateRoute = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    estimatedDuration: Joi.number().required().min(1),
    fare: Joi.number().optional().min(0),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validatePickupPoint = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    routeId: Joi.string().required(),
    order: Joi.number().required().min(1),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateBusSchedule = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    busId: Joi.string().required(),
    routeId: Joi.string().required(),
    departureTime: Joi.date().required(),
    estimatedArrivalTimes: Joi.array().items(
      Joi.object({
        pickupPointId: Joi.string().required(),
        estimatedTime: Joi.date().required(),
      })
    ).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUserInterest = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    busScheduleId: Joi.string().required(),
    pickupPointId: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUserStatus = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    isActive: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUserRole = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    role: Joi.string().valid('user', 'driver', 'admin').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateBusLocation = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    busId: Joi.string().required(),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    speed: Joi.number().optional().min(0),
    heading: Joi.number().optional().min(0).max(360),
    accuracy: Joi.number().optional().min(0),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateDriverStatus = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    busId: Joi.string().required(),
    isOnline: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateInterestStatus = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    status: Joi.string().valid('interested', 'confirmed', 'cancelled').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};