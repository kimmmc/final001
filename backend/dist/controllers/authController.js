"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const user = new User_1.default({
            name,
            email,
            password,
            phone,
            role: role || 'user',
        });
        await user.save();
        const token = generateToken(String(user._id));
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(String(user._id));
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
const logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log('User logout:', { userId, timestamp: new Date().toISOString() });
        res.json({
            message: 'Logout successful',
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.logout = logout;
