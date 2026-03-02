"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ubms.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const existingAdmin = await User_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        const admin = new User_1.default({
            name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            phone: '+1234567890',
            role: 'admin',
        });
        await admin.save();
        console.log('Admin user created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
};
exports.createAdminUser = createAdminUser;
